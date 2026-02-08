import admin from "../config/firebase.js";

export default async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    req.user = {
      id: decoded.uid,
      email: decoded.email,
      role: decoded.role || "TENANT" // fallback role
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

