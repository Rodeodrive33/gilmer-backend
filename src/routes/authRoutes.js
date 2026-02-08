import express from "express";
import admin from "firebase-admin";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// ✅ Verify role route (frontend calls this after login)
router.get("/verify-role", authenticate, async (req, res) => {
  try {
    const user = req.user;
    // Example role check (you can fetch from DB later)
    const role = user.email === "admin@gilmer.com" ? "admin" : "manager";
    res.json({ role });
  } catch (err) {
    res.status(500).json({ error: "Failed to verify role" });
  }
});

export default router;
