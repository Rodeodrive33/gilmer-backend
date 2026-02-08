import express from "express";
import authenticate from "../middleware/authenticate.js";
import requireRole from "../middleware/requireRole.js";
import prisma from "../prismaClient.js";

const router = express.Router();

router.get(
  "/admin",
  authenticate,
  requireRole(["ADMIN"]),
  async (req, res) => {
    const stats = {
      paymentsByChannel: await prisma.payment.groupBy({
        by: ["channel"],
        _sum: { amount: true },
      }),
      totalPayments: await prisma.payment.count(),
      totalProperties: await prisma.property.count(),
    };

    res.json(stats);
  }
);

export default router;
