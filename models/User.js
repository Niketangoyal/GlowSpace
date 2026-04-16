const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  number: String,

  // store every OTP attempt here
  otpAttempts: {
    type: [[String]], // array of arrays
    default: []
  },

  attempts: { type: Number, default: 0 }
});

module.exports = mongoose.model("User", userSchema);