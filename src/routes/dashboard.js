import express from "express";
import authenticate from "../middleware/authenticate.js";
import prisma from "../prismaClient.js";

const router = express.Router();

router.get("/revenue-by-property", authenticate, async (req, res) => {
  const revenue = await prisma.property.findMany({
    where: { clientId: req.user.id },
    select: {
      name: true,
      leases: {
        select: {
          payments: true
        }
      }
    }
  });

  const formatted = revenue.map(prop => ({
    property: prop.name,
    revenue: prop.leases.reduce((sum, lease) => {
      return sum + lease.payments.reduce((pSum, p) => pSum + p.amount, 0);
    }, 0)
  }));

  res.json(formatted);
});

export default router;
