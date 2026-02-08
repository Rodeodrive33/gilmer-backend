const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function checkUserClaims(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    console.log(`Custom claims for ${email}:`, user.customClaims);
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}

const emailToCheck = 'rooneywanjohi@gmail.com'; // <-- REPLACE with your email
checkUserClaims(emailToCheck);
