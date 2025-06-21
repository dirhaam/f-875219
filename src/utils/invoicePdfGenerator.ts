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
  
  // Define colors
  const darkHeaderColor = '#1e293b'; // Dark blue-gray
  const whiteColor = '#ffffff';
  const grayColor = '#6b7280';
  const lightGrayColor = '#f8fafc';
  const borderColor = '#e2e8f0';
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Header background - dark rectangle
  doc.setFillColor(darkHeaderColor);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Header content
  doc.setTextColor(whiteColor);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 20, 30);
  
  // Invoice number in header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.invoice_number, 20, 42);
  
  // Company name in header (right aligned)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const companyNameWidth = doc.getTextWidth(invoiceData.company.name);
  doc.text(invoiceData.company.name, pageWidth - 20 - companyNameWidth, 35);
  
  // Reset text color for body content
  doc.setTextColor('#000000');
  
  // DARI and UNTUK sections
  let currentY = 70;
  
  // DARI section (left side)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(grayColor);
  doc.text('DARI:', 20, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#000000');
  doc.setFontSize(10);
  const dariLines = [
    invoiceData.company.address,
    invoiceData.company.phone,
    invoiceData.company.email,
    invoiceData.company.website || ''
  ].filter(line => line);
  
  let dariY = currentY + 10;
  dariLines.forEach((line) => {
    doc.text(line, 20, dariY);
    dariY += 8;
  });
  
  // UNTUK section (right side)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(grayColor);
  doc.text('UNTUK:', 120, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#000000');
  doc.setFontSize(10);
  const untukLines = [
    invoiceData.customer.name,
    invoiceData.customer.email,
    invoiceData.customer.address || ''
  ].filter(line => line);
  
  let untukY = currentY + 10;
  untukLines.forEach((line) => {
    doc.text(line, 120, untukY);
    untukY += 8;
  });
  
  // Dates section
  currentY = Math.max(dariY, untukY) + 20;
  
  // Tanggal Terbit (left)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayColor);
  doc.text('Tanggal Terbit:', 20, currentY);
  
  // Small calendar icon placeholder
  doc.setDrawColor(borderColor);
  doc.rect(20, currentY + 5, 8, 8);
  
  doc.setTextColor('#000000');
  doc.text(new Date(invoiceData.issue_date).toLocaleDateString('id-ID'), 35, currentY + 11);
  
  // Jatuh Tempo (right)
  doc.setTextColor(grayColor);
  doc.text('Jatuh Tempo:', 120, currentY);
  
  // Small calendar icon placeholder
  doc.rect(120, currentY + 5, 8, 8);
  
  doc.setTextColor('#000000');
  doc.text(new Date(invoiceData.due_date).toLocaleDateString('id-ID'), 135, currentY + 11);
  
  // Items table
  currentY += 40;
  const tableStartY = currentY;
  
  // Table header background
  doc.setFillColor(lightGrayColor);
  doc.rect(20, currentY, 170, 12, 'F');
  
  // Table header borders
  doc.setDrawColor(borderColor);
  doc.setLineWidth(0.5);
  doc.rect(20, currentY, 170, 12);
  
  // Table header text
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#000000');
  doc.text('Deskripsi', 25, currentY + 8);
  doc.text('Qty', 120, currentY + 8);
  doc.text('Harga', 140, currentY + 8);
  doc.text('Total', 170, currentY + 8);
  
  currentY += 12;
  
  // Table rows
  doc.setFont('helvetica', 'normal');
  invoiceData.items.forEach((item, index) => {
    // Row background (alternating)
    if (index % 2 === 1) {
      doc.setFillColor('#fafafa');
      doc.rect(20, currentY, 170, 12, 'F');
    }
    
    // Row borders
    doc.setDrawColor(borderColor);
    doc.rect(20, currentY, 170, 12);
    
    // Row content
    doc.text(item.description, 25, currentY + 8);
    doc.text(item.quantity.toString(), 120, currentY + 8);
    doc.text(`Rp ${item.price.toLocaleString('id-ID')}`, 140, currentY + 8);
    doc.text(`Rp ${item.total.toLocaleString('id-ID')}`, 170, currentY + 8);
    currentY += 12;
  });
  
  // Add item button placeholder (visual only)
  currentY += 5;
  doc.setDrawColor('#3b82f6');
  doc.setTextColor('#3b82f6');
  doc.setFontSize(9);
  doc.text('+ Tambah Item', 25, currentY + 5);
  
  // Summary section
  currentY += 30;
  
  // Catatan section (left side)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#000000');
  doc.text('Catatan:', 20, currentY);
  
  // Notes box
  doc.setDrawColor(borderColor);
  doc.setFillColor(lightGrayColor);
  doc.rect(20, currentY + 5, 80, 25, 'FD');
  
  if (invoiceData.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(grayColor);
    // Split notes into multiple lines if needed
    const noteLines = doc.splitTextToSize(invoiceData.notes, 75);
    let noteY = currentY + 12;
    noteLines.slice(0, 3).forEach((line: string) => {
      doc.text(line, 22, noteY);
      noteY += 6;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(grayColor);
    doc.text('Terima kasih atas kepercayaan Anda.', 22, currentY + 15);
  }
  
  // Summary section (right side)
  const summaryX = 120;
  let summaryY = currentY;
  
  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor('#000000');
  doc.text('Subtotal:', summaryX, summaryY);
  doc.text(`Rp ${invoiceData.subtotal.toLocaleString('id-ID')}`, summaryX + 50, summaryY);
  
  // Tax (11% as shown in the image)
  summaryY += 10;
  doc.text('Pajak ( 11 %):', summaryX, summaryY);
  doc.text(`Rp ${invoiceData.tax_amount.toLocaleString('id-ID')}`, summaryX + 50, summaryY);
  
  // Total
  summaryY += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  
  // Line above total
  doc.setDrawColor('#000000');
  doc.setLineWidth(1);
  doc.line(summaryX, summaryY - 5, summaryX + 70, summaryY - 5);
  
  doc.text('TOTAL', summaryX, summaryY);
  doc.text(`Rp ${invoiceData.total_amount.toLocaleString('id-ID')}`, summaryX + 50, summaryY);
  
  // Footer with payment terms
  if (invoiceData.payment_terms) {
    currentY = pageHeight - 40;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(grayColor);
    doc.text(`Syarat Pembayaran: ${invoiceData.payment_terms}`, 20, currentY);
  }
  
  // Company tax number in footer
  if (invoiceData.company.tax_number) {
    doc.text(`NPWP: ${invoiceData.company.tax_number}`, 20, pageHeight - 30);
  }
  
  // Save the PDF
  doc.save(`invoice-${invoiceData.invoice_number}.pdf`);
};