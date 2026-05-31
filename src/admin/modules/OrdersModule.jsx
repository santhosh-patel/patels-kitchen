import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, EyeOff, Printer, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { getOrders, updateOrderStatus, ORDER_STATUSES } from '../../data/store';

export default function OrdersModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderList, setOrderList] = useState(() => getOrders());
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 12;

  const filteredOrders = useMemo(() => {
    return orderList.filter(order => {
      const matchesSearch = !searchTerm ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone.includes(searchTerm);

      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

      const matchesDate = !dateFilter || order.timestamp.startsWith(dateFilter);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orderList, searchTerm, statusFilter, dateFilter]);

  const totalPages = Math.ceil(filteredOrders.length / perPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    setOrderList(getOrders());
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const handlePrint = (order) => {
    const printContent = `
      PATEL'S KITCHEN
      ================
      Order: ${order.id}
      Date: ${formatDate(order.timestamp)} ${formatTime(order.timestamp)}
      Customer: ${order.customerName}
      Phone: ${order.phone}
      Type: ${order.deliveryType}
      ${order.deliveryType === 'Delivery' ? `Address: ${order.address}` : ''}
      ----------------
      ${order.items.map(i => `${i.name} x${i.quantity}  ₹${i.lineTotal}`).join('\n      ')}
      ----------------
      Subtotal: ₹${order.subtotal}
      Tax (5%): ₹${order.tax}
      Delivery: ₹${order.deliveryFee}
      ================
      TOTAL: ₹${order.total}
      Payment: ${order.paymentMethod}
      Status: ${order.status}
    `;
    const w = window.open('', '_blank', 'width=400,height=600');
    w.document.write(`<pre style="font-family:monospace;padding:20px">${printContent}</pre>`);
    w.print();
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Orders Management</h2>
        <span style={{ fontSize: '0.82rem', color: '#888' }}>
          {filteredOrders.length} orders found
        </span>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="text"
          placeholder="Search by Order ID, customer name, or phone..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
        <select
          className="admin-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="All">All Statuses</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          className="admin-form-input"
          type="date"
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
          style={{ maxWidth: '180px', padding: '0.6rem 0.8rem' }}
        />
      </div>

      {/* Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order) => (
              <React.Fragment key={order.id}>
                <tr>
                  <td>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.82rem' }}>{order.id}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                    <div style={{ fontSize: '0.72rem', color: '#888' }}>{order.phone}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem' }}>{order.items.length} items</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--royal-gold)' }}>₹{order.total}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem' }}>{order.deliveryType}</span>
                  </td>
                  <td>
                    <select
                      className="admin-select"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{
                        padding: '0.3rem 0.5rem', fontSize: '0.72rem', minWidth: '120px',
                        fontWeight: 600, borderRadius: '8px'
                      }}
                    >
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.78rem' }}>{formatDate(order.timestamp)}</div>
                    <div style={{ fontSize: '0.72rem', color: '#888' }}>{formatTime(order.timestamp)}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        title="View Details"
                      >
                        {expandedOrder === order.id ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => handlePrint(order)}
                        title="Print Receipt"
                      >
                        <Printer size={14} />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded Detail Row */}
                {expandedOrder === order.id && (
                  <tr>
                    <td colSpan={8} style={{ padding: 0 }}>
                      <div className="admin-order-detail">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                          <div>
                            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--traditional-brown)' }}>
                              Order Items
                            </h4>
                            <div className="admin-order-items-list">
                              {order.items.map((item, idx) => (
                                <div className="admin-order-item-row" key={idx}>
                                  <span>
                                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                                    <span style={{ color: '#888' }}> x{item.quantity}</span>
                                  </span>
                                  <span style={{ fontWeight: 600 }}>₹{item.lineTotal}</span>
                                </div>
                              ))}
                            </div>
                            <div style={{ marginTop: '0.8rem' }}>
                              <div className="admin-order-summary-row">
                                <span>Subtotal</span><span>₹{order.subtotal}</span>
                              </div>
                              <div className="admin-order-summary-row">
                                <span>Tax (5%)</span><span>₹{order.tax}</span>
                              </div>
                              <div className="admin-order-summary-row">
                                <span>Delivery Fee</span><span>₹{order.deliveryFee}</span>
                              </div>
                              <div className="admin-order-summary-row total">
                                <span>Grand Total</span><span>₹{order.total}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--traditional-brown)' }}>
                              Delivery Details
                            </h4>
                            <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <div><strong>Type:</strong> {order.deliveryType}</div>
                              <div><strong>Payment:</strong> {order.paymentMethod}</div>
                              <div><strong>Address:</strong> {order.address}</div>
                              {order.specialInstructions && (
                                <div>
                                  <strong>Note:</strong>{' '}
                                  <span style={{ color: 'var(--royal-gold)', fontStyle: 'italic' }}>
                                    {order.specialInstructions}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            className="admin-page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`admin-page-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="admin-page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
