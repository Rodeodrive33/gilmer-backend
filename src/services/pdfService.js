import PDFDocument from "pdfkit";

export function generateReceipt(invoice) {
  const doc = new PDFDocument();
  const buffers = [];

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {});

  doc.fontSize(20).text("Gilmer Rent Receipt", { align: "center" });
  doc.text(`Invoice ID: ${invoice.id}`);
  doc.text(`Amount: ${invoice.amount}`);
  doc.text(`Tenant: ${invoice.lease.tenant.name}`);
  doc.text(`Property: ${invoice.lease.property.name}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.end();

  return Buffer.concat(buffers);
}
