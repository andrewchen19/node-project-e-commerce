const express = require("express");
const router = express.Router();

const {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/review");

// middleware
const { authTokenMiddleware } = require("../middleware/auth");

router.get("/", getAllReviews);
router.get("/:_id", getReview);
router.post("/", authTokenMiddleware, createReview);
router.patch("/:_id", authTokenMiddleware, updateReview);
router.delete("/:_id", authTokenMiddleware, deleteReview);

module.exports = router;
