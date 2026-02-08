// src/jobs/reminderJob.js
import cron from "node-cron";
import prisma from "../config/prismaClient.js";
import { sendSMS, sendEmail, invoiceReminderTemplate } from "../services/notificationService.js";

const SCHEDULE_TZ = process.env.SCHEDULE_TZ || "Africa/Nairobi";

/**
 * Run daily at 09:00 local time and notify tenants with invoices due in next N days (default 3)
 */
export function startReminderJob({ daysAhead = 3 } = {}) {
  // runs every day at 09:00
  cron.schedule("0 9 * * *", async () => {
    try {
      console.log(`[ReminderJob] Running daily reminder job (due in ${daysAhead} days)`);

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysAhead);
      const startOfDay = new Date(targetDate.toISOString().slice(0, 10) + "T00:00:00.000Z");
      const endOfDay = new Date(targetDate.toISOString().slice(0, 10) + "T23:59:59.999Z");

      const invoices = await prisma.invoice.findMany({
        where: {
          dueDate: { gte: startOfDay, lte: endOfDay },
          status: { in: ["PENDING", "PARTIALLY_PAID"] },
        },
        include: { tenant: { include: { user: true, unit: { include: { property: true } } } }, payments: true },
      });

      for (const invoice of invoices) {
        const tenantUser = invoice.tenant?.user;
        if (!tenantUser) continue;

        const propertyName = invoice.tenant?.unit?.property?.name || "your property";
        const smsMessage = `Reminder: Invoice #${invoice.id} due ${invoice.dueDate.toISOString().slice(0,10)}. Amount: ${invoice.amountDue}`;

        try {
          if (tenantUser.phone) await sendSMS(tenantUser.phone, smsMessage);
          if (tenantUser.email) {
            const html = invoiceReminderTemplate({ tenantName: tenantUser.name, invoice, propertyName });
            await sendEmail(tenantUser.email, `Invoice Reminder #${invoice.id}`, html);
          }
          console.log(`[ReminderJob] Sent reminder for invoice ${invoice.id}`);
        } catch (err) {
          console.error(`[ReminderJob] Failed to send for invoice ${invoice.id}:`, err);
        }
      }
    } catch (err) {
      console.error("[ReminderJob] Error running job:", err);
    }
  }, { timezone: SCHEDULE_TZ });

  console.log(`[ReminderJob] Scheduled daily reminder at 09:00 ${SCHEDULE_TZ}`);
}
