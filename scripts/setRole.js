// scripts/setRole.js
import admin from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = process.argv[2];
const role = process.argv[3];

if (!uid || !role) {
  console.error("Usage: node scripts/setRole.js <firebase_uid> <role>");
  process.exit(1);
}

(async () => {
  try {
    await admin.auth().setCustomUserClaims(uid, { role });
    console.log(`✅ Role "${role}" set for user ${uid}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
