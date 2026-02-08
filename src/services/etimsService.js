import axios from "axios";

export async function submitInvoiceToKRA(invoice){

  const response = await axios.post(
    "https://etims-api.kra.go.ke/invoice",
    {
      invoiceNumber: invoice.id,
      amount: invoice.amount,
      tax: invoice.amount * 0.16
    },
    {
      headers:{
        Authorization:`Bearer ${process.env.KRA_TOKEN}`
      }
    }
  );

  return response.data;
}
