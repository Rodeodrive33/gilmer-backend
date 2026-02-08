import express from "express";
import authenticate from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

// ✅ Get all users (Admin only)
router.get("/", authenticate, authorize(["Admin"]), async (req, res) => {
  try {
    // Example mock — replace with Prisma later
    const users = [
      { id: 1, name: "Admin User", role: "Admin" },
      { id: 2, name: "Manager One", role: "PropertyManager" },
      { id: 3, name: "Tenant X", role: "Tenant" },
    ];
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ✅ Get own profile
router.get("/me", authenticate, async (req, res) => {
  try {
    res.json({ message: "Profile retrieved", user: req.user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export default router;


