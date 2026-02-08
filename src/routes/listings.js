// src/routes/listings.js
import express from "express";
import { body, param, query } from "express-validator";
import authenticate from "../middleware/authenticate.js";

import authorize from "../middleware/authorize.js";
import {
  createListing,
  listVacancies,
  manageListings,
  assignTenantToUnit,
  unassignTenantFromUnit,
} from "../controllers/listingController.js";

const router = express.Router();

// Create listing (unit)
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "PROPERTY_MANAGER", "CLIENT"),
  [body("unitNumber").notEmpty().isString(), body("rentAmount").isFloat(), body("propertyId").isInt()],
  createListing
);

// List vacancies (open to all authenticated roles)
router.get(
  "/vacancies",
  authenticate,
  // tenants also can view
  listVacancies
);

// Manage listings (manager/client/admin)
router.get(
  "/manage",
  authenticate,
  authorize("ADMIN", "PROPERTY_MANAGER", "CLIENT"),
  manageListings
);

// Assign tenant (move-in)
router.post(
  "/assign",
  authenticate,
  authorize("ADMIN", "PROPERTY_MANAGER"),
  [body("unitId").isInt(), body("tenantId").isInt()],
  assignTenantToUnit
);

// Unassign tenant (move-out)
router.post(
  "/unassign",
  authenticate,
  authorize("ADMIN", "PROPERTY_MANAGER"),
  [body("unitId").isInt(), body("tenantId").isInt()],
  unassignTenantFromUnit
);

export default router;
