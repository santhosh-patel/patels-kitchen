import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, ShoppingCart, UtensilsCrossed, Layers, Users,
  BarChart3, Tag, Star, Receipt, Settings, Menu, ExternalLink
} from 'lucide-react';
import './admin.css';
import logoImg from '../assets/logo.jpg';
import AdminGate from './AdminGate';
import { getOrders } from '../data/store';

import DashboardHome from './modules/DashboardHome';
import OrdersModule from './modules/OrdersModule';
import MenuModule from './modules/MenuModule';
import CategoriesModule from './modules/CategoriesModule';
import CustomersModule from './modules/CustomersModule';
import AnalyticsModule from './modules/AnalyticsModule';
import OffersModule from './modules/OffersModule';
import ReviewsModule from './modules/ReviewsModule';
import ReceiptsModule from './modules/ReceiptsModule';
import SettingsModule from './modules/SettingsModule';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'offers', label: 'Offers', icon: Tag },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'receipts', label: 'Receipts', icon: Receipt },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const MODULE_MAP = {
  dashboard: DashboardHome,
  orders: OrdersModule,
  menu: MenuModule,
  categories: CategoriesModule,
  customers: CustomersModule,
  analytics: AnalyticsModule,
  offers: OffersModule,
  reviews: ReviewsModule,
  receipts: ReceiptsModule,
  settings: SettingsModule,
};

export default function AdminDashboard({ initialModule = 'dashboard' }) {
  const [activeModule, setActiveModule] = useState(initialModule);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const orderCountRef = useRef(getOrders().length);

  useEffect(() => {
    const handler = () => {
      const orders = getOrders();
      if (orders.length > orderCountRef.current) {
        setToast('New order received!');
        orderCountRef.current = orders.length;
        setTimeout(() => setToast(null), 4000);
      } else {
        orderCountRef.current = orders.length;
      }
    };
    window.addEventListener('pk_store_update', handler);
    return () => window.removeEventListener('pk_store_update', handler);
  }, []);

  const ActiveComponent = MODULE_MAP[activeModule] || DashboardHome;
  const activeLabel = NAV_ITEMS.find(n => n.id === activeModule)?.label || 'Dashboard';

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const handleNavClick = (id) => {
    setActiveModule(id);
    setSidebarOpen(false);
    const hash = id === 'dashboard' ? '/admin' : `/admin/${id}`;
    window.history.replaceState(null, '', hash);
  };

  return (
    <AdminGate>
      <div className="admin-shell">
        {toast && <div className="admin-toast">{toast}</div>}

        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="admin-sidebar-brand">
            <img src={logoImg} alt="Patel's Kitchen" />
            <div className="admin-sidebar-brand-text">
              <span className="admin-sidebar-brand-name">Patel's Kitchen</span>
              <span className="admin-sidebar-brand-label">Admin Panel</span>
            </div>
          </div>

          <nav className="admin-sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`admin-nav-item ${activeModule === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <a
              href="/"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                color: 'var(--royal-gold)', textDecoration: 'none',
                fontSize: '0.78rem', fontWeight: 600
              }}
            >
              <ExternalLink size={13} /> View Customer Site
            </a>
            <div style={{ marginTop: '0.6rem', color: '#bbb', fontSize: '0.68rem' }}>
              v1.0.0 · Admin PIN: 1234
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="admin-sidebar-overlay visible"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <main className="admin-main">
          <header className="admin-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <button
                className="admin-hamburger"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
              >
                <Menu size={22} />
              </button>
              <h1 className="admin-header-title">{activeLabel}</h1>
            </div>
            <div className="admin-header-meta">
              <span>{today}</span>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(184,138,59,0.12)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '0.78rem', fontWeight: 700, color: 'var(--royal-gold)'
              }}>
                SP
              </div>
            </div>
          </header>

          <div className="admin-content">
            <ActiveComponent />
          </div>
        </main>
      </div>
    </AdminGate>
  );
}
