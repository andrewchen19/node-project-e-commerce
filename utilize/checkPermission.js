// 身分為 admin 的 role，能進行操作
// 身分為 user 的 role，只能處理與 "自身" 相關的操作
// 若非上述兩種，丟出錯誤

const checkPermission = (user, _id) => {
  if (user.role !== "admin") {
    if (user.userId !== _id) {
      // 此函式是在其他路由處理程序中被呼叫的，因此 "不能" 直接返回回應給客戶端
      // 這邊必須拋出錯誤，讓路由處理程序捕獲並返回適當的回應給客戶端
      throw new Error("Permission Fail");
    }
  }
};

module.exports = checkPermission;
