// src/utils/mpesa.js
const axios = require('axios');
const ENV = process.env.MPESA_ENV || 'sandbox';

const CONFIG = {
  sandbox: {
    oauth: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    stk: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
  },
  production: {
    oauth: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    stk: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
  }
}[ENV];

function getTimestamp() {
  const pad = (n) => String(n).padStart(2, '0');
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

async function getAccessToken() {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) throw new Error('Missing MPESA_CONSUMER_KEY/SECRET');
  const base = Buffer.from(`${key}:${secret}`).toString('base64');
  const res = await axios.get(CONFIG.oauth, { headers: { Authorization: `Basic ${base}` }});
  return res.data.access_token;
}

async function initiateStkPush({ phone, amount, accountRef = 'Gilmer', description = 'Payment' }) {
  const token = await getAccessToken();
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  if (!shortcode || !passkey) throw new Error('Missing MPESA_SHORTCODE or MPESA_PASSKEY');

  const timestamp = getTimestamp();
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  const body = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: accountRef,
    TransactionDesc: description
  };

  const res = await axios.post(CONFIG.stk, body, { headers: { Authorization: `Bearer ${token}` }});
  return res.data;
}

module.exports = { initiateStkPush, getAccessToken };

