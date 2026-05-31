import React from 'react';
import {
  ShoppingBag, DollarSign, Clock, ChefHat, Truck, XCircle,
  Star, Users, TrendingUp, ArrowUpRight
} from 'lucide-react';
import { getDashboardStats, getOrders } from '../../data/store';

export default function DashboardHome() {
  const stats = getDashboardStats();
  const orders = getOrders();

  const recentOrders = orders.slice(0, 8);

  const statCards = [
    { label: 'Orders Today', value: stats.totalOrdersToday, icon: ShoppingBag, color: 'gold' },
    { label: 'Revenue Today', value: `₹${stats.revenueToday.toLocaleString('en-IN')}`, icon: DollarSign, color: 'green' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'orange' },
    { label: 'Preparing', value: stats.preparingOrders, icon: ChefHat, color: 'blue' },
    { label: 'Delivered', value: stats.deliveredOrders, icon: Truck, color: 'green' },
    { label: 'Cancelled', value: stats.cancelledOrders, icon: XCircle, color: 'red' },
    { label: 'Popular Dish', value: stats.popularDish, icon: Star, color: 'gold', isText: true },
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'purple' },
  ];

  const getStatusDot = (status) => {
    const map = {
      'New': 'blue', 'Accepted': 'orange', 'Preparing': 'orange',
      'Ready': 'green', 'Out for Delivery': 'blue', 'Delivered': 'green',
      'Cancelled': 'red'
    };
    return map[status] || 'blue';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Dashboard Overview</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#888' }}>
          <TrendingUp size={14} style={{ color: 'var(--royal-gold)' }} />
          <span>All Time: {stats.totalAllTimeOrders} orders · ₹{stats.totalAllTimeRevenue.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="admin-stats-grid">
        {statCards.map((card, i) => (
          <div className="admin-stat-card" key={i}>
            <div className={`admin-stat-icon ${card.color}`}>
              <card.icon size={22} />
            </div>
            <div className="admin-stat-info">
              <h4 style={card.isText ? { fontSize: '0.95rem' } : {}}>{card.value}</h4>
              <p>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="admin-chart-card">
          <h3>Recent Orders</h3>
          <div className="admin-activity-feed">
            {recentOrders.map((order) => (
              <div className="admin-activity-item" key={order.id}>
                <div className={`admin-activity-dot ${getStatusDot(order.status)}`} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600 }}>{order.id}</span>
                  <span style={{ color: '#888', margin: '0 0.4rem' }}>·</span>
                  <span>{order.customerName}</span>
                </div>
                <span className={`admin-badge ${order.status.toLowerCase().replace(/ /g, '-')}`}>
                  {order.status}
                </span>
                <span className="admin-activity-time">{formatTime(order.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-chart-card">
          <h3>Top Performing Dishes</h3>
          <div className="admin-activity-feed">
            {(() => {
              const dishCounts = {};
              orders.forEach(o => {
                if (o.status === 'Cancelled') return;
                o.items.forEach(item => {
                  if (!dishCounts[item.id]) dishCounts[item.id] = { name: item.name, count: 0, revenue: 0 };
                  dishCounts[item.id].count += item.quantity;
                  dishCounts[item.id].revenue += item.lineTotal;
                });
              });
              return Object.values(dishCounts).sort((a, b) => b.count - a.count).slice(0, 8);
            })().map((dish, i) => (
              <div className="admin-activity-item" key={i}>
                <span style={{
                  width: '24px', height: '24px', borderRadius: '6px',
                  background: i < 3 ? 'rgba(184,138,59,0.12)' : 'var(--heritage-cream)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 700,
                  color: i < 3 ? 'var(--royal-gold)' : '#888'
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600 }}>{dish.name}</span>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#888' }}>{dish.count} sold</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--royal-gold)' }}>
                  ₹{dish.revenue.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
