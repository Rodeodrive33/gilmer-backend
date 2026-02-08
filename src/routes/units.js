// src/routes/units.js
import express from "express";
import { body } from "express-validator";
import authenticate from "../middleware/authenticate.js";

import authorize from "../middleware/authorize.js";
import { createUnit, listUnits } from "../controllers/unitController.js";

const router = express.Router();

// Create unit (Admin + Property Manager)
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "PROPERTY_MANAGER"),
  [
    body("unitNumber").notEmpty().isString(),
    body("rentAmount").notEmpty().isFloat(),
    body("propertyId").notEmpty().isInt(),
  ],
  createUnit
);

// List units (filtered by role)
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "PROPERTY_MANAGER", "CLIENT", "TENANT"),
  listUnits
);

export default router;
