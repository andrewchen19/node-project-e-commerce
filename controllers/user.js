const User = require("../models/User");
const {
  updatePasswordValidation,
  updateUserValidation,
} = require("../validation");
const jwt = require("jsonwebtoken");

const checkPermission = require("../utilize/checkPermission");

const getAllUsers = async (req, res) => {
  try {
    // method chaining (exclude password 這個欄位)
    let users = await User.find({ role: "user" }).select("-password");

    res.status(200).json({ users, count: users.length });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const getUser = async (req, res) => {
  const { _id } = req.params;

  checkPermission(req.user, _id);

  try {
    // 沒找到特定的資料時， return null
    const user = await User.findOne(req.params).select("-password");

    if (!user) {
      // Not Found
      return res.status(404).json({ msg: `No user with id: ${_id}` });
    }

    res.status(200).json({ user });
  } catch (error) {
    if (error.name === "CastError") {
      // Not Found
      return res.status(404).json({ msg: `No user with id: ${_id}` });
    } else {
      res.status(500).json({ msg: error });
    }
  }
};

const showCurrentUser = async (req, res) => {
  res.status(200).json({ user: req.user });
};

const updateUser = async (req, res) => {
  // 檢查每個欄位是否格式都正確
  const { error } = updateUserValidation(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { name, email } = req.body;

  const updatedUser = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { name, email },
    {
      runValidators: true,
      new: true,
    }
  );

  // 重新製作 token
  const tokenUser = {
    userId: updatedUser._id,
    userName: updatedUser.name,
    userRole: updatedUser.role,
  };
  const token = jwt.sign(tokenUser, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  // deliver token in a cookie
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });

  res.status(200).json({ msg: "Update user successful", user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  // 檢查每個欄位是否格式都正確
  const { error } = updatePasswordValidation(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const user = await User.findOne({ _id: req.user.userId });

  if (!user) {
    // Not Found
    return res.status(404).json({ msg: `No user with id: ${req.user.userId}` });
  }

  const { oldPassword, newPassword } = req.body;

  // Instance Method (比對輸入的"舊"密碼是否與儲存的雜湊值相同)
  const result = await user.comparePassword(oldPassword);

  // result 為 false，代表比對結果不相同
  if (!result) {
    // Unauthorized
    return res.status(401).json({
      msg: "Password incorrect. Please double-check the old password",
    });
  }

  // 比對結果相同後 (result 為 true)，將"舊"密碼更換成"新"密碼
  user.password = newPassword;

  try {
    // 儲存前，會先進到 Mongoose Middleware
    await user.save();

    res.status(200).json({ msg: "Success!! Password updated" });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

module.exports = {
  getAllUsers,
  getUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
