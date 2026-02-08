import prisma from "../prismaClient.js";
import { sendSMS } from "./smsService.js";

export async function createInvoice(leaseId, amount, dueDate) {
  const invoice = await prisma.invoice.create({
    data: {
      leaseId,
      amount,
      dueDate,
      status: "UNPAID",
    },
    include: {
      lease: {
        include: {
          tenant: true,
        },
      },
    },
  });

  await sendSMS(
    invoice.lease.tenant.email,
    `Invoice of ${amount} created. Due by ${dueDate.toDateString()}`
  );

  return invoice;
}

export async function markInvoicePaid(invoiceId) {
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "PAID" },
  });
}