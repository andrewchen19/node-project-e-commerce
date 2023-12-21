const express = require("express");
const router = express.Router();

const {
  getAllOrders,
  getOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
} = require("../controllers/order");

// middleware
const { authRoleMiddleware } = require("../middleware/auth");

router.get("/", authRoleMiddleware("admin"), getAllOrders);
// 注意順序
router.get("/showAllMyOrders", getCurrentUserOrders);
router.get("/:_id", getOrder);
router.post("/", createOrder);
router.patch("/:_id", updateOrder);

module.exports = router;
