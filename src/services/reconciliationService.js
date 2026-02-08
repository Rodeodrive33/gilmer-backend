import prisma from "../prismaClient.js";

export async function generateReconciliationReport({ start, end }) {
  const payments = await prisma.payment.findMany({
    where: {
      paidAt: { gte: start, lte: end },
    },
  });

  const invoices = await prisma.invoice.findMany({
    where: {
      createdAt: { gte: start, lte: end },
    },
  });

  const totalPayments = payments.reduce((s, p) => s + p.amount, 0);
  const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0);

  const unpaidInvoices = invoices.filter(i => i.status !== "PAID");

  return {
    period: { start, end },
    totals: {
      payments: totalPayments,
      invoiced: totalInvoiced,
      variance: totalPayments - totalInvoiced,
    },
    unpaidInvoices,
  };
}
