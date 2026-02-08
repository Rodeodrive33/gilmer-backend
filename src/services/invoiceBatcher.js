import prisma from "../config/prismaClient.js";

export async function generateMonthlyInvoices() {
  const leases = await prisma.lease.findMany({
    include: { property: true }
  });

  const today = new Date();

  for (const lease of leases) {
    await prisma.invoice.create({
      data: {
        leaseId: lease.id,
        amount: 50000, // replace with lease.rent if you have it
        dueDate: new Date(today.getFullYear(), today.getMonth(), 5),
        status: "PENDING"
      }
    });
  }

  console.log("✅ Monthly invoices generated");
}
