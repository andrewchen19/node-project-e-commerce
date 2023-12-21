const mongoose = require("mongoose");
const { Schema } = mongoose;

// schema 的部分
const productSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 100,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg",
    },
    category: {
      type: String,
      require: true,
      enum: {
        values: ["office", "kitchen", "bedroom"],
        message: "{VALUE} is not supported",
      },
    },
    company: {
      type: String,
      require: true,
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported",
      },
    },
    colors: {
      type: [String],
      require: true,
      default: ["#222"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    // 這行代表 user 的值，是來自於 mongoDB users collection 裡面的 primary key
    // 但還是要自行添加 (並非會自動儲存)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  // automatically generate createdAt and updatedAt fields for the document
  { timestamps: true }
);

// Mongoose Middleware
// { document: true } → means that the hook will be triggered for the document-specific methods, such as save() & updateOne() & deleteOne()
// post hook 的參數若有 next ，必須擺在第 2 個位置
productSchema.post("deleteOne", { document: true }, async function (_, next) {
  // this 指向刪除的 document
  await this.model("Review").deleteMany({ product: this._id });

  next();
});

// model 的部分
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
