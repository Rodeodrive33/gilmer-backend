const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * POST /api/mpesa/callback
 * This is a public endpoint that M-Pesa (or your webhook tester) will call with transaction details.
 */
router.post("/callback", express.json(), async (req, res) => {
  try {
    // Example payload structure depends on provider. Expect { transactionId, amount, phone, receipt, paybill }
    const { transactionId, amount, phone, receipt, paybill } = req.body;

    // Create a payment record (unallocated). You may map phone -> user later.
    const payment = await prisma.payment.create({
      data: {
        amount: Number(amount),
        method: "MPESA",
        channel: receipt || null,
        transactionId: transactionId || null,
        status: "PAID",
        allocated: false,
      },
    });

    // Respond quickly to the provider
    res.json({ success: true });
  } catch (err) {
    console.error("MPESA callback error:", err);
    res.status(500).json({ error: "callback handler failed" });
  }
});

module.exports = router;
