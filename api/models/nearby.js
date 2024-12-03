const mongoose = require("mongoose");

const nearbySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  title: { type: String, required: true },
  nearbyImage: { type: String, required: true },
});

module.exports = mongoose.model("Nearby", nearbySchema);
