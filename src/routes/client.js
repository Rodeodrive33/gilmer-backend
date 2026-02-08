const express = require("express");
const prisma = require("../prismaClient");
const authenticate = require("../middleware/authenticate");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.get(
  "/properties",
  authenticate,
  requireRole(["CLIENT"]),
  async (req, res) => {
    const properties = await prisma.property.findMany({
      where: { clientId: req.user.uid },
    });
    res.json(properties);
  }
);

module.exports = router;
