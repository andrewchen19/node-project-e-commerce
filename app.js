const express = require("express");
const app = express();

const authRoutes = require("./routes/auth_routes");
const userRoutes = require("./routes/user_routes");
const productRoutes = require("./routes/product_routes");
const reviewRoutes = require("./routes/review_routes");
const orderRoutes = require("./routes/order_routes");
const { authTokenMiddleware } = require("./middleware/auth");
const notFound = require("./middleware/not-found");
const connectDB = require("./db/connect");
require("dotenv").config();

// extra packages
// to log HTTP requests and errors, and simplifies the process
const morgan = require("morgan");
// handling cookies
const cookieParser = require("cookie-parser");
// when upload a file, the file will be accessible from req.files
const fileUpload = require("express-fileupload");
// security packages
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// other middlewares
app.use(morgan("tiny"));
app.use(cookieParser(process.env.JWT_SECRET)); // secret string
app.use(fileUpload());
app.use(helmet());
app.use(xss());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60, // Limit each IP to 60 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      msg: "Too many requests from this IP, please try again after 15 minutes",
    },
  })
);

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", authTokenMiddleware, userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/orders", authTokenMiddleware, orderRoutes);

// custom global middleware (after all routes)
app.use(notFound);

// server will start only if we have successfully connected to DB
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.CONNECT_STRING);

    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
