const admin = require("firebase-admin");

// Load service account
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 👇 Replace this with your actual Firebase user UID
const uid = "3qsj86kMZvh0GXuoZepffDycaV32";

admin.auth().setCustomUserClaims(uid, { role: "admin" })
  .then(() => {
    console.log("✅ Custom claim set: admin");
  })
  .catch((error) => {
    console.error("❌ Error setting custom claim:", error);
  });
