require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import Routes (Based on your folder structure)
const uploadRoutes = require("./routes/uploadRoutes");
const deleteRoutes = require("./routes/deleteRoutes");
const authRoutes = require("./routes/authRoutes");
const signatureRoutes = require("./routes/signatureRoutes");

const app = express();

// 1. FIXED CORS CONFIGURATION
const allowedOrigins = [
  "http://localhost:5173",
  "https://atkt-mgt.netlify.app" // 👈 Ensure NO slash at the end
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps/Postman)
    if (!origin) return callback(null, true);

    // Remove trailing slash from origin string for exact matching
    const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;

    if (allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      console.log("CORS Blocked Origin:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 2. HANDLE PREFLIGHT OPTIONS (Fixes the Preflight Error)
app.options('*', cors());

// 3. BODY PARSERS
app.use(express.json({ limit: "10mb" })); // For large signatures/Excel data
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 4. ROUTE MAPPING (Using Prefix to avoid 404 conflicts)
// Ab aapke endpoints honge: /api/upload-students, /api/auth/login, etc.
app.use("/api", uploadRoutes);    // covers /api/upload-students
app.use("/api", deleteRoutes);    // covers /api/delete-students
app.use("/api/auth", authRoutes); // covers /api/auth/send-otp, etc.
app.use("/api/signatures", signatureRoutes.router); 

// 5. HEALTH CHECK (To keep Render alive)
app.get("/health", (req, res) => {
  res.status(200).send("Backend is Live and Running! 🚀");
});

// 6. PORT CONFIGURATION
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Server started on port ${PORT}`);
});