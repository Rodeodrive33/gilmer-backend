// src/controllers/authController.js
const prisma = require("../config/prismaClient");
const admin = require("../utils/firebaseAdmin");

/**
 * Register or login a user via Firebase token
 */
exports.loginOrRegister = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Missing Firebase token" });
    }

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    // Check if user exists in Prisma
    let user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      // If user doesn’t exist, create one
      user = await prisma.user.create({
        data: {
          email: decoded.email,
          name: decoded.name || decoded.email.split("@")[0],
          role: "CLIENT", // default role
        },
      });
    }

    res.json({ message: "Success", user });
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
};
