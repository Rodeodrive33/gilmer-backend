import prisma from "../prismaClient.js";

export function computeVAT(amount) {
  const rate = 0.16;
  return {
    rate,
    tax: amount * rate,
  };
}

export async function attachTax(invoiceId) {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  const { rate, tax } = computeVAT(invoice.amount);

  return prisma.taxRecord.create({
    data: {
      invoiceId,
      rate,
      amount: tax,
      etimsRef: null, // later from KRA API
    },
  });
}
