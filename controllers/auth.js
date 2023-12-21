const User = require("../models/User");
const { registerValidation, loginValidation } = require("../validation");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  // 檢查每個欄位是否格式都正確
  const { error } = registerValidation(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { name, email, password } = req.body;

  // 檢查 DB 裡面是否有重複註冊的 email
  const foundUser = await User.findOne({ email });

  if (foundUser) {
    // Conflict
    return res.status(409).json({ error: "Email is already registered" });
  }

  try {
    // 確保 create user 時， role 都會先是 user (之後再手動修改 role)
    // user.save() 前，會先進到 Mongoose Middleware
    const user = await User.create({ name, email, password });
    // Created
    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ msg: "Unable to store user data" });
  }
};

const login = async (req, res) => {
  // 檢查每個欄位是否格式都正確
  const { error } = loginValidation(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // 檢查是否有此用戶
  const foundUser = await User.findOne({ email: req.body.email });

  if (!foundUser) {
    // Not Found
    return res.status(404).json({
      msg: "User not found, please double-check the email for accuracy",
    });
  }

  // Instance Method (比對輸入的密碼是否與儲存的雜湊值相同)
  const result = await foundUser.comparePassword(req.body.password);

  // result 為 false，代表比對結果不相同
  if (!result) {
    // Unauthorized
    return res
      .status(401)
      .json({ msg: "Password incorrect. Please double-check the password" });
  }

  // 比對結果相同後 (result 為 true)，製作 token
  const tokenUser = {
    userId: foundUser._id,
    userName: foundUser.name,
    userRole: foundUser.role,
  };
  const token = jwt.sign(tokenUser, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // deliver token in a cookie
  res.cookie("token", token, {
    // Flags the cookie to be accessible only by the web server
    httpOnly: true,
    // Expiry date of the cookie in GMT (here is 24 hours)
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    // Marks the cookie to be used with HTTPS only
    // if in the non-production environment (development), it will be false
    secure: process.env.NODE_ENV === "production",
    // Indicates if the cookie should be signed
    signed: true,
  });

  res.status(200).json({
    msg: "Login Successful",
    user: tokenUser,
  });
};

const logout = async (req, res) => {
  // deliver token in a cookie (same name but value is different)
  res.cookie("token", "logout", {
    httpOnly: true,
    // current time (means we won't get back the cookie)
    expires: new Date(Date.now()),
  });

  res.status(200).json({ msg: "Logout Successful" });
};

module.exports = { register, login, logout };
