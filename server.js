require("dotenv").config();
const express = require("express");
const cors = require("cors");

const uploadRoutes = require("./routes/uploadRoutes");
const deleteRoutes = require("./routes/deleteRoutes");
const authRoutes = require("./routes/authRoutes");
const signatureRoutes = require("./routes/signatureRoutes");

const app = express();

// 🔥 CHANGE 1: Secure CORS for Production
const allowedOrigins = [
  "http://localhost:5173", // Local testing
  "https://your-atkt-system.vercel.app" // 👈 REPLACE with your actual Vercel link later
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: "10mb" })); // Increased limit for signature/photo base64 data

// ROUTES
app.use("/", uploadRoutes);
app.use("/", deleteRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/signatures", signatureRoutes.router);

// Health check for Render
app.get("/health", (req, res) => res.send("Server is alive! 🚀"));

// 🔥 CHANGE 2: Dynamic Port for Render
const PORT = process.env.PORT || 10000; 

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Server running on port ${PORT}`);
});