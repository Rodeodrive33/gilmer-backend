import cron from "node-cron";
import { prisma } from "../config/prisma.js";
import { generateReceipt } from "../services/pdfService.js";

export const invoiceBatchJob = () => {
  cron.schedule("0 8 * * *", async () => { // runs daily at 8AM
    console.log("Running invoice batching...");
    const invoices = await prisma.invoice.findMany({
      where: { status: "PENDING" },
      include: { lease: true }
    });

    for (const invoice of invoices) {
      await generateReceipt(invoice);
      // send SMS logic here (Twilio / Africa's Talking)
    }

    console.log(`${invoices.length} invoices batched`);
  });
};

invoiceBatchJob();