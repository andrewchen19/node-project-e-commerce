const Product = require("../models/Product");
const path = require("path");

const {
  createProductValidation,
  updateProductValidation,
} = require("../validation");

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});

    res.status(200).json({ products, count: products.length });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const getProduct = async (req, res) => {
  const { _id } = req.params;

  try {
    // 沒找到特定的資料時， return null
    const product = await Product.findOne(req.params);

    if (!product) {
      // Not Found
      return res.status(404).json({ msg: `No product with id: ${_id}` });
    }

    res.status(200).json({ product });
  } catch (error) {
    if (error.name === "CastError") {
      // Not Found
      return res.status(404).json({ msg: `No product with id: ${_id}` });
    } else {
      res.status(500).json({ msg: error });
    }
  }
};

const createProduct = async (req, res) => {
  // 檢查每個欄位是否格式都正確
  const { error } = createProductValidation(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // 儲存時，記得加上，透過 local middleware 儲存在 req.user 裡面的 userId
    const product = await Product.create({
      ...req.body,
      user: req.user.userId,
    });

    // Created
    res.status(201).json({ product });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const updateProduct = async (req, res) => {
  // 檢查每個欄位是否格式都正確
  const { error } = updateProductValidation(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { _id } = req.params;

  try {
    // 沒找到特定的資料時， return null
    const product = await Product.findOneAndUpdate(req.params, req.body, {
      runValidators: true,
      new: true,
    });

    if (!product) {
      // Not Found
      return res.status(404).json({ msg: `No product with id: ${_id}` });
    }

    res.status(200).json({ product });
  } catch (error) {
    if (error.name === "CastError") {
      // Not Found
      return res.status(404).json({ msg: `No product with id: ${_id}` });
    } else {
      res.status(500).json({ msg: error });
    }
  }
};

const uploadImage = async (req, res) => {
  // we can access file because we install "express-fileupload" package
  console.log(req.files);

  // check the file exist or not
  // 沒有的話會 return null
  if (!req.files) {
    return res.status(400).json({ msg: "No File upload" });
  }

  const productImage = req.files.image;

  // check file's format
  if (!productImage.mimetype.startsWith("image")) {
    return res.status(400).json({ msg: "Please upload image" });
  }

  // check file's size
  // 1 MB (MegaByte) = 1024 KB (KiloBytes) ; 1 KB = 1024 bytes
  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    return res
      .status(400)
      .json({ msg: "Please upload image smaller than 1MB" });
  }

  // 記得要回到上一層
  // 因為目前的 working directory 是 controllers
  const imagePath = path.join(
    __dirname,
    "../public/uploads",
    productImage.name
  );

  try {
    // move the file elsewhere on your server
    await productImage.mv(imagePath);

    res.status(200).json({
      msg: "upload image success",
      image: { src: `/uploads/${productImage.name}` },
    });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const deleteProduct = async (req, res) => {
  const { _id } = req.params;

  try {
    // 沒找到特定的資料時， return null
    const product = await Product.findOne(req.params);

    if (!product) {
      // Not Found
      return res.status(404).json({ msg: `No product with id: ${_id}` });
    }

    // 這邊必須使用 product (document) 而非 Product (model)
    // 刪除後，會進到 Mongoose Middleware
    await product.deleteOne();

    res.status(200).json({ msg: "Delete Successful" });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      // Not Found
      return res.status(404).json({ msg: `No product with id: ${_id}` });
    } else {
      res.status(500).json({ msg: error });
    }
  }
};

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  uploadImage,
  deleteProduct,
};
