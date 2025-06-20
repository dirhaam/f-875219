
export interface InvoiceData {
  invoice_number: string;
  issue_date: string;
  due_date: string;
  customer: {
    name: string;
    email: string;
    address?: string;
  };
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    tax_number?: string;
  };
  items: {
    description: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  payment_terms?: string;
}

export const generateInvoicePDF = async (invoiceData: InvoiceData): Promise<void> => {
  // Create a new jsPDF instance
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  // Set fonts and colors
  const primaryColor = '#2563eb';
  const grayColor = '#6b7280';
  const darkColor = '#111827';
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(primaryColor);
  doc.text('INVOICE', 20, 30);
  
  // Invoice number and dates
  doc.setFontSize(12);
  doc.setTextColor(darkColor);
  doc.text(`Invoice #: ${invoiceData.invoice_number}`, 20, 50);
  doc.text(`Issue Date: ${new Date(invoiceData.issue_date).toLocaleDateString('id-ID')}`, 20, 60);
  doc.text(`Due Date: ${new Date(invoiceData.due_date).toLocaleDateString('id-ID')}`, 20, 70);
  
  // Company info (right side)
  doc.setFontSize(10);
  doc.setTextColor(grayColor);
  const companyLines = [
    invoiceData.company.name,
    invoiceData.company.address,
    invoiceData.company.phone,
    invoiceData.company.email,
    invoiceData.company.website || '',
    invoiceData.company.tax_number ? `NPWP: ${invoiceData.company.tax_number}` : ''
  ].filter(line => line);
  
  let yPos = 30;
  companyLines.forEach((line) => {
    doc.text(line, 200 - doc.getTextWidth(line), yPos);
    yPos += 8;
  });
  
  // Bill to
  doc.setFontSize(12);
  doc.setTextColor(darkColor);
  doc.text('Bill To:', 20, 100);
  
  doc.setFontSize(10);
  doc.text(invoiceData.customer.name, 20, 112);
  doc.text(invoiceData.customer.email, 20, 122);
  if (invoiceData.customer.address) {
    doc.text(invoiceData.customer.address, 20, 132);
  }
  
  // Items table
  const tableStartY = 150;
  let currentY = tableStartY;
  
  // Table header
  doc.setFillColor(245, 245, 245);
  doc.rect(20, currentY, 170, 12, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(darkColor);
  doc.text('Description', 25, currentY + 8);
  doc.text('Qty', 120, currentY + 8);
  doc.text('Price', 140, currentY + 8);
  doc.text('Total', 170, currentY + 8);
  
  currentY += 15;
  
  // Table rows
  invoiceData.items.forEach((item) => {
    doc.text(item.description, 25, currentY);
    doc.text(item.quantity.toString(), 120, currentY);
    doc.text(`Rp ${item.price.toLocaleString('id-ID')}`, 140, currentY);
    doc.text(`Rp ${item.total.toLocaleString('id-ID')}`, 170, currentY);
    currentY += 10;
  });
  
  // Totals
  currentY += 10;
  doc.text('Subtotal:', 130, currentY);
  doc.text(`Rp ${invoiceData.subtotal.toLocaleString('id-ID')}`, 170, currentY);
  
  if (invoiceData.tax_amount > 0) {
    currentY += 10;
    doc.text('Tax:', 130, currentY);
    doc.text(`Rp ${invoiceData.tax_amount.toLocaleString('id-ID')}`, 170, currentY);
  }
  
  currentY += 10;
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.text('Total:', 130, currentY);
  doc.text(`Rp ${invoiceData.total_amount.toLocaleString('id-ID')}`, 170, currentY);
  
  // Notes
  if (invoiceData.notes) {
    currentY += 20;
    doc.setFontSize(10);
    doc.setTextColor(darkColor);
    doc.text('Notes:', 20, currentY);
    currentY += 10;
    doc.text(invoiceData.notes, 20, currentY);
  }
  
  // Payment terms
  if (invoiceData.payment_terms) {
    currentY += 15;
    doc.text('Payment Terms:', 20, currentY);
    currentY += 10;
    doc.text(invoiceData.payment_terms, 20, currentY);
  }
  
  // Save the PDF
  doc.save(`invoice-${invoiceData.invoice_number}.pdf`);
};
