import express from "express";
import authenticate from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

// ✅ Property Manager dashboard
router.get("/dashboard", authenticate, authorize(["PropertyManager", "Admin"]), async (req, res) => {
  try {
    const dashboardData = {
      totalProperties: 8,
      activeLeases: 25,
      pendingPayments: 7,
      totalRevenue: 640000,
    };
    res.json(dashboardData);
  } catch (error) {
    console.error("Error loading property manager dashboard:", error);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

export default router;




