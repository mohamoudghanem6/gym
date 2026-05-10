const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: String,
  phone: String,
  subscriptionEnd: Date,
});

module.exports = mongoose.model("Member", memberSchema);
