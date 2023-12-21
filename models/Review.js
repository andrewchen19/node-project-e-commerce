const mongoose = require("mongoose");
const { Schema } = mongoose;

// schema 的部分
const reviewSchema = new Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
    },
    // 這行代表 user 的值，是來自於 mongoDB users collection 裡面的 primary key
    // 但還是要自行添加 (並非會自動儲存)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // 這行代表 product 的值，是來自於 mongoDB products collection 裡面的 primary key
    // 但還是要自行添加 (並非會自動儲存)
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  // automatically generate createdAt and updatedAt fields for the document
  { timestamps: true }
);

// Compound Index
// 1 or -1 -> 代表 ascending 或者 descending order
// 建立一個 unique index，確保在該 Schema 的資料中這兩個 field 的組合值不會重複 (代表一個用戶只能對同一個商品留下一個評論)
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Static Method
// 若我們希望某個 Model 可以使用某個 method 時，可以將 method 定義在 Schema 上
// 而 Model 所建立的實例 (instance，也就是 document) 無法拿取
reviewSchema.statics.calculateAverageRating = async function (id) {
  // 這邊的 id 會是 mongoose object
  // console.log(id);

  // 這邊的 this 指向 model
  let result = await this.aggregate([
    { $match: { product: id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  console.log(result);
  // [ { _id: null, averageRating: 3, numOfReviews: 2 } ] -> product with reviews
  // [] -> product without any of review

  try {
    await this.model("Product").findOneAndUpdate(
      { _id: id.toString() },
      {
        // Optional Chaining
        // 0 -> falsy value
        numOfReviews: result[0]?.numOfReviews || 0,
        averageRating: result[0]?.averageRating.toFixed(1) || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

// Mongoose Middleware
// post hook 的參數若有 next ，必須擺在第 2 個位置
reviewSchema.post("save", async function (_, next) {
  // this 指向儲存的 document
  await this.model("Review").calculateAverageRating(this.product);
  next();
});
reviewSchema.post("deleteOne", { document: true }, async function (_, next) {
  // this 指向刪除的 document
  await this.model("Review").calculateAverageRating(this.product);
  next();
});

// model 的部分
const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
