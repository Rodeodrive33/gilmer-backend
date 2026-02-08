// placeholder: implement real provider logic (Twilio / Africa's Talking)
const smsLog = []; // for dev only; in prod, store in DB

exports.sendBlast = async (req, res) => {
  try {
    const { message, recipients } = req.body; // recipients: ["+2547..."]
    // TODO: integrate real provider here
    recipients.forEach(r => smsLog.push({ to: r, message, date: new Date() }));
    res.json({ message: 'Blast queued', count: recipients.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send blast' });
  }
};

exports.sendInvoiceSms = async (req, res) => {
  try {
    const { tenantId, text } = req.body;
    // look up tenant phone
    // push to smsLog
    smsLog.push({ toTenant: tenantId, text, date: new Date() });
    res.json({ message: 'Invoice SMS queued' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send invoice SMS' });
  }
};

exports.getSmsCount = async (req, res) => {
  res.json({ count: smsLog.length, logs: smsLog.slice(-20) });
};

exports.clearSmsLog = async (req, res) => {
  smsLog.length = 0;
  res.json({ message: 'SMS log cleared' });
};

exports.getSmsLog = async (req, res) => {
  res.json(smsLog);
};

