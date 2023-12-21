const mongoose = require("mongoose");
const { Schema } = mongoose;

const singleOrderItemSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
});

// schema 的部分
const orderSchema = new Schema(
  {
    tax: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    // we can pass schema in []
    orderItems: [singleOrderItemSchema],
    status: {
      type: String,
      enum: {
        values: ["pending", "failed", "paid", "delivered", "canceled"],
        message: "{VALUE} is not supported",
      },
      default: "pending",
    },
    // 這行代表 user 的值，是來自於 mongoDB users collection 裡面的 primary key
    // 但還是要自行添加 (並非會自動儲存)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientSecret: {
      type: String,
      required: true,
    },
    paymentIntentId: {
      type: String,
    },
  },
  // automatically generate createdAt and updatedAt fields for the document
  { timestamps: true }
);

// model 的部分
const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
