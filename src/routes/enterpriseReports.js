import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

/* Revenue by Property */

router.get("/property-revenue/:propertyId", async (req,res)=>{

  const { propertyId } = req.params;

  const revenue = await prisma.ledgerEntry.aggregate({
    _sum:{ amount:true },
    where:{
      propertyId,
      type:"CREDIT"
    }
  });

  res.json({
    propertyId,
    revenue: revenue._sum.amount || 0
  });

});

/* Monthly Revenue Trend */

router.get("/monthly-revenue", async (req,res)=>{

  const data = await prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "createdAt") as month,
           SUM(amount) as total
    FROM "LedgerEntry"
    WHERE type = 'CREDIT'
    GROUP BY month
    ORDER BY month ASC
  `;

  res.json(data);

});

export default router;
