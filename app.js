const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyPaser = require("body-parser");
const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://node-shop:" +
    process.env.MONGO_ATLAS_PW +
    "@node-rest-shop.6683j.mongodb.net/?retryWrites=true&w=majority&appName=node-rest-shop"
);
mongoose.Promise =global.Promise;

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");
const userRoutes = require("./api/routes/user");
const nearby = require("./api/routes/nearby");
const home = require("./api/routes/home");


app.use(morgan("dev"));
app.use('/uploads', express.static('uploads'));
app.use(bodyPaser.urlencoded({ extended: false }));
app.use(bodyPaser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Request-with, content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DE;ETE");
    return res.status(200).json({});
  }
  next();
});

app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/nearby", nearby);
app.use("/home", home);
app.use("/user", userRoutes);


app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    message: error.message,
  });
});

module.exports = app;
