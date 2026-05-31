import React from 'react';
import { Printer, RefreshCw, Download, Share2, MessageCircle, Mail } from 'lucide-react';

function buildReceiptText(orderData) {
  const subtotal = orderData.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const lines = [
    "PATEL'S KITCHEN — Official Feasting Bill",
    '═'.repeat(40),
    `ORDER ID: ${orderData.orderId}`,
    `DATE: ${orderData.date}`,
    `DINING MODE: ${orderData.deliveryMode === 'delivery' ? 'Royal Valet Delivery' : 'Dine-In Table'}`,
    `GUEST: ${orderData.customerName}`,
    `CONTACT: ${orderData.phone}`,
    `DESTINATION: ${orderData.address}`,
    '─'.repeat(40),
    ...orderData.cart.map(item =>
      `${item.name} x${item.quantity} — ₹${item.price * item.quantity}`
    ),
    '─'.repeat(40),
    `Subtotal: ₹${subtotal}`,
    ...(orderData.packagingFee > 0 ? [`Packaging: ₹${orderData.packagingFee}`] : []),
    `Taxes (5%): ₹${orderData.gst}`,
    `GRAND TOTAL: ₹${orderData.grandTotal}`,
    '═'.repeat(40),
    'Thank you for dining with the Patels!'
  ];
  return lines.join('\n');
}

export default function Receipt({ orderData, onClose }) {
  if (!orderData) return null;

  const receiptText = buildReceiptText(orderData);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PatelsKitchen-${orderData.orderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Patel's Kitchen — ${orderData.orderId}`,
          text: receiptText
        });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(receiptText);
      alert('Receipt copied to clipboard!');
    }
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(receiptText)}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Patel's Kitchen Receipt — ${orderData.orderId}`);
    const body = encodeURIComponent(receiptText);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="receipt-overlay">
      <div className="receipt-modal-container">
        
        <div className="receipt-paper">
          <div className="receipt-watermark">PATEL'S</div>
          
          <h2 style={{ fontFamily: 'var(--font-headings)', fontSize: '1.2rem', margin: 0, letterSpacing: '0.15em' }}>
            PATEL'S KITCHEN
          </h2>
          <div className="receipt-header-title">Official Feasting Bill</div>
          <p style={{ fontSize: '0.7rem', color: '#333333', marginTop: '0.2rem' }}>
            Authentic South Indian & Hyderabadi Flavours
          </p>
          
          <div className="receipt-divider" />

          <div className="receipt-meta-info">
            <div><strong>ORDER ID:</strong> {orderData.orderId}</div>
            <div><strong>DATE:</strong> {orderData.date}</div>
            <div><strong>DINING MODE:</strong> {orderData.deliveryMode === 'delivery' ? 'Royal Valet Delivery' : 'Dine-In Table'}</div>
            <div style={{ borderTop: '0.5px dotted #999', margin: '0.3rem 0', paddingTop: '0.3rem' }} />
            <div><strong>PATEL GUEST:</strong> {orderData.customerName}</div>
            <div><strong>CONTACT:</strong> {orderData.phone}</div>
            <div><strong>DESTINATION:</strong> {orderData.address}</div>
          </div>

          <div className="receipt-divider" />

          <table className="receipt-items-table">
            <thead>
              <tr>
                <th>DESCRIP.</th>
                <th style={{ textAlign: 'center' }}>QTY</th>
                <th style={{ textAlign: 'right' }}>RATE</th>
                <th style={{ textAlign: 'right' }}>VAL (₹)</th>
              </tr>
            </thead>
            <tbody>
              {orderData.cart.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{item.price}</td>
                  <td style={{ textAlign: 'right' }}>{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="receipt-summary-box">
            <div className="receipt-summary-row">
              <span>Feast Subtotal:</span>
              <span>₹{orderData.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0)}</span>
            </div>
            
            {orderData.packagingFee > 0 && (
              <div className="receipt-summary-row">
                <span>Royal Packaging Fee:</span>
                <span>₹{orderData.packagingFee}</span>
              </div>
            )}

            <div className="receipt-summary-row">
              <span>Taxes & SGST (5%):</span>
              <span>₹{orderData.gst}</span>
            </div>

            <div className="receipt-summary-row total">
              <span>GRAND TOTAL:</span>
              <span>₹{orderData.grandTotal}</span>
            </div>
          </div>

          <div className="receipt-divider" />

          <div className="receipt-footer-text">
            <strong>* SERVING TRADITION SINCE GENERATIONS *</strong>
            <div style={{ marginTop: '0.4rem', fontSize: '0.65rem' }}>
              Thank you for dining with the Patels.<br />
              Delectable legacy awaits you again!
            </div>
          </div>

        </div>

        <div className="receipt-action-group">
          <button className="receipt-action-btn" onClick={handleDownload}>
            <Download size={16} />
            Download
          </button>

          <button className="receipt-action-btn" onClick={handleShare}>
            <Share2 size={16} />
            Share
          </button>

          <button className="receipt-action-btn" onClick={handleWhatsApp}>
            <MessageCircle size={16} />
            WhatsApp
          </button>

          <button className="receipt-action-btn" onClick={handleEmail}>
            <Mail size={16} />
            Email
          </button>

          <button className="receipt-action-btn" onClick={handlePrint}>
            <Printer size={16} />
            Print
          </button>

          <button className="btn-primary receipt-action-btn receipt-action-primary" onClick={onClose}>
            <RefreshCw size={16} />
            Feast Again
          </button>
        </div>

      </div>
    </div>
  );
}
