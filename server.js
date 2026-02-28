require("dotenv").config();
const express = require("express");

const uploadRoutes = require("./routes/uploadRoutes");
const deleteRoutes = require("./routes/deleteRoutes");
const authRoutes = require("./routes/authRoutes");
const signatureRoutes = require("./routes/signatureRoutes");

const app = express();

/* ================= MANUAL CORS (BULLETPROOF) ================= */

app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://smart-atkt.netlify.app"
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* ================= BODY PARSERS ================= */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ================= ROUTES ================= */

app.use("/api", uploadRoutes);
app.use("/api", deleteRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/signatures", signatureRoutes.router);

/* ================= HEALTH ================= */

app.get("/health", (req, res) => {
  res.status(200).send("Server is Healthy! 🚀");
});

/* ================= 404 ================= */

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* ================= START ================= */

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Server started on port ${PORT}`);
});