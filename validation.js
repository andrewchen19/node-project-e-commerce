const Joi = require("joi");

// 當有人要註冊我們系統的話，必須先通過此驗證
const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(50).messages({
      "any.required": "Name must be provided",
      "string.empty": "Name cannot be empty",
      "string.min": "Name should have a minimum length of {#limit} characters",
      "string.max": "Name should have a maximum length of {#limit} characters",
    }),
    // email() -> 必須是有效的 email 格式
    email: Joi.string().email().required().messages({
      "any.required": "Email must be provided",
      "string.empty": "Email cannot be empty",
      "string.email": "Email must be a valid email address",
    }),
    password: Joi.string().required().min(5).messages({
      "any.required": "Password must be provided",
      "string.empty": "Password cannot be empty",
      "string.min":
        "Password should have a minimum length of {#limit} characters",
    }),
    role: Joi.string().valid("admin", "user").default("user").messages({
      "any.only": "Role must be one of: admin, user",
    }),
  });

  return schema.validate(data);
};

// 當有人要登入我們系統的話，必須先通過此驗證
// 這邊的 password 不用限定字數 (只是登入而已)
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email must be provided",
      "string.empty": "Email cannot be empty",
      "string.email": "Email must be a valid email address",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password must be provided",
      "string.empty": "Password cannot be empty",
    }),
  });

  return schema.validate(data);
};

// 當有人要更新密碼的話，必須先通過此驗證
// 這邊的 oldPassword 不用限定字數 (因為之後會驗證是否和儲存在 DB 的雜湊值相同)
const updatePasswordValidation = (data) => {
  const schema = Joi.object({
    oldPassword: Joi.string().required().messages({
      "any.required": "Old password must be provided",
      "string.empty": "Old password cannot be empty",
    }),
    newPassword: Joi.string().required().min(5).messages({
      "any.required": "New password must be provided",
      "string.empty": "New Password cannot be empty",
      "string.min":
        "New password should have a minimum length of {#limit} characters",
    }),
  });

  return schema.validate(data);
};

// 當有人要更新資料的話，必須先通過此驗證
const updateUserValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(50).messages({
      "any.required": "Name must be provided",
      "string.empty": "Name cannot be empty",
      "string.min": "Name should have a minimum length of {#limit} characters",
      "string.max": "Name should have a maximum length of {#limit} characters",
    }),
    // email() -> 必須是有效的 email 格式
    email: Joi.string().email().required().messages({
      "any.required": "Email must be provided",
      "string.empty": "Email cannot be empty",
      "string.email": "Email must be a valid email address",
    }),
  });

  return schema.validate(data);
};

// 當有人要創建商品的話，必須先通過此驗證
const createProductValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().max(100).messages({
      "any.required": "Product name must be provided",
      "string.empty": "Product name cannot be empty",
      "string.max":
        "Product name should have a maximum length of {#limit} characters",
    }),
    price: Joi.number().default(0),
    description: Joi.string().required().max(1000).messages({
      "any.required": "Product description must be provided",
      "string.empty": "Product description cannot be empty",
      "string.max":
        "Product description should have a maximum length of {#limit} characters",
    }),
    image: Joi.string().default("/uploads/example.jpeg"),
    category: Joi.string()
      .required()
      .valid("office", "kitchen", "bedroom")
      .messages({
        "any.required": "Category must be provided",
        "any.only": "Category must be one of: office, kitchen, bedroom",
      }),
    company: Joi.string().required().valid("ikea", "liddy", "marcos").messages({
      "any.required": "Company must be provided",
      "any.only": "Company must be one of: ikea, liddy, marcos",
    }),
    colors: Joi.array().items(Joi.string()).default(["#222"]).messages({
      "array.base": "Colors must be an array",
      "array.includesRequiredUnknowns": "Colors must contain only strings",
    }),
    featured: Joi.boolean().default(false),
    freeShipping: Joi.boolean().default(false),
    inventory: Joi.number().default(15),
    averageRating: Joi.number().default(0),
    numOfReviews: Joi.number().default(0),
  });

  return schema.validate(data);
};

// 當有人要更新商品的話，必須先通過此驗證
// 刪除 required() 的部分
const updateProductValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().max(100).messages({
      "string.empty": "Product name cannot be empty",
      "string.max":
        "Product name should have a maximum length of {#limit} characters",
    }),
    price: Joi.number().default(0),
    description: Joi.string().max(1000).messages({
      "string.empty": "Product description cannot be empty",
      "string.max":
        "Product description should have a maximum length of {#limit} characters",
    }),
    image: Joi.string().default("/uploads/example.jpeg"),
    category: Joi.string().valid("office", "kitchen", "bedroom").messages({
      "any.only": "Category must be one of: office, kitchen, bedroom",
    }),
    company: Joi.string().valid("ikea", "liddy", "marcos").messages({
      "any.only": "Company must be one of: ikea, liddy, marcos",
    }),
    colors: Joi.array().items(Joi.string()).default(["#222"]).messages({
      "array.base": "Colors must be an array",
      "array.includesRequiredUnknowns": "Colors must contain only strings",
    }),
    featured: Joi.boolean().default(false),
    freeShipping: Joi.boolean().default(false),
    inventory: Joi.number().default(15),
    averageRating: Joi.number().default(0),
    numOfReviews: Joi.number().default(0),
  });

  return schema.validate(data);
};

// 當有人要創建評論的話，必須先通過此驗證
const createReviewValidation = (data) => {
  const schema = Joi.object({
    rating: Joi.number().min(1).max(5).required().messages({
      "any.required": "Review rating is required",
      "number.min": "Review rating must be at least 1",
      "number.max": "Review rating must be at most 5",
    }),
    title: Joi.string().required().max(100).messages({
      "any.required": "Review title description must be provided",
      "string.empty": "Review title cannot be empty",
      "string.max":
        "Review title should have a maximum length of {#limit} characters",
    }),
    comment: Joi.string().required().messages({
      "any.required": "Review comment must be provided",
      "string.empty": "Review comment cannot be empty",
    }),
    product: Joi.string().required().messages({
      "any.required": "Product Id must be provided",
      "string.empty": "Product Id cannot be empty",
    }),
  });

  return schema.validate(data);
};

// 當有人要更新評論的話，必須先通過此驗證
// 刪除 required() 的部分
const updateReviewValidation = (data) => {
  const schema = Joi.object({
    rating: Joi.number().min(1).max(5).messages({
      "number.min": "Review rating must be at least 1",
      "number.max": "Review rating must be at most 5",
    }),
    title: Joi.string().max(100).messages({
      "string.empty": "Review title cannot be empty",
      "string.max":
        "Review title should have a maximum length of {#limit} characters",
    }),
    comment: Joi.string().messages({
      "string.empty": "Review comment cannot be empty",
    }),
  });

  return schema.validate(data);
};

// 當有人要更新訂單的話，必須先通過此驗證
const updateOrderValidation = (data) => {
  const schema = Joi.object({
    paymentIntentId: Joi.string().required().messages({
      "any.required": "PaymentIntentId must be provided",
      "string.empty": "PaymentIntentId cannot be empty",
    }),
  });

  return schema.validate(data);
};

module.exports = {
  registerValidation,
  loginValidation,
  updatePasswordValidation,
  updateUserValidation,
  createProductValidation,
  updateProductValidation,
  createReviewValidation,
  updateReviewValidation,
  updateOrderValidation,
};
