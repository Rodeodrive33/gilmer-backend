// src/controllers/financialController.js
import prisma from "../config/prismaClient.js";

/**
 * Get overall financial summary
 * Role-aware (Admin sees all, PM sees own, Client sees own)
 */
export async function getFinancialSummary(req, res) {
  try {
    const role = req.user.role;
    let where = {};

    if (role === "PROPERTY_MANAGER") {
      where = { tenant: { propertyManagerId: req.user.id } };
    } else if (role === "CLIENT") {
      const properties = await prisma.property.findMany({
        where: { clientId: req.user.id },
        select: { id: true },
      });
      const propertyIds = properties.map((p) => p.id);
      where = { tenant: { unit: { propertyId: { in: propertyIds } } } };
    } else if (role === "TENANT") {
      where = { tenantId: req.user.id };
    }

    // Aggregate total payments and invoices
    const totalPayments = await prisma.payment.aggregate({
      _sum: { amount: true },
      where,
    });

    const totalInvoices = await prisma.invoice.aggregate({
      _sum: { amountDue: true },
      where,
    });

    const totalDue =
      (totalInvoices._sum.amountDue || 0) - (totalPayments._sum.amount || 0);

    res.json({
      totalInvoices: totalInvoices._sum.amountDue || 0,
      totalPayments: totalPayments._sum.amount || 0,
      totalDue: totalDue < 0 ? 0 : totalDue,
    });
  } catch (err) {
    console.error("❌ getFinancialSummary error:", err);
    res.status(500).json({ error: "Failed to fetch financial summary" });
  }
}

/**
 * Get monthly rent collection chart data
 */
export async function getMonthlyCollections(req, res) {
  try {
    const data = await prisma.payment.groupBy({
      by: ["createdAt"],
      _sum: { amount: true },
      orderBy: { createdAt: "asc" },
    });

    // Simplify to { month, total }
    const monthly = {};
    for (const record of data) {
      const m = new Date(record.createdAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthly[m] = (monthly[m] || 0) + record._sum.amount;
    }

    const chart = Object.entries(monthly).map(([month, total]) => ({
      month,
      total,
    }));

    res.json(chart);
  } catch (err) {
    console.error("❌ getMonthlyCollections error:", err);
    res.status(500).json({ error: "Failed to fetch monthly collections" });
  }
}

/**
 * Get detailed arrears report (tenants with balances)
 */
export async function getArrearsReport(req, res) {
  try {
    const tenants = await prisma.tenant.findMany({
      where: { balance: { gt: 0 } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        balance: true,
      },
      orderBy: { balance: "desc" },
    });

    res.json({ count: tenants.length, tenants });
  } catch (err) {
    console.error("❌ getArrearsReport error:", err);
    res.status(500).json({ error: "Failed to fetch arrears report" });
  }
}

/**
 * Get tax computation summary
 */
export async function getTaxComputation(req, res) {
  try {
    const payments = await prisma.payment.findMany();
    const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);

    const taxRate = 0.10; // Example 10%
    const taxDue = totalIncome * taxRate;

    res.json({
      totalIncome,
      taxRate,
      taxDue,
    });
  } catch (err) {
    console.error("❌ getTaxComputation error:", err);
    res.status(500).json({ error: "Failed to compute tax" });
  }
}
