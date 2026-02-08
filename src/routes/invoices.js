import express from "express";
import prisma from "../prismaClient.js";
import { io } from "../../server.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.post("/", authenticate, async (req, res) => {
  const { leaseId, amount, dueDate } = req.body;

  const invoice = await prisma.invoice.create({
    data: { leaseId, amount, dueDate, status: "PENDING" }
  });

  // Emit notification to frontend
  io.emit("new-invoice", { invoiceId: invoice.id, amount, dueDate });

  res.json({ message: "Invoice created", invoice });
});

export default router;
