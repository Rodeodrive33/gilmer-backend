export async function sendBulkSMS(recipients, message) {
  for (const to of recipients) {
    console.log(`SMS → ${to}: ${message}`);
  }
}

export async function clearSmsLog() {
  console.log("SMS LOG CLEARED");
}