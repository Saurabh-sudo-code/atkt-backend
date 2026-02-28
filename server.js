require("dotenv").config();
const express = require("express");
const cors = require("cors");

const uploadRoutes = require("./routes/uploadRoutes");
const deleteRoutes = require("./routes/deleteRoutes");
const authRoutes = require("./routes/authRoutes");
const signatureRoutes = require("./routes/signatureRoutes");

const app = express();

// 🔥 FIX: Remove the "/" at the end of Netlify URL
const allowedOrigins = [
  "http://localhost:5173", 
  "https://atkt-mgt.netlify.app" // 👈 REMOVED THE LAST "/"
];

app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow requests with no origin (like mobile/Postman)
    if (!origin) return callback(null, true);

    // 2. Normalize origin: remove trailing slash for exact match
    const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;

    if (allowedOrigins.indexOf(cleanOrigin) !== -1) {
      callback(null, true);
    } else {
      console.log("CORS Blocked Origin:", origin); // Log for debugging in Render
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10mb" }));

// ROUTES
app.use("/", uploadRoutes);
app.use("/", deleteRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/signatures", signatureRoutes.router);

// Health check
app.get("/health", (req, res) => res.send("Server is alive! 🚀"));

const PORT = process.env.PORT || 10000; 

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Server running on port ${PORT}`);
});