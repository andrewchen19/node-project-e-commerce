// 身分為 admin 的 role，能進行操作
// 身分為 user 的 role，只能處理與 "自身" 相關的操作
// 若非上述兩種，丟出錯誤

const checkPermission = (user, _id) => {
  if (user.role !== "admin") {
    if (user.userId !== _id) {
      // 此函式是在其他路由處理程序中被呼叫的，因此 "不能" return a response back to the client
      // will lead to an error -> one request triggering two different responses
      // 在多層的函式調用中，如果一個內部函式使用了 return，它僅會結束當前的內部函式的執行，而不會影響外部函式的執行
      // 這邊必須 throw an error，讓路由處理程序捕獲 (try catch) 並返回適當的回應給客戶端
      throw new Error("Permission Fail");
    }
  }
};

module.exports = checkPermission;
