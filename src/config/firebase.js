// src/config/firebase.js
import admin from "firebase-admin";
import "dotenv/config"; // <-- ensures .env variables are loaded

if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PRIVATE_KEY
) {
  throw new Error("Firebase env variables missing! Check your .env file.");
}

const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
});

console.log("🔥 Firebase Admin initialized successfully");

export default admin;
