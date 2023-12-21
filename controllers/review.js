const Review = require("../models/Review");
const Product = require("../models/Product");

const {
  createReviewValidation,
  updateReviewValidation,
} = require("../validation");

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate("product", ["name"])
      .populate("user", ["name"]);

    res.status(200).json({ reviews, count: reviews.length });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const getReview = async (req, res) => {
  const { _id } = req.params;

  try {
    // populate() -> 除了已有的 ObjectId，還可以拿到其他 collection 的其他 fields
    // populate() 可以使用不只一次
    const review = await Review.findOne(req.params)
      .populate("product", ["name", "company"])
      .populate("user", ["name"]);

    if (!review) {
      // Not Found
      return res.status(404).json({ msg: `No review with id: ${_id}` });
    }

    res.status(200).json({ review });
  } catch (error) {
    if (error.name === "CastError") {
      // Not Found
      return res.status(404).json({ msg: `No review with id: ${_id}` });
    } else {
      res.status(500).json({ msg: error });
    }
  }
};

const createReview = async (req, res) => {
  // 檢查每個欄位是否格式都正確
  const { error } = createReviewValidation(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // alias
  const { product: productId } = req.body;

  // 檢查產品是否存在
  const foundProduct = await Product.findOne({ _id: productId });

  if (!foundProduct) {
    // Not Found
    return res.status(404).json({ msg: `No product with id: ${productId}` });
  }

  try {
    // 儲存時，記得加上，透過 local middleware 儲存在 req.user 裡面的 userId
    // 儲存後，會進到 Mongoose Middleware
    const review = await Review.create({
      ...req.body,
      user: req.user.userId,
    });

    // Created
    res.status(201).json({ review });
  } catch (error) {
    // 搭配 Review.js 所設定的 compound index
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ msg: "Already submitted review for this product" });
    }
    res.status(500).json({ msg: error });
  }
};

const updateReview = async (req, res) => {
  // 檢查每個欄位是否格式都正確
  const { error } = updateReviewValidation(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { _id } = req.params;
  const { rating, title, comment } = req.body;

  try {
    const review = await Review.findOne(req.params);

    if (!review) {
      // Not Found
      return res.status(404).json({ msg: `No review with id: ${_id}` });
    }

    // 檢查更新者是否等同於 create review 的人
    // review.user 會拿到 ObjectId，要用 .toString() 將其轉為字串
    if (review.user.toString() !== req.user.userId) {
      // Forbidden
      return res
        .status(403)
        .json({ msg: "You are not allow to update this review" });
    }

    // 更新的部分
    review.rating = rating;
    review.title = title;
    review.comment = comment;

    // 儲存後，會進到 Mongoose Middleware
    await review.save();

    res.status(200).json({ review });
  } catch (error) {
    if (error.name === "CastError") {
      // Not Found
      return res.status(404).json({ msg: `No review with id: ${_id}` });
    } else {
      res.status(500).json({ msg: error });
    }
  }
};

const deleteReview = async (req, res) => {
  const { _id } = req.params;

  try {
    const review = await Review.findOne(req.params);

    if (!review) {
      // Not Found
      return res.status(404).json({ msg: `No review with id: ${_id}` });
    }

    // 檢查刪除者是否等同於留下評論的人
    // review.user 會拿到 ObjectId，記得要用 .toString() 將其轉為字串
    if (review.user.toString() !== req.user.userId) {
      // Forbidden
      return res
        .status(403)
        .json({ msg: "You are not allow to delete this review" });
    }

    // 這邊必須使用 review (document) 而非 Review (model)
    // 刪除後，會進到 Mongoose Middleware
    await review.deleteOne();

    res.status(200).json({ msg: "Delete Successful" });
  } catch (error) {
    if (error.name === "CastError") {
      // Not Found
      return res.status(404).json({ msg: `No review with id: ${_id}` });
    } else {
      res.status(500).json({ msg: error });
    }
  }
};

const getSingleProductReviews = async (req, res) => {
  // 這邊拿到的 id 會是 "product" 而非 "review"
  // alias
  const { _id: productId } = req.params;

  try {
    // 檢查 product 是否存在
    const foundProduct = await Product.findOne({ _id: productId });

    if (!foundProduct) {
      // Not Found
      return res.status(404).json({ msg: `No product with id: ${productId}` });
    }

    const reviews = await Review.find({
      product: productId,
    }).populate("user", ["name"]);

    res.status(200).json({ reviews, count: reviews.length });
  } catch (error) {
    if (error.name === "CastError") {
      // Not Found
      return res.status(404).json({ msg: `No product with id: ${productId}` });
    } else {
      res.status(500).json({ msg: error });
    }
  }
};

module.exports = {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
