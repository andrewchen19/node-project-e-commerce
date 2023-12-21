const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/user");

// middleware
const { authRoleMiddleware } = require("../middleware/auth");

router.get("/", authRoleMiddleware("admin"), getAllUsers);
// 這個 route 要放在 :_id 的上面，不然 showMe 會被當成是 _id 來看待
router.get("/showMe", showCurrentUser);
router.get("/:_id", getUser);
router.patch("/updateUser", updateUser);
router.patch("/updateUserPassword", updateUserPassword);

module.exports = router;
