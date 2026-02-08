import express from "express";
import authenticate from "../middleware/authenticate.js";
import requireRole from "../middleware/requireRole.js";

const router = express.Router();

router.post(
  "/send",
  authenticate,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const { to, message } = req.body;

    // Placeholder for Africa's Talking / Twilio
    console.log(`SMS to ${to}: ${message}`);

    res.json({ status: "sent" });
  }
);

export default router;
