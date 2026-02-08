import axios from "axios";

const consumerKey = process.env.MPESA_KEY;
const consumerSecret = process.env.MPESA_SECRET;
const shortcode = process.env.MPESA_SHORTCODE;
const passkey = process.env.MPESA_PASSKEY;

async function getAccessToken() {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return res.data.access_token;
}

export async function stkPush(phone, amount) {
  const token = await getAccessToken();
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g,"").slice(0,14);
  const password = Buffer.from(shortcode+passkey+timestamp).toString("base64");

  return axios.post(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: "https://yourdomain.com/api/mpesa/callback",
      AccountReference: "Gilmer Rent",
      TransactionDesc: "Rent Payment"
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}
