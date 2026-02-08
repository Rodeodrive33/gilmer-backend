// src/utils/firebaseAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('../config/serviceAccountKey.json'); // adjust path

if (!admin.apps || !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;

