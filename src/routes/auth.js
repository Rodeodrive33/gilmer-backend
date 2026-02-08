import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();

// Temporary signup route to demonstrate hashing
router.post("/signup", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Normally you'd save the user to the database here.

    res.json({ message: "Password hashed successfully", hash: hashedPassword });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Simple test route
router.get("/test", (req, res) => {
  res.json({ message: "🔐 Auth route working" });
});

export default router;

