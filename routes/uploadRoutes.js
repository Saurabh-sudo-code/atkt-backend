const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const { v4: uuidv4 } = require("uuid");
const { db, auth, admin } = require("../config/firebase");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Global object to track progress (Note: In production with multiple instances, use Redis)
let uploadProgress = {};

/* ================= UPLOAD STUDENTS ================= */
router.post("/upload-students", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const uploadId = uuidv4();

  uploadProgress[uploadId] = {
    progress: 0,
    added: 0,
    skipped: 0,
    failed: 0,
    completed: false,
  };

  // Immediate response with ID for the frontend to start listening
  res.json({ uploadId });

  // Processing continues in the background
  setTimeout(async () => {
    try {
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      const total = data.length;

      for (let i = 0; i < total; i++) {
        const row = data[i];

        try {
          const {
            FullName,
            CourseName,
            Gender,
            RollNumber,
            MobileNumber,
            EmailId,
          } = row;

          // Skip if essential data is missing
          if (!FullName || !RollNumber || !EmailId || !CourseName) {
            uploadProgress[uploadId].skipped++;
            continue;
          }

          const email = EmailId.toLowerCase().trim();
          const roll = RollNumber.toString().trim();

          // Standardize Course and Year
          const parts = CourseName.trim().split(" ");
          const year = parts[0]; // e.g., "FY"
          const course = parts.slice(1).join(" "); // e.g., "B.Sc CS"

          // Check Firestore
          const existing = await db
            .collection("students")
            .where("email", "==", email)
            .get();

          if (!existing.empty) {
            uploadProgress[uploadId].skipped++;
            continue;
          }

          // Check Firebase Auth
          try {
            await auth.getUserByEmail(email);
            uploadProgress[uploadId].skipped++;
            continue; 
          } catch (e) {
            // User doesn't exist in Auth, we can proceed
          }

          // Create Auth User
          const user = await auth.createUser({
            email,
            password: "Student@msg", // Default password
          });

          const uid = user.uid;

          // Save to 'users' collection for role management
          await db.collection("users").doc(uid).set({
            email,
            role: "student",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Save to 'students' collection for profile data
          await db.collection("students").doc(uid).set({
            fullName: FullName,
            course,
            year,
            gender: Gender || "",
            rollNo: roll,
            mobile: MobileNumber || "",
            email,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          uploadProgress[uploadId].added++;
        } catch (innerErr) {
          console.error("Row Error:", innerErr.message);
          uploadProgress[uploadId].failed++;
        }

        // Update progress percentage
        uploadProgress[uploadId].progress = Math.round(((i + 1) / total) * 100);
      }

      uploadProgress[uploadId].completed = true;
    } catch (err) {
      console.error("Excel Processing Error:", err.message);
    }
  }, 100);
});

/* ================= PROGRESS SSE ================= */
router.get("/upload-progress/:id", (req, res) => {
  const uploadId = req.params.id;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const interval = setInterval(() => {
    const progress = uploadProgress[uploadId];

    if (!progress) {
      clearInterval(interval);
      res.end();
      return;
    }

    res.write(`data: ${JSON.stringify(progress)}\n\n`);

    if (progress.completed) {
      clearInterval(interval);
      res.end();
      // Clean up memory after completion
      setTimeout(() => delete uploadProgress[uploadId], 5000);
    }
  }, 500);
});

module.exports = router;