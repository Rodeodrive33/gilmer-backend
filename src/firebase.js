// src/config/firebase.js
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const root = path.resolve(process.cwd());
const serviceAccountPath = path.join(root, "serviceAccountKey.json");

// Read JSON file (avoid import assert issues)
if (!admin.apps.length) {
  const raw = fs.readFileSync(serviceAccountPath, "utf8");
  const serviceAccount = JSON.parse(raw);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("🔥 Firebase Admin initialized successfully");
}

export default admin;
