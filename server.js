require("dotenv").config();
const express = require("express");

const uploadRoutes = require("./routes/uploadRoutes");
const deleteRoutes = require("./routes/deleteRoutes");
const authRoutes = require("./routes/authRoutes");
const signatureRoutes = require("./routes/signatureRoutes");

const app = express();

/* ===== VERY SIMPLE GLOBAL CORS ===== */

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://smart-atkt-mgt.netlify.app");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===== ROUTES ===== */

app.use("/api", uploadRoutes);
app.use("/api", deleteRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/signatures", signatureRoutes.router);

app.get("/health", (req, res) => {
  res.send("OK");
});

app.use((req, res) => {
  res.status(404).send("Not Found");
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});