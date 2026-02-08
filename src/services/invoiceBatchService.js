import prisma from "../config/prismaClient.js";

export async function batchInvoices() {
  const leases = await prisma.lease.findMany({ where: { startDate: { lte: new Date() } } });
  for (const lease of leases) {
    await prisma.invoice.create({
      data: {
        amount: 1000, // replace with dynamic calculation
        status: "Pending",
        dueDate: new Date(Date.now() + 7*24*60*60*1000),
        leaseId: lease.id
      }
    });
  }
}
