// src/controllers/exportController.js
import prisma from "../config/prismaClient.js";

/** Utility: convert array of objects to CSV (simple, robust) */
function toCsv(rows) {
  if (!rows || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (val) => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    if (s.includes('"') || s.includes(",") || s.includes("\n") || s.includes("\r")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [headers.join(",")];
  for (const r of rows) {
    const row = headers.map((h) => escape(r[h]));
    lines.push(row.join(","));
  }
  return lines.join("\n");
}

function sendCsv(res, filename, rows) {
  const csv = toCsv(rows);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csv);
}

/**
 * Export invoices (role-aware)
 * Query: ?format=csv|json&from=YYYY-MM-DD&to=YYYY-MM-DD
 */
export async function exportInvoices(req, res) {
  try {
    const format = (req.query.format || "csv").toLowerCase();
    const from = req.query.from ? new Date(req.query.from) : undefined;
    const to = req.query.to ? new Date(req.query.to) : undefined;

    let where = {};
    if (from) where.createdAt = { gte: from };
    if (to) where.createdAt = { ...where.createdAt, lte: to };

    // role filtering
    if (req.user.role === "PROPERTY_MANAGER") {
      where = { ...where, tenant: { unit: { property: { propertyManagerId: req.user.id } } } };
    } else if (req.user.role === "CLIENT") {
      where = { ...where, tenant: { unit: { property: { clientId: req.user.id } } } };
    } else if (req.user.role === "TENANT") {
      where = { ...where, tenantId: req.user.id };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: { tenant: true, payments: true },
      orderBy: { createdAt: "desc" },
    });

    if (format === "json") return res.json(invoices);

    const rows = invoices.map((inv) => ({
      id: inv.id,
      tenantName: inv.tenant?.name || "",
      tenantEmail: inv.tenant?.email || "",
      amountDue: inv.amountDue,
      status: inv.status,
      dueDate: inv.dueDate?.toISOString?.() || "",
      createdAt: inv.createdAt?.toISOString?.() || "",
      paymentsCount: inv.payments?.length || 0,
    }));

    sendCsv(res, `invoices-${Date.now()}.csv`, rows);
  } catch (err) {
    console.error("❌ exportInvoices:", err);
    res.status(500).json({ error: "Failed to export invoices" });
  }
}

/**
 * Export payments (role-aware)
 */
export async function exportPayments(req, res) {
  try {
    const format = (req.query.format || "csv").toLowerCase();
    const from = req.query.from ? new Date(req.query.from) : undefined;
    const to = req.query.to ? new Date(req.query.to) : undefined;

    let where = {};
    if (from) where.createdAt = { gte: from };
    if (to) where.createdAt = { ...where.createdAt, lte: to };

    // role filtering
    if (req.user.role === "PROPERTY_MANAGER") {
      where = { ...where, tenant: { unit: { property: { propertyManagerId: req.user.id } } } };
    } else if (req.user.role === "CLIENT") {
      where = { ...where, tenant: { unit: { property: { clientId: req.user.id } } } };
    } else if (req.user.role === "TENANT") {
      where = { ...where, tenantId: req.user.id };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: { tenant: true, invoice: true },
      orderBy: { createdAt: "desc" },
    });

    if (format === "json") return res.json(payments);

    const rows = payments.map((p) => ({
      id: p.id,
      tenantName: p.tenant?.name || "",
      invoiceId: p.invoiceId || "",
      amount: p.amount,
      method: p.method,
      reference: p.reference || "",
      createdAt: p.createdAt?.toISOString?.() || "",
    }));

    sendCsv(res, `payments-${Date.now()}.csv`, rows);
  } catch (err) {
    console.error("❌ exportPayments:", err);
    res.status(500).json({ error: "Failed to export payments" });
  }
}

/**
 * Export tenants list (Admin/Manager/Client)
 */
export async function exportTenants(req, res) {
  try {
    const format = (req.query.format || "csv").toLowerCase();

    let where = {};
    if (req.user.role === "PROPERTY_MANAGER") {
      where = { propertyManagerId: req.user.id };
    } else if (req.user.role === "CLIENT") {
      const props = await prisma.property.findMany({ where: { clientId: req.user.id }, select: { id: true } });
      const pIds = props.map((p) => p.id);
      where = { unit: { propertyId: { in: pIds } } };
    }

    const tenants = await prisma.tenant.findMany({
      where,
      include: { user: true, unit: true },
      orderBy: { createdAt: "desc" },
    });

    if (format === "json") return res.json(tenants);

    const rows = tenants.map((t) => ({
      id: t.id,
      name: t.name,
      email: t.email,
      phone: t.phone,
      unitId: t.unit?.id || "",
      unitNumber: t.unit?.unitNumber || "",
      balance: t.balance || 0,
      createdAt: t.createdAt?.toISOString?.() || "",
    }));

    sendCsv(res, `tenants-${Date.now()}.csv`, rows);
  } catch (err) {
    console.error("❌ exportTenants:", err);
    res.status(500).json({ error: "Failed to export tenants" });
  }
}
