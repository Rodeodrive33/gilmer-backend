// src/controllers/invoiceController.js
import prisma from "../config/prismaClient.js";

/**
 * Create an invoice for a tenant
 */
export async function createInvoice(req, res) {
  try {
    const { tenantId, amountDue, dueDate } = req.body;

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: Number(tenantId),
        amountDue: parseFloat(amountDue),
        dueDate: new Date(dueDate),
      },
    });

    // Increase tenant balance
    await prisma.tenant.update({
      where: { id: Number(tenantId) },
      data: { balance: { increment: parseFloat(amountDue) } },
    });

    res.status(201).json({ message: "Invoice created", invoice });
  } catch (err) {
    console.error("❌ Invoice error:", err);
    res.status(500).json({ error: "Failed to create invoice" });
  }
}

/**
 * List invoices (filtered by role)
 */
export async function listInvoices(req, res) {
  try {
    let where = {};

    if (req.user.role === "TENANT") {
      where = { tenant: { userId: req.user.id } };
    } else if (req.user.role === "PROPERTY_MANAGER") {
      where = { tenant: { unit: { property: { propertyManagerId: req.user.id } } } };
    } else if (req.user.role === "CLIENT") {
      where = { tenant: { unit: { property: { clientId: req.user.id } } } };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: { tenant: true, payments: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(invoices);
  } catch (err) {
    console.error("❌ Error listing invoices:", err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(req, res) {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(id) },
      include: { tenant: true, payments: true },
    });
    res.json(invoice);
  } catch (err) {
    console.error("❌ Error fetching invoice:", err);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
}
