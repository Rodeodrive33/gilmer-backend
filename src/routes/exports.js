// src/routes/exports.js
import express from "express";
import authenticate from "../middleware/authenticate.js";

import authorize from "../middleware/authorize.js";

import { exportInvoices, exportPayments, exportTenants } from "../controllers/exportController.js";

const router = express.Router();

// invoices - Admin/Manager/Client/Tenant
router.get("/invoices", authenticate, authorize("ADMIN", "PROPERTY_MANAGER", "CLIENT", "TENANT"), exportInvoices);

// payments - Admin/Manager/Client/Tenant
router.get("/payments", authenticate, authorize("ADMIN", "PROPERTY_MANAGER", "CLIENT", "TENANT"), exportPayments);

// tenants - Admin/Manager/Client
router.get("/tenants", authenticate, authorize("ADMIN", "PROPERTY_MANAGER", "CLIENT"), exportTenants);

export default router;
