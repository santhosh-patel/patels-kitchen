import React, { useMemo } from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { getDailyRevenue, getWeeklyRevenue, getMonthlyRevenue, getMostOrderedDishes, getOrdersByCategory } from '../../data/store';

function BarChart({ data, valueKey = 'revenue', labelKey = 'label', maxHeight = 180, barColor = 'var(--royal-gold)' }) {
  const maxVal = Math.max(...data.map(d => d[valueKey]), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem', height: maxHeight, padding: '0 0.5rem' }}>
      {data.map((item, i) => {
        const height = (item[valueKey] / maxVal) * maxHeight * 0.85;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--deep-charcoal)' }}>
              {valueKey === 'revenue' ? `₹${(item[valueKey] / 1000).toFixed(1)}k` : item[valueKey]}
            </span>
            <div style={{
              width: '100%', maxWidth: '48px', height: `${Math.max(height, 4)}px`,
              background: barColor, borderRadius: '6px 6px 2px 2px',
              transition: 'height 0.5s ease', minHeight: '4px'
            }} />
            <span style={{ fontSize: '0.65rem', color: '#888', textAlign: 'center', lineHeight: 1.2 }}>
              {item[labelKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalBarChart({ data, maxHeight = 300 }) {
  const maxVal = Math.max(...data.map(d => d.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {data.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ width: '140px', fontSize: '0.78rem', fontWeight: 500, textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name}
          </span>
          <div style={{ flex: 1, height: '24px', background: 'var(--heritage-cream)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${(item.count / maxVal) * 100}%`,
              background: `linear-gradient(90deg, var(--royal-gold), var(--copper))`,
              borderRadius: '6px', transition: 'width 0.5s ease',
              display: 'flex', alignItems: 'center', paddingLeft: '0.5rem'
            }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--pure-white)' }}>
                {item.count}
              </span>
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--royal-gold)', fontWeight: 700, width: '70px', textAlign: 'right' }}>
            ₹{item.revenue.toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
}

function CategoryBreakdown({ data }) {
  const total = data.reduce((s, d) => s + d.revenue, 0);
  const colors = ['#B88A3B', '#A85D35', '#5C3D2E', '#D8C4A5', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];

  return (
    <div>
      <div style={{ display: 'flex', height: '28px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
        {data.map((item, i) => (
          <div
            key={i}
            style={{
              width: `${(item.revenue / Math.max(total, 1)) * 100}%`,
              background: colors[i % colors.length],
              minWidth: '2px',
              transition: 'width 0.5s ease'
            }}
            title={`${item.name}: ₹${item.revenue.toLocaleString('en-IN')}`}
          />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
        {data.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: colors[i % colors.length] }} />
            <span style={{ fontWeight: 600 }}>{item.name}</span>
            <span style={{ color: '#888' }}>₹{item.revenue.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsModule() {
  const dailyData = useMemo(() => getDailyRevenue(7), []);
  const weeklyData = useMemo(() => getWeeklyRevenue(), []);
  const monthlyData = useMemo(() => getMonthlyRevenue(), []);
  const topDishes = useMemo(() => getMostOrderedDishes(10), []);
  const categoryData = useMemo(() => getOrdersByCategory(), []);

  const totalRevenue = dailyData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = dailyData.reduce((s, d) => s + d.orderCount, 0);

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Analytics</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#888' }}>
          <TrendingUp size={14} style={{ color: 'var(--royal-gold)' }} />
          <span>Last 7 days: ₹{totalRevenue.toLocaleString('en-IN')} · {totalOrders} orders</span>
        </div>
      </div>

      <div className="admin-chart-grid">
        {/* Daily Sales */}
        <div className="admin-chart-card">
          <h3>Daily Sales (Last 7 Days)</h3>
          <BarChart data={dailyData} />
        </div>

        {/* Weekly Sales */}
        <div className="admin-chart-card">
          <h3>Weekly Summary (Last 4 Weeks)</h3>
          <BarChart data={weeklyData} barColor="var(--copper)" />
        </div>
      </div>

      <div className="admin-chart-grid">
        {/* Monthly Revenue */}
        <div className="admin-chart-card">
          <h3>Monthly Revenue Trend (Last 6 Months)</h3>
          <BarChart data={monthlyData} barColor="var(--traditional-brown)" />
        </div>

        {/* Revenue by Category */}
        <div className="admin-chart-card">
          <h3>Revenue by Category</h3>
          <CategoryBreakdown data={categoryData} />
        </div>
      </div>

      {/* Most Ordered Dishes */}
      <div className="admin-chart-card">
        <h3>Most Ordered Dishes (Top 10)</h3>
        <HorizontalBarChart data={topDishes} />
      </div>
    </div>
  );
}
