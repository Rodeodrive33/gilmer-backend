import express from "express";
import authenticate from "../middleware/authenticate.js";
import requireRole from "../middleware/requireRole.js";
import { generateReconciliationReport } from "../services/reconciliationService.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  requireRole(["ADMIN"]),
  async (req, res) => {
    const { start, end } = req.query;
    const report = await generateReconciliationReport({
      start: new Date(start),
      end: new Date(end),
    });
    res.json(report);
  }
);

export default router;
