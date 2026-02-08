import express from "express";
import prisma from "../prismaClient.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

/*
  PROFIT & LOSS REPORT
*/
router.get("/profit-loss", authenticate, async (req, res) => {
  try {
    const totalPayments = await prisma.payment.aggregate({
      _sum: { amount: true }
    });

    const totalInvoices = await prisma.invoice.aggregate({
      _sum: { amount: true }
    });

    const revenue = totalPayments._sum.amount || 0;
    const billed = totalInvoices._sum.amount || 0;
    const profit = revenue - billed;

    res.json({
      revenue,
      billed,
      profit
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
  REVENUE BY PROPERTY
*/
router.get("/revenue-by-property", authenticate, async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        leases: {
          include: {
            payments: true
          }
        }
      }
    });

    const result = properties.map(property => {
      let total = 0;
      property.leases.forEach(lease => {
        lease.payments.forEach(p => {
          total += p.amount;
        });
      });

      return {
        property: property.name,
        revenue: total
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
