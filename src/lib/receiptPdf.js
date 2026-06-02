import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const GOLD = [184, 138, 59];
const CHARCOAL = [31, 31, 31];
const MUTED = [102, 102, 102];

const NUM_FONT = 'courier';
const TEXT_FONT = 'helvetica';

function formatRs(amount) {
  return `Rs.${Number(amount).toLocaleString('en-IN')}`;
}

function buildSummaryRows(orderData) {
  const subtotal = orderData.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const rows = [['Subtotal', formatRs(subtotal)]];

  if (orderData.discount > 0) {
    rows.push([`Discount (${orderData.couponCode || 'Promo'})`, `- ${formatRs(orderData.discount)}`]);
  }
  if (orderData.packagingFee > 0) {
    rows.push(['Packaging fee', formatRs(orderData.packagingFee)]);
  }
  if (orderData.deliveryFee > 0) {
    rows.push(['Delivery fee', formatRs(orderData.deliveryFee)]);
  }
  if (orderData.packagingGst > 0) {
    rows.push([`Food GST (${orderData.taxRate ?? 5}%)`, formatRs(orderData.foodGst)]);
    rows.push(['Packaging GST (18%)', formatRs(orderData.packagingGst)]);
  } else {
    rows.push([`GST (${orderData.taxRate ?? 5}%)`, formatRs(orderData.gst)]);
  }
  rows.push(['GRAND TOTAL', formatRs(orderData.grandTotal)]);

  return rows;
}

function buildMetaRows(orderData) {
  const isDelivery = orderData.deliveryMode === 'delivery';
  const rows = [
    ['Order ID', orderData.orderId],
    ['Date', orderData.date],
    ['Dining mode', isDelivery ? 'Delivery' : 'Dine-In Table'],
  ];

  if (isDelivery) {
    rows.push(['Guest', orderData.customerName]);
    rows.push(['Contact', orderData.phone]);
    rows.push(['Destination', orderData.address]);
  } else {
    rows.push(['Table', orderData.address]);
  }

  return rows;
}

const numCellStyle = {
  font: NUM_FONT,
  halign: 'right',
};

export function downloadReceiptPdf(orderData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  doc.setFont(TEXT_FONT, 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...CHARCOAL);
  doc.text("PATEL'S KITCHEN", pageWidth / 2, y, { align: 'center' });

  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(...GOLD);
  doc.text('Official Feasting Bill', pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setFont(TEXT_FONT, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text('Authentic South Indian & Hyderabadi Flavours', pageWidth / 2, y, { align: 'center' });

  y += 8;

  autoTable(doc, {
    startY: y,
    body: buildMetaRows(orderData),
    theme: 'plain',
    styles: {
      font: TEXT_FONT,
      fontSize: 8,
      cellPadding: { top: 1.5, bottom: 1.5, left: 0, right: 0 },
      textColor: CHARCOAL,
      lineWidth: 0,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 38, textColor: [92, 61, 46] },
      1: { cellWidth: 'auto', font: NUM_FONT, fontStyle: 'normal' },
    },
    didParseCell(data) {
      if (data.column.index === 1 && data.row.index === 0) {
        data.cell.styles.fontSize = 9;
        data.cell.styles.textColor = GOLD;
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 6;

  autoTable(doc, {
    startY: y,
    head: [['Description', 'Qty', 'Rate', 'Amount']],
    body: orderData.cart.map((item) => [
      item.name,
      String(item.quantity),
      formatRs(item.price),
      formatRs(item.price * item.quantity),
    ]),
    theme: 'grid',
    headStyles: {
      font: TEXT_FONT,
      fillColor: GOLD,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8,
    },
    styles: {
      font: TEXT_FONT,
      fontSize: 8,
      cellPadding: 2,
      textColor: CHARCOAL,
      lineColor: [216, 196, 165],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 62, halign: 'left', font: TEXT_FONT },
      1: { cellWidth: 14, halign: 'center', font: NUM_FONT },
      2: { cellWidth: 28, ...numCellStyle },
      3: { cellWidth: 28, ...numCellStyle, fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 4;

  const summaryRows = buildSummaryRows(orderData);
  autoTable(doc, {
    startY: y,
    body: summaryRows,
    theme: 'plain',
    styles: {
      font: TEXT_FONT,
      fontSize: 8,
      cellPadding: { top: 1.5, bottom: 1.5, left: 0, right: 0 },
      textColor: CHARCOAL,
      lineWidth: 0,
    },
    columnStyles: {
      0: { halign: 'left', font: TEXT_FONT },
      1: { ...numCellStyle, fontStyle: 'bold' },
    },
    didParseCell(data) {
      if (data.row.index === summaryRows.length - 1) {
        data.cell.styles.fontSize = 10;
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = GOLD;
        data.cell.styles.font = NUM_FONT;
      }
      if (data.column.index === 1) {
        data.cell.styles.font = NUM_FONT;
      }
      if (data.column.index === 1 && String(data.cell.raw).startsWith('-')) {
        data.cell.styles.textColor = GOLD;
      }
    },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 8;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.line(14, y, pageWidth - 14, y);

  y += 6;
  doc.setFont(TEXT_FONT, 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...CHARCOAL);
  doc.text('* SERVING TRADITION SINCE GENERATIONS *', pageWidth / 2, y, { align: 'center' });

  y += 4;
  doc.setFont(TEXT_FONT, 'normal');
  doc.setTextColor(...MUTED);
  doc.text('Thank you for dining with the Patels.', pageWidth / 2, y, { align: 'center' });

  if (orderData.deliveryMode === 'delivery') {
    y += 5;
    doc.setFont(NUM_FONT, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...GOLD);
    doc.text(
      `Track: ${window.location.origin}/track?id=${orderData.orderId}`,
      pageWidth / 2,
      y,
      { align: 'center' }
    );
  }

  doc.save(`PatelsKitchen-${orderData.orderId}.pdf`);
}
