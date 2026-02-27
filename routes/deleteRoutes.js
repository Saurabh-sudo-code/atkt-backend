const express = require("express");
const { db, auth } = require("../config/firebase");
const { verifyAdmin } = require("./signatureRoutes"); // Protection imported here

const router = express.Router();

router.delete("/delete-students", verifyAdmin, async (req, res) => {
  try {
    const { course, year } = req.body;

    if (!course || !year) {
      return res.status(400).json({ error: "Course and Year are required for batch delete" });
    }

    const snapshot = await db
      .collection("students")
      .where("course", "==", course)
      .where("year", "==", year)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No matching students found to delete" });
    }

    let deleted = 0;
    let failed = 0;

    // Sequential deletion to prevent Firebase rate limiting
    for (const docSnap of snapshot.docs) {
      const uid = docSnap.id;
      try {
        await auth.deleteUser(uid);
        await db.collection("users").doc(uid).delete();
        await db.collection("students").doc(uid).delete();
        deleted++;
      } catch (err) {
        console.error(`Failed to delete UID ${uid}:`, err.message);
        failed++;
      }
    }

    res.json({ 
      message: "Batch deletion complete", 
      deleted, 
      failed 
    });
  } catch (err) {
    console.error("Delete Route Error:", err.message);
    res.status(500).json({ error: "Batch delete process failed" });
  }
});

module.exports = router;