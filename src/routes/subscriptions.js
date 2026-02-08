import express from "express";
import prisma from "../prismaClient.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.post("/subscribe", authenticate, async (req, res) => {
  const { plan, price, endDate } = req.body;

  const sub = await prisma.subscription.create({
    data: {
      clientId: req.user.id,
      plan,
      price,
      status: "ACTIVE",
      endDate,
    },
  });

  res.json({ message: "Subscription created", subscription: sub });
});

export default router;
