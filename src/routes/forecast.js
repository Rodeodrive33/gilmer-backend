import express from "express";
import prisma from "../prismaClient.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

/*
  Simple Forecast:
  Uses last 6 months average rent collection
*/
router.get("/rent-forecast", authenticate, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { paidAt: "desc" },
      take: 50
    });

    if (payments.length === 0) {
      return res.json({ forecast: 0 });
    }

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const average = total / payments.length;

    const forecastNextMonth = average * 30; // projected monthly

    res.json({
      averageDailyCollection: average,
      forecastNextMonth
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
