const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  uploadImage,
  deleteProduct,
} = require("../controllers/product");
// 這個是從 "review" controller 拿來的
const { getSingleProductReviews } = require("../controllers/review");

// middleware
const { authTokenMiddleware } = require("../middleware/auth");
const { authRoleMiddleware } = require("../middleware/auth");

router.get("/", getAllProducts);
router.get("/:_id", getProduct);
router.get("/:_id/reviews", getSingleProductReviews);
router.post(
  "/",
  // 兩個以上的 middleware 可以用 array 裝起來
  [authTokenMiddleware, authRoleMiddleware("admin")],
  createProduct
);
router.post(
  "/uploadImage",
  [authTokenMiddleware, authRoleMiddleware("admin")],
  uploadImage
);
router.patch(
  "/:_id",
  [authTokenMiddleware, authRoleMiddleware("admin")],
  updateProduct
);
router.delete(
  "/:_id",
  [authTokenMiddleware, authRoleMiddleware("admin")],
  deleteProduct
);

module.exports = router;
