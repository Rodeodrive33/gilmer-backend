// src/controllers/paymentController.js
import prisma from "../config/prismaClient.js";
import {
  sendSMS,
  sendEmail,
  paymentReceivedTemplate,
} from "../services/notificationService.js";

/**
 * Create a new payment and trigger notifications.
 * Expected body:
 * {
 *   tenantId,
 *   amount,
 *   method,
 *   reference?
 * }
 */
export async function createPayment(req, res) {
  try {
    const { tenantId, amount, method, reference } = req.body;
    if (!tenantId || !amount || !method) {
      return res.status(400).json({ error: "tenantId, amount, and method required" });
    }

    // ✅ Create payment record
    const payment = await prisma.payment.create({
      data: {
        tenantId: Number(tenantId),
        amount: Number(amount),
        method,
        reference: reference || null,
      },
      include: {
        tenant: {
          include: {
            user: true,
          },
        },
      },
    });

    // ✅ Update tenant balance (subtract payment)
    await prisma.tenant.update({
      where: { id: Number(tenantId) },
      data: {
        balance: {
          decrement: Number(amount),
        },
      },
    });

    // --- Notify tenant ---
    const tenant = payment.tenant;
    const tenantName = tenant.name;
    const tenantEmail = tenant.user?.email;
    const tenantPhone = tenant.user?.phone;

    const messageText = `Hi ${tenantName}, payment of KES ${amount} received. Ref: ${reference || "N/A"}. Thank you.`;

    // ✅ Send SMS (safe)
    if (tenantPhone) {
      try {
        await sendSMS(tenantPhone, messageText);
        console.log(`📲 SMS sent to ${tenantPhone}`);
      } catch (e) {
        console.warn("⚠️ SMS send failed:", e.message);
      }
    }

    // ✅ Send Email (safe)
    if (tenantEmail) {
      try {
        const html = paymentReceivedTemplate({ tenantName, payment });
        await sendEmail(tenantEmail, "Payment Confirmation", html);
        console.log(`📧 Email sent to ${tenantEmail}`);
      } catch (e) {
        console.warn("⚠️ Email send failed:", e.message);
      }
    }

    // ✅ Create in-app notification record
    await prisma.notification.create({
      data: {
        type: "PAYMENT",
        title: "Payment Received",
        body: `Payment of KES ${amount} has been received.`,
        recipientId: tenant.user?.id || null,
        meta: { tenantId, paymentId: payment.id },
        sent: true,
        channel: "INAPP",
      },
    });

    res.status(201).json({ message: "Payment created & notifications sent", payment });
  } catch (err) {
    console.error("❌ createPayment error:", err);
    res.status(500).json({ error: "Failed to create payment" });
  }
}

/**
 * Get all payments (role-aware)
 */
export async function getPayments(req, res) {
  try {
    const role = req.user.role;
    let where = {};

    if (role === "TENANT") {
      where = { tenantId: req.user.id };
    } else if (role === "PROPERTY_MANAGER") {
      where = { tenant: { propertyManagerId: req.user.id } };
    } else if (role === "CLIENT") {
      const props = await prisma.property.findMany({
        where: { clientId: req.user.id },
        select: { id: true },
      });
      const propIds = props.map((p) => p.id);
      where = { tenant: { unit: { propertyId: { in: propIds } } } };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: { tenant: true, invoice: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(payments);
  } catch (err) {
    console.error("❌ getPayments error:", err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
}

/**
 * Get payment by ID (role-aware)
 */
export async function getPaymentById(req, res) {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({
      where: { id: Number(id) },
      include: { tenant: true, invoice: true },
    });
    res.json(payment);
  } catch (err) {
    console.error("❌ getPaymentById error:", err);
    res.status(500).json({ error: "Failed to fetch payment" });
  }
}

/**
 * Get payments by tenant ID (role-aware)
 */
export async function getPaymentsByTenantId(req, res) {
  try {
    const { id } = req.params;
    const payments = await prisma.payment.findMany({
      where: { tenantId: Number(id) },
      include: { tenant: true, invoice: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(payments);
  } catch (err) {
    console.error("❌ getPaymentsByTenantId error:", err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
}

/**
 * Get payments by invoice ID (role-aware)
 */
export async function getPaymentsByInvoiceId(req, res) {
  try {
    const { id } = req.params;
    const payments = await prisma.payment.findMany({
      where: { invoiceId: Number(id) },
      include: { tenant: true, invoice: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(payments);
  } catch (err) {
    console.error("❌ getPaymentsByInvoiceId error:", err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
}

/**
 * Get payments by property ID (role-aware)
 */
export async function getPaymentsByPropertyId(req, res) {
  try {
    const { id } = req.params;
    const payments = await prisma.payment.findMany({
      where: { tenant: { unit: { propertyId: Number(id) } } },
      include: { tenant: true, invoice: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(payments);
  } catch (err) {
    console.error("❌ getPaymentsByPropertyId error:", err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
}

