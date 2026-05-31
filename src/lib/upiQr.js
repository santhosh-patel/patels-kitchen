/**
 * Build a NPCI-compliant UPI payment URI for QR codes.
 * All values are URL-encoded so names like "Patel's Kitchen" scan correctly.
 */
export function buildUpiPaymentUri({
  vpa,
  payeeName = 'Patels Kitchen',
  amount,
  transactionNote,
  transactionRef
}) {
  const cleanVpa = (vpa || '').trim();
  if (!cleanVpa) return null;

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) return null;

  const parts = [
    `pa=${encodeURIComponent(cleanVpa)}`,
    `pn=${encodeURIComponent((payeeName || 'Patels Kitchen').trim())}`,
    `am=${encodeURIComponent(numericAmount.toFixed(2))}`,
    `cu=${encodeURIComponent('INR')}`
  ];

  if (transactionRef) {
    parts.push(`tr=${encodeURIComponent(String(transactionRef).slice(0, 35))}`);
  }
  if (transactionNote) {
    parts.push(`tn=${encodeURIComponent(String(transactionNote).slice(0, 80))}`);
  }

  return `upi://pay?${parts.join('&')}`;
}

export async function generateUpiQrDataUrl(upiUri, size = 220) {
  if (!upiUri) return null;

  const { default: QRCode } = await import('qrcode');
  return QRCode.toDataURL(upiUri, {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#1F1F1F', light: '#FFFFFF' }
  });
}
