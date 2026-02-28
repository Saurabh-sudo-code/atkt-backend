require("dotenv").config();
const express = require("express");
const cors = require("cors");

const uploadRoutes = require("./routes/uploadRoutes");
const deleteRoutes = require("./routes/deleteRoutes");
const authRoutes = require("./routes/authRoutes");
const signatureRoutes = require("./routes/signatureRoutes");

const app = express();

/* ================= SIMPLE & WORKING CORS ================= */

// 🔥 Allow your frontend domains here
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://smart-atkt.netlify.app"
  ],
  credentials: true
}));

// 🔥 Handle preflight requests (DELETE, Authorization, etc.)
app.options("*", cors());

/* ================= BODY PARSERS ================= */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ================= ROUTES ================= */

app.use("/api", uploadRoutes);               // upload-students, upload-progress
app.use("/api", deleteRoutes);               // delete-students
app.use("/api/auth", authRoutes);            // send-otp, reset-password
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