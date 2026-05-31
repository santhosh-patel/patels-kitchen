import React, { useState, useMemo } from 'react';
import { Search, Printer, Copy, Eye } from 'lucide-react';
import { getOrders } from '../../data/store';

export default function ReceiptsModule() {
  const orders = getOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const deliveredOrders = useMemo(() => {
    return orders
      .filter(o => o.status === 'Delivered')
      .filter(o => !searchTerm || o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const generateReceiptText = (order) => {
    const lines = [
      '========================================',
      "        PATEL'S KITCHEN",
      '   Authentic South Indian & Hyderabadi',
      '========================================',
      `  Order: ${order.id}`,
      `  Date: ${formatDate(order.timestamp)} ${formatTime(order.timestamp)}`,
      '----------------------------------------',
      `  Customer: ${order.customerName}`,
      `  Phone: ${order.phone}`,
      `  Type: ${order.deliveryType}`,
      order.deliveryType === 'Delivery' ? `  Address: ${order.address}` : '',
      '----------------------------------------',
      '  ITEMS',
      '----------------------------------------',
      ...order.items.map(i => `  ${i.name} x${i.quantity}        ₹${i.lineTotal}`),
      '----------------------------------------',
      `  Subtotal:              ₹${order.subtotal}`,
      `  Tax (5%):              ₹${order.tax}`,
      `  Delivery:              ₹${order.deliveryFee}`,
      '========================================',
      `  GRAND TOTAL:           ₹${order.total}`,
      '========================================',
      `  Payment: ${order.paymentMethod}`,
      '',
      '    Thank you for dining with us!',
      '     Visit again, Pranam!',
      '========================================',
    ].filter(Boolean);
    return lines.join('\n');
  };

  const handlePrint = (order) => {
    const text = generateReceiptText(order);
    const w = window.open('', '_blank', 'width=420,height=650');
    w.document.write(`<pre style="font-family:'Courier New',monospace;padding:20px;font-size:13px">${text}</pre>`);
    w.print();
  };

  const handleCopy = (order) => {
    const text = generateReceiptText(order);
    navigator.clipboard.writeText(text).then(() => {
      alert('Receipt copied to clipboard!');
    });
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Receipt Management</h2>
        <span style={{ fontSize: '0.82rem', color: '#888' }}>
          {deliveredOrders.length} receipts available
        </span>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="text"
          placeholder="Search by Order ID or customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedReceipt ? '1fr 400px' : '1fr', gap: '1.5rem' }}>
        {/* List */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveredOrders.slice(0, 25).map((order) => (
                <tr key={order.id} style={{ background: selectedReceipt?.id === order.id ? 'rgba(184,138,59,0.04)' : '' }}>
                  <td>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{order.id}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                  </td>
                  <td>{order.items.length} items</td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--royal-gold)' }}>₹{order.total}</span>
                  </td>
                  <td style={{ fontSize: '0.78rem' }}>
                    {formatDate(order.timestamp)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => setSelectedReceipt(order)}
                        title="View Receipt"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => handlePrint(order)}
                        title="Print"
                      >
                        <Printer size={13} />
                      </button>
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => handleCopy(order)}
                        title="Copy"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Receipt Preview */}
        {selectedReceipt && (
          <div className="admin-receipt-preview">
            <h4>PATEL'S KITCHEN</h4>
            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#888', marginBottom: '0.5rem' }}>
              Authentic South Indian & Hyderabadi
            </p>
            <hr className="admin-receipt-divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span>Order: {selectedReceipt.id}</span>
              <span>{formatDate(selectedReceipt.timestamp)}</span>
            </div>
            <div style={{ fontSize: '0.78rem', marginTop: '0.3rem' }}>
              <div>{selectedReceipt.customerName}</div>
              <div style={{ color: '#888' }}>{selectedReceipt.phone}</div>
              <div style={{ color: '#888' }}>{selectedReceipt.deliveryType}</div>
            </div>
            <hr className="admin-receipt-divider" />
            {selectedReceipt.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.2rem 0' }}>
                <span>{item.name} x{item.quantity}</span>
                <span>₹{item.lineTotal}</span>
              </div>
            ))}
            <hr className="admin-receipt-divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span>Subtotal</span><span>₹{selectedReceipt.subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span>Tax (5%)</span><span>₹{selectedReceipt.tax}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span>Delivery</span><span>₹{selectedReceipt.deliveryFee}</span>
            </div>
            <hr className="admin-receipt-divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 700 }}>
              <span>TOTAL</span><span>₹{selectedReceipt.total}</span>
            </div>
            <hr className="admin-receipt-divider" />
            <div style={{ fontSize: '0.72rem', color: '#888' }}>
              Payment: {selectedReceipt.paymentMethod}
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#888', marginTop: '1rem' }}>
              Thank you for dining with us!
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
              <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => handlePrint(selectedReceipt)}>
                <Printer size={13} /> Print
              </button>
              <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => handleCopy(selectedReceipt)}>
                <Copy size={13} /> Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
