// src/routes/notifications.js
import express from "express";
import { body } from "express-validator";
import authenticate from "../middleware/authenticate.js";

import authorize from "../middleware/authorize.js";

import {
  createInAppNotification,
  postSendSms,
  postSendEmail,
  postBulkArrears,
  getMyNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

/* Create in-app notification (Admin/Manager) */
router.post("/inapp", authenticate, authorize("ADMIN", "PROPERTY_MANAGER"), [body("recipientUid").notEmpty(), body("body").notEmpty()], createInAppNotification);

/* Send SMS (Admin/Manager) */
router.post("/sms", authenticate, authorize("ADMIN", "PROPERTY_MANAGER"), [body("phone").notEmpty(), body("message").notEmpty()], postSendSms);

/* Send Email (Admin/Manager) */
router.post("/email", authenticate, authorize("ADMIN", "PROPERTY_MANAGER"), [body("toEmail").notEmpty(), body("subject").notEmpty(), body("html").notEmpty()], postSendEmail);

/* Bulk arrears SMS (Admin/Manager/Client) */
router.post("/bulk/arrears", authenticate, authorize("ADMIN", "PROPERTY_MANAGER", "CLIENT"), [body("threshold").optional().isNumeric()], postBulkArrears);

/* Get my in-app notifications (Tenant/Client/Manager/Admin) */
router.get("/me", authenticate, getMyNotifications);

export default router;
