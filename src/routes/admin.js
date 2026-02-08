const express = require("express");
const prisma = require("../prismaClient");
const authenticate = require("../middleware/authenticate");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  requireRole(["ADMIN"]),
  async (req, res) => {
    const stats = {
      users: await prisma.user.count(),
      properties: await prisma.property.count(),
      payments: await prisma.payment.count(),
    };

    res.json(stats);
  }
);

module.exports = router;

