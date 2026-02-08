// src/routes/financial.js
import express from "express";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

import {
  getFinancialSummary,
  getMonthlyCollections,
  getArrearsReport,
  getTaxComputation,
} from "../controllers/financialController.js";

const router = express.Router();

// ✅ Main dashboard summary
router.get(
  "/summary",
  authenticate,
  authorize("ADMIN", "PROPERTY_MANAGER", "CLIENT"),
  getFinancialSummary
);

// ✅ Monthly rent collection chart data
router.get(
  "/monthly-collections",
  authenticate,
  authorize("ADMIN", "PROPERTY_MANAGER", "CLIENT"),
  getMonthlyCollections
);

// ✅ Arrears report
router.get(
  "/arrears",
  authenticate,
  authorize("ADMIN", "PROPERTY_MANAGER", "CLIENT"),
  getArrearsReport
);

// ✅ Tax computation
router.get(
  "/tax",
  authenticate,
  authorize("ADMIN"),
  getTaxComputation
);

export default router;
