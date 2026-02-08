import prisma from "../prismaClient.js";

export async function allocatePayment(paymentId) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      lease: {
        include: {
          invoices: {
            where: { status: "UNPAID" },
            orderBy: { dueDate: "asc" },
          },
        },
      },
    },
  });

  let remaining = payment.amount;

  for (const invoice of payment.lease.invoices) {
    if (remaining <= 0) break;

    if (remaining >= invoice.amount) {
      remaining -= invoice.amount;
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "PAID" },
      });
    }
  }

  return { allocated: payment.amount - remaining, remaining };
}
