import axios from "axios";

// Example: push invoices to QuickBooks
export async function pushInvoiceToQuickBooks(invoice) {
  // Replace these placeholders with real OAuth2 tokens
  const token = process.env.QUICKBOOKS_TOKEN;

  const payload = {
    CustomerRef: { value: invoice.leaseId },
    TotalAmt: invoice.amount,
    TxnDate: invoice.dueDate.toISOString().split("T")[0],
    PrivateNote: `Invoice ID ${invoice.id}`,
  };

  const response = await axios.post(
    "https://sandbox-quickbooks.api.intuit.com/v3/company/<companyID>/invoice",
    payload,
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );

  return response.data;
}
