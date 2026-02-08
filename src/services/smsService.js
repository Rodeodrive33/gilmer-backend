export async function sendSMS(to, message) {
  // Replace later with Africa's Talking / Twilio
  console.log(`SMS SENT TO ${to}: ${message}`);
}

export async function sendBulkSMS(to, message) {
  // Replace later with Africa's Talking / Twilio
  console.log(`BULK SMS SENT TO ${to}: ${message}`);
}

export async function clearSmsLog() {
  // Replace later with Africa's Talking / Twilio
  console.log("SMS LOG CLEARED");
}

export default {
  sendSMS,
  sendBulkSMS,
  clearSmsLog,
};
