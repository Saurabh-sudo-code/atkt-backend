require("dotenv").config();
const express = require("express");
const cors = require("cors");

const uploadRoutes = require("./routes/uploadRoutes");
const deleteRoutes = require("./routes/deleteRoutes");
const authRoutes = require("./routes/authRoutes");
const signatureRoutes = require("./routes/signatureRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://atkt-mgt.netlify.app"
];

// CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    if (allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// FIXED: Using regex that Node 22/Express 5 understands
app.options('(.*)', cors()); 

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api", uploadRoutes);
app.use("/api", deleteRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/signatures", signatureRoutes.router);

app.get("/health", (req, res) => res.status(200).send("Server is Healthy! 🚀"));

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Server started on port ${PORT}`);
});