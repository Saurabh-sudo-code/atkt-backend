require("dotenv").config();
const express = require("express");
const cors = require("cors");

const uploadRoutes = require("./routes/uploadRoutes");
const deleteRoutes = require("./routes/deleteRoutes");
const authRoutes = require("./routes/authRoutes");
const signatureRoutes = require("./routes/signatureRoutes");

const app = express();

/* ================= CORS CONFIG (FINAL FIX) ================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://atkt-mgt.netlify.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (mobile apps, postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(null, false); // don't throw error, just block
    }
  },
  credentials: true,
}));

// VERY IMPORTANT → Handle preflight requests properly
app.options("*", cors({
  origin: allowedOrigins,
  credentials: true
}));

/* ================= BODY PARSERS ================= */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ================= ROUTES ================= */

app.use("/api", uploadRoutes);              // upload-students, upload-progress
app.use("/api", deleteRoutes);              // delete-students
app.use("/api/auth", authRoutes);           // send-otp, reset-password
app.use("/api/signatures", signatureRoutes.router); // upload signature

/* ================= HEALTH CHECK ================= */

app.get("/health", (req, res) => {
  res.status(200).send("Server is Healthy! 🚀");
});

/* ================= GLOBAL 404 ================= */

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Server started on port ${PORT}`);
});