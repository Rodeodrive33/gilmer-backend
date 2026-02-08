// src/controllers/integrationController.js
import prisma from "../config/prismaClient.js";
import { initiateStkPush } from "../services/mpesaService.js";
import { pushInvoiceToQuickBooks, pushInvoiceToXero } from "../services/accountingService.js";

/**
 * Start an M-Pesa STK push and create a pending transaction in DB
 * Body: { tenantId, amount, phone, invoiceId? }
 */
export async function startMpesaPayment(req, res) {
  try {
    const { tenantId, amount, phone, invoiceId } = req.body;
    if (!tenantId || !amount || !phone) return res.status(422).json({ error: "tenantId, amount and phone are required" });

    // create a pending transaction record (reconciliation target)
    const tx = await prisma.externalTransaction.create({
      data: {
        tenantId: Number(tenantId),
        amount: parseFloat(amount),
        method: "MPESA",
        reference: null,
        status: "PENDING",
        invoiceId: invoiceId ? Number(invoiceId) : null
      }
    });

    // initiate STK push (or simulate)
    const mpesaRes = await initiateStkPush({ phone, amount, accountReference: `TX${tx.id}`, transactionDesc: 'Gilmer Rent' });

    // store checkout id if available
    const checkoutId = mpesaRes.CheckoutRequestID || mpesaRes.checkoutRequestID || null;
    if (checkoutId) {
      await prisma.externalTransaction.update({ where: { id: tx.id }, data: { reference: checkoutId } });
    }

    res.json({ message: "STK push initiated", tx, mpesaRes });
  } catch (err) {
    console.error("❌ startMpesaPayment:", err);
    res.status(500).json({ error: err.message || "Failed to start M-Pesa payment" });
  }
}

/**
 * Reconcile external transactions with internal payments.
 * Body: { txId, paymentId } - marks external tx as RECONCILED and links to payment.
 * Also credits tenant balance/payment if needed.
 */
export async function reconcileTransaction(req, res) {
  try {
    const { txId, paymentId } = req.body;
    if (!txId || !paymentId) return res.status(422).json({ error: "txId and paymentId are required" });

    const tx = await prisma.externalTransaction.findUnique({ where: { id: Number(txId) } });
    const payment = await prisma.payment.findUnique({ where: { id: Number(paymentId) } });

    if (!tx || !payment) return res.status(404).json({ error: "Transaction or payment not found" });

    await prisma.externalTransaction.update({
      where: { id: tx.id },
      data: { status: "RECONCILED", paymentId: payment.id }
    });

    res.json({ message: "Reconciled", txId: tx.id, paymentId: payment.id });
  } catch (err) {
    console.error("❌ reconcileTransaction:", err);
    res.status(500).json({ error: "Failed to reconcile" });
  }
}

/**
 * Push invoice to accounting systems (simulated if not configured)
 * Body: { invoiceId, provider: "QB"|"XERO" }
 */
export async function pushInvoice(req, res) {
  try {
    const { invoiceId, provider } = req.body;
    if (!invoiceId || !provider) return res.status(422).json({ error: "invoiceId and provider required" });

    const invoice = await prisma.invoice.findUnique({ where: { id: Number(invoiceId) }, include: { tenant: true } });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    let result;
    if (provider === "QB") {
      result = await pushInvoiceToQuickBooks(invoice);
    } else if (provider === "XERO") {
      result = await pushInvoiceToXero(invoice);
    } else {
      return res.status(400).json({ error: "Unknown provider" });
    }

    res.json({ message: "Pushed to accounting", result });
  } catch (err) {
    console.error("❌ pushInvoice:", err);
    res.status(500).json({ error: err.message || "Failed to push invoice" });
  }
}

/**
 * List external transactions (pending/unreconciled)
 */
export async function listExternalTx(req, res) {
  try {
    let where = {};
    if (req.user.role === "TENANT") where = { tenantId: req.user.id };
    else if (req.user.role === "PROPERTY_MANAGER") where = { tenant: { unit: { property: { propertyManagerId: req.user.id } } } };
    else if (req.user.role === "CLIENT") where = { tenant: { unit: { property: { clientId: req.user.id } } } };

    const txs = await prisma.externalTransaction.findMany({
      where,
      include: { tenant: true, payment: true },
      orderBy: { createdAt: "desc" }
    });

    res.json(txs);
  } catch (err) {
    console.error("❌ listExternalTx:", err);
    res.status(500).json({ error: "Failed to list transactions" });
  }
}
