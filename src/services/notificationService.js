// src/services/notificationService.js
import nodemailer from "nodemailer";
import axios from "axios";
import twilioLib from "twilio";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM,
  AT_USERNAME,
  AT_API_KEY,
} = process.env;

/* --- Email transporter (safe fallback) --- */
let transporter = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT || 587) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
} else {
  console.log("⚠️ SMTP not configured — email will be logged.");
}

/* --- Twilio client (safe init) --- */
let twilioClient = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_ACCOUNT_SID.startsWith("AC")) {
  try {
    twilioClient = twilioLib(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  } catch (e) {
    console.warn("⚠️ Twilio init failed, will fallback:", e.message);
    twilioClient = null;
  }
} else {
  console.log("⚠️ Twilio disabled (missing/invalid credentials)");
}

/* --- Africa's Talking wrapper --- */
async function sendAfricasTalkingSMS(toListCsv, message) {
  if (!AT_USERNAME || !AT_API_KEY) throw new Error("Africa's Talking not configured");
  const url = "https://api.africastalking.com/version1/messaging";
  const payload = new URLSearchParams();
  payload.append("username", AT_USERNAME);
  payload.append("to", toListCsv);
  payload.append("message", message);

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    apikey: AT_API_KEY,
  };

  const res = await axios.post(url, payload.toString(), { headers });
  return res.data;
}

/* --- sendSMS: Twilio -> Africa's Talking -> log fallback --- */
export async function sendSMS(to, message) {
  try {
    const recipients = Array.isArray(to) ? to : [to];

    if (twilioClient) {
      const promises = recipients.map((r) =>
        twilioClient.messages.create({ body: message, from: TWILIO_FROM, to: r })
      );
      return await Promise.all(promises);
    }

    if (AT_USERNAME && AT_API_KEY) {
      const csv = recipients.join(",");
      return await sendAfricasTalkingSMS(csv, message);
    }

    // fallback: log
    for (const r of recipients) {
      console.log(`[SMS FALLBACK] To: ${r} — ${message}`);
    }
    return { fallback: true };
  } catch (err) {
    console.error("❌ sendSMS error:", err);
    throw err;
  }
}

/* --- sendEmail: transporter -> log fallback --- */
export async function sendEmail(to, subject, html) {
  try {
    if (!transporter) {
      console.log(`[EMAIL FALLBACK] To: ${to} | Subject: ${subject}\n${html}`);
      return { fallback: true };
    }

    const info = await transporter.sendMail({
      from: SMTP_USER,
      to,
      subject,
      html,
    });
    return info;
  } catch (err) {
    console.error("❌ sendEmail error:", err);
    throw err;
  }
}

/* --- simple templates --- */
export function invoiceReminderTemplate({ tenantName, invoice }) {
  return `<p>Hello ${tenantName || "Tenant"},</p>
    <p>Your invoice <strong>#${invoice.id}</strong> for KES <strong>${invoice.amountDue}</strong> is due on <strong>${new Date(invoice.dueDate).toLocaleDateString()}</strong>.</p>
    <p>Please pay on time to avoid penalties.</p>`;
}

export function paymentReceivedTemplate({ tenantName, payment }) {
  return `<p>Hi ${tenantName || "Tenant"},</p>
    <p>We received your payment of <strong>KES ${payment.amount}</strong>. Thank you!</p>`;
}

export function paymentConfirmationTemplate({ tenantName, payment, propertyName }) {
  return `<p>Hi ${tenantName || "Tenant"},</p>
    <p>We received your payment of <strong>KES ${payment.amount}</strong> for the property <strong>${propertyName}</strong>. Thank you!</p>`;
}