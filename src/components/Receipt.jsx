import { Printer, Download, Share2, MessageCircle, Mail, Home, ArrowLeft, MapPin, RotateCcw } from 'lucide-react';
import { navigate } from '../lib/navigation';
import { downloadReceiptPdf } from '../lib/receiptPdf';

function getSubtotal(cart) {
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function formatInr(amount) {
  return Number(amount).toLocaleString('en-IN');
}

function buildReceiptText(orderData) {
  const isDelivery = orderData.deliveryMode === 'delivery';
  const subtotal = getSubtotal(orderData.cart);
  const lines = [
    "PATEL'S KITCHEN — Official Feasting Bill",
    '═'.repeat(40),
    `ORDER ID: ${orderData.orderId}`,
    `DATE: ${orderData.date}`,
    `DINING MODE: ${isDelivery ? 'Royal Valet Delivery' : 'Dine-In Table'}`,
    ...(isDelivery ? [
      `GUEST: ${orderData.customerName}`,
      `CONTACT: ${orderData.phone}`,
      `DESTINATION: ${orderData.address}`,
    ] : [
      `TABLE: ${orderData.address}`,
    ]),
    '─'.repeat(40),
    ...orderData.cart.map(item =>
      `${item.name} x${item.quantity} — ₹${item.price * item.quantity}`
    ),
    '─'.repeat(40),
    `Subtotal: ₹${subtotal}`,
    ...(orderData.discount > 0 ? [`Discount (${orderData.couponCode}): -₹${orderData.discount}`] : []),
    ...(orderData.packagingFee > 0 ? [`Packaging: ₹${orderData.packagingFee}`] : []),
    ...(orderData.deliveryFee > 0 ? [`Delivery: ₹${orderData.deliveryFee}`] : []),
    ...(orderData.packagingGst > 0 ? [
      `Food GST (${orderData.taxRate ?? 5}%): ₹${orderData.foodGst}`,
      `Packaging GST (18%): ₹${orderData.packagingGst}`
    ] : [
      `Taxes (${orderData.taxRate ?? 5}%): ₹${orderData.gst}`
    ]),
    `GRAND TOTAL: ₹${orderData.grandTotal}`,
    '═'.repeat(40),
    ...(isDelivery ? [`Track your order: ${window.location.origin}/track?id=${orderData.orderId}`] : []),
    'Thank you for dining with the Patels!'
  ];
  return lines.join('\n');
}

export default function Receipt({ orderData, onHome, onBack, onOrderAgain }) {
  if (!orderData) return null;

  const isDelivery = orderData.deliveryMode === 'delivery';
  const subtotal = getSubtotal(orderData.cart);
  const receiptText = buildReceiptText(orderData);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    downloadReceiptPdf(orderData);
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
          <div className="receipt-watermark">PATEL&apos;S</div>

          <h2 className="receipt-brand-title">PATEL&apos;S KITCHEN</h2>
          <div className="receipt-header-title">Official Feasting Bill</div>
          <p className="receipt-tagline">Authentic South Indian &amp; Hyderabadi Flavours</p>

          <div className="receipt-divider" />

          <div className="receipt-order-id">
            <span className="receipt-meta-label">ORDER ID</span>
            <span className="receipt-order-id-value">{orderData.orderId}</span>
          </div>

          <table className="receipt-layout-table receipt-meta-table">
            <tbody>
              <tr>
                <td>DATE</td>
                <td>{orderData.date}</td>
              </tr>
              <tr>
                <td>DINING MODE</td>
                <td>{isDelivery ? 'Royal Valet Delivery' : 'Dine-In Table'}</td>
              </tr>
              {isDelivery ? (
                <>
                  <tr>
                    <td>GUEST</td>
                    <td>{orderData.customerName}</td>
                  </tr>
                  <tr>
                    <td>CONTACT</td>
                    <td>{orderData.phone}</td>
                  </tr>
                  <tr>
                    <td>DESTINATION</td>
                    <td>{orderData.address}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td>TABLE</td>
                  <td>{orderData.address}</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="receipt-divider" />

          <table className="receipt-layout-table receipt-items-table">
            <thead>
              <tr>
                <th>DESCRIP.</th>
                <th>QTY</th>
                <th>RATE</th>
                <th>VAL (₹)</th>
              </tr>
            </thead>
            <tbody>
              {orderData.cart.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td className="receipt-num">{item.quantity}</td>
                  <td className="receipt-num">₹{formatInr(item.price)}</td>
                  <td className="receipt-num">₹{formatInr(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="receipt-layout-table receipt-summary-table">
            <tbody>
              <tr>
                <td>Subtotal</td>
                <td className="receipt-num">₹{formatInr(subtotal)}</td>
              </tr>
              {orderData.discount > 0 && (
                <tr className="receipt-discount-row">
                  <td>Promo ({orderData.couponCode})</td>
                  <td className="receipt-num">-₹{formatInr(orderData.discount)}</td>
                </tr>
              )}
              {orderData.packagingFee > 0 && (
                <tr>
                  <td>Packaging</td>
                  <td className="receipt-num">₹{formatInr(orderData.packagingFee)}</td>
                </tr>
              )}
              {orderData.deliveryFee > 0 && (
                <tr>
                  <td>Delivery</td>
                  <td className="receipt-num">₹{formatInr(orderData.deliveryFee)}</td>
                </tr>
              )}
              {orderData.packagingGst > 0 ? (
                <>
                  <tr>
                    <td>Food GST ({orderData.taxRate ?? 5}%)</td>
                    <td className="receipt-num">₹{formatInr(orderData.foodGst)}</td>
                  </tr>
                  <tr>
                    <td>Packaging GST (18%)</td>
                    <td className="receipt-num">₹{formatInr(orderData.packagingGst)}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td>GST ({orderData.taxRate ?? 5}%)</td>
                  <td className="receipt-num">₹{formatInr(orderData.gst)}</td>
                </tr>
              )}
              <tr className="receipt-total-row">
                <td>GRAND TOTAL</td>
                <td className="receipt-num">₹{formatInr(orderData.grandTotal)}</td>
              </tr>
            </tbody>
          </table>

          <div className="receipt-divider" />

          <div className="receipt-footer-text">
            <strong>* SERVING TRADITION SINCE GENERATIONS *</strong>
            <div className="receipt-footer-sub">
              Thank you for dining with the Patels.<br />
              Delectable legacy awaits you again!
            </div>
          </div>
        </div>

        <div className="receipt-nav-actions">
          <button type="button" className="receipt-nav-btn receipt-nav-back" onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </button>
          {isDelivery && (
            <button
              type="button"
              className="receipt-nav-btn receipt-nav-track"
              onClick={() => navigate(`/track?id=${orderData.orderId}`)}
            >
              <MapPin size={16} />
              Track Order
            </button>
          )}
          {onOrderAgain && (
            <button type="button" className="receipt-nav-btn receipt-nav-again" onClick={onOrderAgain}>
              <RotateCcw size={16} />
              Order again
            </button>
          )}
          <button type="button" className="receipt-nav-btn receipt-nav-home" onClick={onHome}>
            <Home size={16} />
            Home
          </button>
        </div>

        <div className="receipt-action-group">
          <button type="button" className="receipt-action-btn" onClick={handleDownload} aria-label="Download receipt as PDF">
            <Download size={16} />
            Download PDF
          </button>

          <button type="button" className="receipt-action-btn" onClick={handleShare}>
            <Share2 size={16} />
            Share
          </button>

          <button type="button" className="receipt-action-btn" onClick={handleWhatsApp}>
            <MessageCircle size={16} />
            WhatsApp
          </button>

          <button type="button" className="receipt-action-btn" onClick={handleEmail}>
            <Mail size={16} />
            Email
          </button>

          <button type="button" className="receipt-action-btn" onClick={handlePrint}>
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
