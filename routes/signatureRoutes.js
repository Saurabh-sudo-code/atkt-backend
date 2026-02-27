const express = require("express");
const router = express.Router();
const { db, auth } = require("../config/firebase");

/* ================= VERIFY ADMIN MIDDLEWARE ================= */
// We export this so other routes can use it for security
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = await auth.verifyIdToken(token);
    const userDoc = await db.collection("users").doc(decoded.uid).get();

    if (!userDoc.exists || userDoc.data().role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

/* ================= UPLOAD SIGNATURE ================= */
router.post("/upload", verifyAdmin, async (req, res) => {
  try {
    const { hodSignature, principalSignature } = req.body;

    await db.collection("systemSignatures").doc("main").set({
      hodSignature: hodSignature || "",
      principalSignature: principalSignature || "",
      updatedAt: new Date(),
    }, { merge: true });

    res.json({ message: "Signatures updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to upload signatures" });
  }
});

/* ================= GET SIGNATURE ================= */
router.get("/", async (req, res) => {
  try {
    const snap = await db.collection("systemSignatures").doc("main").get();

    if (!snap.exists) {
      return res.json({});
    }

    res.json(snap.data());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch signatures" });
  }
});

// IMPORTANT: Exporting both the router and the middleware
module.exports = { router, verifyAdmin };