import express from "express";
import prisma from "../prismaClient.js";
import { Server } from "socket.io";

const router = express.Router();

router.post("/callback", async (req, res) => {
  try {
    const data = req.body.Body.stkCallback;

    if (data.ResultCode === 0) {
      const metadata = data.CallbackMetadata.Item;
      const amount = metadata.find(i => i.Name === "Amount").Value;
      const phone = metadata.find(i => i.Name === "PhoneNumber").Value;
      const invoiceId = data.CallbackMetadata.Item.find(i=>i.Name==="AccountReference")?.Value;

      await prisma.payment.create({
        data: {
          amount,
          channel: "MPESA",
          leaseId: invoiceId
        }
      });

      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "PAID" }
      });

      global.io.emit("newPayment", { amount });

      console.log("✅ Payment saved");
    }

    res.json({ ResultCode: 0, ResultDesc: "Received" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Callback error" });
  }
});

export default router;
