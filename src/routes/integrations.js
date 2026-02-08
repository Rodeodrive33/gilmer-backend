// src/routes/integrations.js
import express from "express";
import { body } from "express-validator";
import authenticate from "../middleware/authenticate.js";

import authorize from "../middleware/authorize.js";
import {
  startMpesaPayment,
  reconcileTransaction,
  pushInvoice,
  listExternalTx
} from "../controllers/integrationController.js";

const router = express.Router();

// Start MPESA STK push (Admins, Managers, Clients)
router.post("/mpesa", authenticate, authorize("ADMIN", "PROPERTY_MANAGER", "CLIENT"), [body("tenantId").isInt(), body("amount").isFloat(), body("phone").isString()], startMpesaPayment);

// List external transactions
router.get("/transactions", authenticate, authorize("ADMIN", "PROPERTY_MANAGER", "CLIENT", "TENANT"), listExternalTx);

// Reconcile transaction
router.post("/reconcile", authenticate, authorize("ADMIN", "PROPERTY_MANAGER"), [body("txId").isInt(), body("paymentId").isInt()], reconcileTransaction);

// Push invoice to accounting
router.post("/push-invoice", authenticate, authorize("ADMIN", "PROPERTY_MANAGER"), [body("invoiceId").isInt(), body("provider").isString()], pushInvoice);

export default router;
