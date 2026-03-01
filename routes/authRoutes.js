const express = require("express");
const axios = require("axios");
const { auth } = require("../config/firebase");
const otpStore = require("../utils/otpStore");

const router = express.Router();

/* ================= SEND OTP ================= */
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // 1️⃣ Check if user exists in Firebase
    await auth.getUserByEmail(email);

    // 2️⃣ Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3️⃣ Store OTP with 5 mins expiry
    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    // 4️⃣ Send Email via Brevo API (HTTP, not SMTP)
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "ATKT System",
          email: process.env.MAIL_USER,
        },
        to: [{ email }],
        subject: "Password Reset OTP - ATKT System",
        htmlContent: `
          <div style="font-family: Arial; padding: 20px;">
            <h2>Password Reset Request</h2>
            <p>Your OTP is:</p>
            <h1 style="letter-spacing:5px;">${otp}</h1>
            <p>This OTP is valid for 5 minutes.</p>
          </div>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error(
      "Send OTP Error:",
      error.response?.data || error.message
    );

    if (error.code === "auth/user-not-found") {
      return res.status(404).json({
        error: "This email is not registered in our system",
      });
    }

    res.status(500).json({
      error: "Failed to send OTP. Please try again later.",
    });
  }
});

/* ================= RESET PASSWORD ================= */
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const record = otpStore[email];

    if (!record || record.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP code" });
    }

    if (record.expires < Date.now()) {
      delete otpStore[email];
      return res.status(400).json({ error: "OTP has expired" });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password: newPassword });

    delete otpStore[email];

    res.json({
      message: "Password updated successfully! You can now login.",
    });

  } catch (error) {
    console.error("Reset Error:", error.message);
    res.status(500).json({
      error: "Internal server error during password reset",
    });
  }
});

module.exports = router;