const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  price: { type: Number, required: true },
  title: { type: String, required: true },
  address: { type: String, required: true },
  author: { type: String, required: true },
  homeImage: { type: String, required: true },
});

module.exports = mongoose.model("Home", productSchema);
