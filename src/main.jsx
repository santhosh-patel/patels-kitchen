import { StrictMode, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { StoreProvider } from './context/StoreContext.jsx'
import { OrderingProvider } from './context/OrderingContext.jsx'
import { getActiveView, parseAdminModule } from './lib/navigation.js'

const App = lazy(() => import('./App.jsx'))
const MenuPage = lazy(() => import('./pages/MenuPage.jsx'))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard.jsx'))
const OrderTracker = lazy(() => import('./components/OrderTracker.jsx'))
const NotFound = lazy(() => import('./components/NotFound.jsx'))
const LegalPage = lazy(() => import('./pages/LegalPage.jsx'))

function LoadingFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-headings)',
      color: 'var(--royal-gold)',
      letterSpacing: '0.1em'
    }}>
      Loading Patel's Kitchen...
    </div>
  )
}

function Router() {
  const [view, setView] = useState(getActiveView())
  const [adminModule, setAdminModule] = useState(parseAdminModule)

  useEffect(() => {
    const sync = () => {
      setView(getActiveView())
      setAdminModule(parseAdminModule())
    }
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [])

  let content
  if (view === 'menu') {
    content = <MenuPage key={window.location.search} />
  } else if (view === 'admin') {
    content = <AdminDashboard key={adminModule} initialModule={adminModule} />
  } else if (view === 'track') {
    content = <OrderTracker />
  } else if (view === '404') {
    content = <NotFound />
  } else if (view === 'privacy') {
    content = <LegalPage type="privacy" />
  } else if (view === 'terms') {
    content = <LegalPage type="terms" />
  } else {
    content = <App />
  }

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Suspense fallback={<LoadingFallback />}>
        {content}
      </Suspense>
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <OrderingProvider>
        <Router />
      </OrderingProvider>
    </StoreProvider>
  </StrictMode>,
)
