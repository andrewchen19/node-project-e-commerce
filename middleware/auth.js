// custom local middleware

const jwt = require("jsonwebtoken");

const authTokenMiddleware = async (req, res, next) => {
  // 確保每個請求都有提供 token，沒找到 return undefined
  const token = req.signedCookies.token;

  if (!token) {
    // Unauthorized
    return res.status(401).json({ msg: "No token provided" });
  }

  // verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // iat (Issued At) -> indicating the time at which the token was created
    // exp (Expiration Time) -> indicating when the token will expire
    // console.log(decoded);

    const { userId, userName, userRole } = decoded;

    // set up user property with object values
    req.user = { userId, userName, userRole };

    next();
  } catch (error) {
    // 處理 expired 或 invalid token
    return res.status(401).json({ msg: "Not authorized to this route" });
  }
};

// 可能會有多個 roles 可以同時進入某個 route 的情況
// rest parameter (蒐集多個 elements，並壓縮成單個 Array)
const authRoleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userRole)) {
      // Forbidden
      return res.status(403).json({ msg: "Not authorized to this route" });
    }
    next();
  };
};

module.exports = {
  authTokenMiddleware,
  authRoleMiddleware,
};
