import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { customers, orders } from '../../data/adminData';

export default function CustomersModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('totalSpent');
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  const sortedCustomers = useMemo(() => {
    let list = customers.filter(c => c.totalOrders > 0);

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'totalSpent') return b.totalSpent - a.totalSpent;
      if (sortBy === 'totalOrders') return b.totalOrders - a.totalOrders;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'recent') return new Date(b.lastOrderDate) - new Date(a.lastOrderDate);
      return 0;
    });

    return list;
  }, [searchTerm, sortBy]);

  const getCustomerOrders = (customerId) => {
    return orders.filter(o => o.customerId === customerId).slice(0, 10);
  };

  const formatDate = (ts) => {
    if (!ts) return '-';
    return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Customers</h2>
        <span style={{ fontSize: '0.82rem', color: '#888' }}>
          {sortedCustomers.length} active customers
        </span>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="text"
          placeholder="Search by name, phone, email, or area..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="admin-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="totalSpent">Sort by Total Spent</option>
          <option value="totalOrders">Sort by Total Orders</option>
          <option value="name">Sort by Name</option>
          <option value="recent">Sort by Recent Order</option>
        </select>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Area</th>
              <th>Total Orders</th>
              <th>Total Spent</th>
              <th>Last Order</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {sortedCustomers.map((customer) => (
              <React.Fragment key={customer.id}>
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'rgba(184,138,59,0.1)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.82rem', fontWeight: 700, color: 'var(--royal-gold)'
                      }}>
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{customer.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#888' }}>{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{customer.phone}</td>
                  <td style={{ fontSize: '0.82rem' }}>{customer.area}</td>
                  <td>
                    <span style={{ fontWeight: 700 }}>{customer.totalOrders}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--royal-gold)' }}>
                      ₹{Math.round(customer.totalSpent).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>
                    {formatDate(customer.lastOrderDate)}
                  </td>
                  <td>
                    <button
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() => setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)}
                    >
                      {expandedCustomer === customer.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </td>
                </tr>

                {expandedCustomer === customer.id && (
                  <tr>
                    <td colSpan={7} style={{ padding: 0 }}>
                      <div className="admin-order-detail">
                        <h4 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--traditional-brown)' }}>
                          Order History (Last 10)
                        </h4>
                        <div className="admin-order-items-list">
                          {getCustomerOrders(customer.id).map((order) => (
                            <div className="admin-order-item-row" key={order.id}>
                              <span>
                                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{order.id}</span>
                                <span style={{ color: '#888', margin: '0 0.4rem' }}>·</span>
                                <span style={{ fontSize: '0.78rem' }}>{order.items.length} items</span>
                              </span>
                              <span className={`admin-badge ${order.status.toLowerCase().replace(/ /g, '-')}`}>
                                {order.status}
                              </span>
                              <span style={{ fontWeight: 600 }}>₹{order.total}</span>
                              <span style={{ fontSize: '0.72rem', color: '#888' }}>
                                {formatDate(order.timestamp)}
                              </span>
                            </div>
                          ))}
                          {getCustomerOrders(customer.id).length === 0 && (
                            <div style={{ color: '#888', fontSize: '0.82rem', padding: '0.5rem 0' }}>
                              No orders found
                            </div>
                          )}
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
    </div>
  );
}
