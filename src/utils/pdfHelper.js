// src/utils/pdfHelper.js
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function createPdf(invoice) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const drawText = (text, x, y, size = 12) => {
    page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });
  };

  drawText("Gilmer Property Management", 50, height - 50, 16);
  drawText("Invoice", 250, height - 80, 14);

  drawText(`Invoice ID: ${invoice.id}`, 50, height - 120);
  drawText(`Tenant: ${invoice.tenant.name}`, 50, height - 140);
  drawText(`Email: ${invoice.tenant.email}`, 50, height - 160);
  drawText(`Amount Due: KES ${invoice.amountDue}`, 50, height - 180);
  drawText(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, height - 200);
  drawText(`Status: ${invoice.status}`, 50, height - 220);

  drawText("Thank you for your business.", 50, height - 260);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
