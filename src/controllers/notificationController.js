// src/controllers/notificationController.js
import prisma from "../config/prismaClient.js";
import { sendSMS, sendEmail, invoiceReminderTemplate, paymentReceivedTemplate } from "../services/notificationService.js";

/**
 * Create and save an in-app notification (Admin/Manager can create)
 * Body: { recipientUid, title, body, meta }
 */
export async function createInAppNotification(req, res) {
  try {
    const { recipientUid, title, body: messageBody, meta } = req.body;
    if (!recipientUid || !messageBody) return res.status(422).json({ error: "recipientUid and body required" });

    const user = await prisma.user.findUnique({ where: { uid: recipientUid } });
    if (!user) return res.status(404).json({ error: "Recipient not found" });

    const notif = await prisma.notification.create({
      data: {
        type: "INAPP",
        title: title || null,
        body: messageBody,
        recipientId: user.id,
        meta: meta ? JSON.parse(JSON.stringify(meta)) : null,
        sent: false,
        channel: "INAPP",
      },
    });

    res.status(201).json({ message: "Notification created", notif });
  } catch (err) {
    console.error("❌ createInAppNotification:", err);
    res.status(500).json({ error: "Failed to create notification" });
  }
}

/**
 * Send SMS (and save a Notification record)
 * Body: { phone, message, userUid? }
 */
export async function postSendSms(req, res) {
  try {
    const { phone, message, userUid } = req.body;
    if (!phone || !message) return res.status(422).json({ error: "phone and message required" });

    let recipient = null;
    if (userUid) recipient = await prisma.user.findUnique({ where: { uid: userUid } });

    const result = await sendSMS(phone, message);

    const notif = await prisma.notification.create({
      data: {
        type: "SMS",
        title: null,
        body: message,
        recipientId: recipient ? recipient.id : null,
        meta: recipient ? { userUid } : null,
        sent: true,
        channel: "SMS",
      },
    });

    res.json({ message: "SMS sent (or logged)", result, notif });
  } catch (err) {
    console.error("❌ postSendSms:", err);
    res.status(500).json({ error: "Failed to send SMS" });
  }
}

/**
 * Send Email (and save record)
 * Body: { toEmail, subject, html, userUid? }
 */
export async function postSendEmail(req, res) {
  try {
    const { toEmail, subject, html, userUid } = req.body;
    if (!toEmail || !subject || !html) return res.status(422).json({ error: "toEmail, subject, html required" });

    let recipient = null;
    if (userUid) recipient = await prisma.user.findUnique({ where: { uid: userUid } });

    const result = await sendEmail(toEmail, subject, html);

    const notif = await prisma.notification.create({
      data: {
        type: "EMAIL",
        title: subject,
        body: html,
        recipientId: recipient ? recipient.id : null,
        meta: recipient ? { userUid } : null,
        sent: true,
        channel: "EMAIL",
      },
    });

    res.json({ message: "Email sent (or logged)", result, notif });
  } catch (err) {
    console.error("❌ postSendEmail:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
}

/**
 * Bulk: send arrears SMS to tenants above threshold (role-aware)
 * Body: { threshold }
 */
export async function postBulkArrears(req, res) {
  try {
    const threshold = Number(req.body.threshold || 0);

    // Role filter
    let tenantWhere = { balance: { gte: threshold } };
    if (req.user.role === "PROPERTY_MANAGER") {
      tenantWhere = { ...tenantWhere, propertyManagerId: req.user.id };
    } else if (req.user.role === "CLIENT") {
      // find all tenants under client's properties
      const props = await prisma.property.findMany({ where: { clientId: req.user.id }, select: { id: true } });
      const propIds = props.map(p => p.id);
      tenantWhere = { ...tenantWhere, unit: { propertyId: { in: propIds } } };
    }

    const tenants = await prisma.tenant.findMany({
      where: tenantWhere,
      include: { user: true, unit: true },
    });

    const results = [];
    for (const t of tenants) {
      const phone = t.user?.phone;
      if (!phone) {
        results.push({ tenantId: t.id, skipped: true, reason: "no phone" });
        continue;
      }
      const text = `Dear ${t.name}, your balance is KES ${t.balance}. Please settle promptly.`;
      try {
        const r = await sendSMS(phone, text);
        const notif = await prisma.notification.create({
          data: {
            type: "INFORM",
            title: "Arrears Notice",
            body: text,
            recipientId: t.user?.id || null,
            meta: { tenantId: t.id },
            sent: true,
            channel: "SMS",
          },
        });
        results.push({ tenantId: t.id, sent: true, r, notifId: notif.id });
      } catch (e) {
        results.push({ tenantId: t.id, sent: false, error: e.message });
      }
    }

    res.json({ sentCount: results.filter(r => r.sent).length, results });
  } catch (err) {
    console.error("❌ postBulkArrears:", err);
    res.status(500).json({ error: "Failed to send bulk arrears" });
  }
}

/**
 * Tenant in-app: get notifications for current user (paginated)
 */
export async function getMyNotifications(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const notifications = await prisma.notification.findMany({
      where: { recipientId: req.user.id },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    });

    res.json({ data: notifications, meta: { page, limit } });
  } catch (err) {
    console.error("❌ getMyNotifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
}
