// src/routes/access.js
import express from "express";
import { body, param } from "express-validator";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

import {
  logAccess,
  getAccessLogs,
  logMove,
  getMoves,
} from "../controllers/accessController.js";

const router = express.Router();

// Log an access event (Tenant, Admin, Property Manager allowed)
router.post(
  "/log",
  authenticate,
  authorize("TENANT", "ADMIN", "PROPERTY_MANAGER"),
  [body("propertyId").isInt(), body("action").notEmpty().isString()],
  logAccess
);

// Get access logs (role-aware)
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "PROPERTY_MANAGER", "CLIENT", "TENANT"),
  getAccessLogs
);

// Create move record (Admin or Property Manager)
router.post(
  "/move",
  authenticate,
  authorize("ADMIN", "PROPERTY_MANAGER"),
  [body("tenantId").isInt(), body("propertyId").isInt(), body("type").notEmpty().isString()],
  logMove
);

// Get move records
router.get(
  "/move",
  authenticate,
  authorize("ADMIN", "PROPERTY_MANAGER", "CLIENT", "TENANT"),
  getMoves
);

export default router;
