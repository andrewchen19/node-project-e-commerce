// 身分為 admin 的 role，能進行操作
// 身分為 user 的 role，只能處理與 "自身" 相關的操作
// 若非上述兩種，丟出錯誤

const checkPermission = (user, id) => {
  if (user.userRole !== "admin") {
    if (user.userId !== id) {
      // Forbidden
      return res.status(403).json({ msg: "Not authorized to this route" });
    }
  }
};

module.exports = checkPermission;
