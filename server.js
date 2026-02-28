require("dotenv").config();
const express = require("express");

const uploadRoutes = require("./routes/uploadRoutes");
const deleteRoutes = require("./routes/deleteRoutes");
const authRoutes = require("./routes/authRoutes");
const signatureRoutes = require("./routes/signatureRoutes");

const app = express();

/* ================= FORCE CORS FOR ALL REQUESTS ================= */

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* ================= BODY ================= */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ================= ROUTES ================= */

app.use("/api", uploadRoutes);
app.use("/api", deleteRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/signatures", signatureRoutes.router);

/* ================= HEALTH ================= */

app.get("/health", (req, res) => {
  res.send("Server is Healthy 🚀");
});

/* ================= 404 ================= */

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* ================= START ================= */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});