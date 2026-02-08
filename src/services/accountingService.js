// src/services/accountingService.js
import axios from "axios";

/**
 * Placeholder connector for QuickBooks/Xero.
 * If env vars are present, you can implement OAuth flows.
 * Right now this provides safe, non-crashing stubs.
 */

export async function pushInvoiceToQuickBooks(invoice) {
  // if credentials absent, just log and return simulated object
  if (!process.env.QB_CLIENT_ID || !process.env.QB_CLIENT_SECRET) {
    console.log("[QB FALLBACK] Would push invoice", invoice.id);
    return { simulated: true, message: "QuickBooks push simulated", invoiceId: invoice.id };
  }

  // Implement OAuth2 + request to QuickBooks here when configured.
  throw new Error("QuickBooks integration not implemented. Add your OAuth flow.");
}

export async function pushInvoiceToXero(invoice) {
  if (!process.env.XERO_CLIENT_ID || !process.env.XERO_CLIENT_SECRET) {
    console.log("[XERO FALLBACK] Would push invoice", invoice.id);
    return { simulated: true, message: "Xero push simulated", invoiceId: invoice.id };
  }
  throw new Error("Xero integration not implemented. Add your OAuth flow.");
}

export async function pullInvoicesFromQuickBooks() {
  if (!process.env.QB_CLIENT_ID || !process.env.QB_CLIENT_SECRET) {
    console.log("[QB FALLBACK] Would pull invoices");
    return { simulated: true, message: "QuickBooks pull simulated" };
  }
  throw new Error("QuickBooks integration not implemented. Add your OAuth flow.");
}

export async function pullInvoicesFromXero() {
  if (!process.env.XERO_CLIENT_ID || !process.env.XERO_CLIENT_SECRET) {
    console.log("[XERO FALLBACK] Would pull invoices");
    return { simulated: true, message: "Xero pull simulated" };
  }
  throw new Error("Xero integration not implemented. Add your OAuth flow.");
}

export async function pullPaymentsFromQuickBooks() {
  if (!process.env.QB_CLIENT_ID || !process.env.QB_CLIENT_SECRET) {
    console.log("[QB FALLBACK] Would pull payments");
    return { simulated: true, message: "QuickBooks pull simulated" };
  }
  throw new Error("QuickBooks integration not implemented. Add your OAuth flow.");
}

export async function pullPaymentsFromXero() {
  if (!process.env.XERO_CLIENT_ID || !process.env.XERO_CLIENT_SECRET) {
    console.log("[XERO FALLBACK] Would pull payments");
    return { simulated: true, message: "Xero pull simulated" };
  }
  throw new Error("Xero integration not implemented. Add your OAuth flow.");
}

export async function pushPaymentToQuickBooks(payment) {
  if (!process.env.QB_CLIENT_ID || !process.env.QB_CLIENT_SECRET) {
    console.log("[QB FALLBACK] Would push payment", payment.id);
    return { simulated: true, message: "QuickBooks push simulated", paymentId: payment.id };
  }
  throw new Error("QuickBooks integration not implemented. Add your OAuth flow.");
}

export async function pushPaymentToXero(payment) {
  if (!process.env.XERO_CLIENT_ID || !process.env.XERO_CLIENT_SECRET) {
    console.log("[XERO FALLBACK] Would push payment", payment.id);
    return { simulated: true, message: "Xero push simulated", paymentId: payment.id };
  }
  throw new Error("Xero integration not implemented. Add your OAuth flow.");
}
