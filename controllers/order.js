const Order = require("../models/Order");
const Product = require("../models/Product");

const {
  createOrderValidation,
  updateOrderValidation,
} = require("../validation");

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "someRandomValue";

  return { client_secret, amount };
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", ["name"]);

    res.status(200).json({ orders, count: orders.length });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const getOrder = async (req, res) => {
  const { _id } = req.params;

  try {
    const order = await Order.findOne(req.params).populate("user", ["name"]);

    if (!order) {
      // Not Found
      return res.status(404).json({ msg: `No order with id: ${_id}` });
    }

    res.status(200).json({ order });
  } catch (error) {
    if (error.name === "CastError") {
      // Not Found
      return res.status(404).json({ msg: `No order with id: ${_id}` });
    } else {
      res.status(500).json({ msg: error });
    }
  }
};

const getCurrentUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).populate(
      "user",
      ["name"]
    );

    res.status(200).json({ orders, count: orders.length });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const createOrder = async (req, res) => {
  // 檢查每個欄位是否格式都正確
  const { error } = createOrderValidation(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { tax, shippingFee, orderItems: cartItems } = req.body;

  let orderItems = [];
  let subtotal = 0;

  // for of loop (used to iterate over iterable objects)
  // unable to do async func in Array.forEach() & Array.map()
  // n => element
  for (const n of cartItems) {
    try {
      const product = await Product.findOne({ _id: n.product });

      if (!product) {
        // Not Found
        return res
          .status(404)
          .json({ msg: `No product with id: ${n.product}` });
      }

      const { name, price, image, _id } = product;

      // 修正 item 的內容
      const singleOrderItem = {
        name,
        price,
        image,
        amount: n.amount,
        product: _id,
      };

      // 加到 orderItems
      orderItems.push(singleOrderItem);
      // calculate subtotal
      subtotal += singleOrderItem.amount * singleOrderItem.price;
    } catch (error) {
      if (error.name === "CastError") {
        // Not Found
        return res
          .status(404)
          .json({ msg: `No product with id: ${n.product}` });
      } else {
        res.status(500).json({ msg: error });
      }
    }
  }
  //console.log(orderItems);
  //console.log(subtotal);

  const total = subtotal + shippingFee + tax;

  // get client secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });

  try {
    const order = await Order.create({
      tax,
      shippingFee,
      subtotal,
      total,
      orderItems,
      user: req.user.userId,
      clientSecret: paymentIntent.client_secret,
    });

    res.status(201).json({ order, clientSecret: order.clientSecret });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const updateOrder = async (req, res) => {
  // 檢查每個欄位是否格式都正確
  const { error } = updateOrderValidation(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { _id } = req.params;
  const { paymentIntentId } = req.body;

  try {
    const order = await Order.findOne(req.params);

    if (!order) {
      // Not Found
      return res.status(404).json({ msg: `No order with id: ${_id}` });
    }

    // 檢查更新者是否等同於 create order 的人
    // order.user 會拿到 ObjectId，要用 .toString() 將其轉為字串
    if (order.user.toString() !== req.user.userId) {
      // Forbidden
      return res
        .status(403)
        .json({ msg: "You are not allow to update this order" });
    }

    // 更新的部分
    order.paymentIntentId = paymentIntentId;
    order.status = "paid";

    await order.save();

    res.status(200).json({ order });
  } catch (error) {
    if (error.name === "CastError") {
      // Not Found
      return res.status(404).json({ msg: `No order with id: ${_id}` });
    } else {
      res.status(500).json({ msg: error });
    }
  }
};

module.exports = {
  getAllOrders,
  getOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
