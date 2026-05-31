import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'
import NotFound from './components/NotFound.jsx'

function Router() {
  const getActiveView = () => {
    const hash = window.location.hash;
    if (!hash || hash === '#' || hash === '#/') {
      return 'home';
    }
    if (hash.startsWith('#/admin')) {
      return 'admin';
    }
    // Handle standard section scroll targets
    if (hash.startsWith('#') && !hash.startsWith('#/')) {
      const sectionId = hash.slice(1);
      if (['about-section', 'menu-section', 'packaging-section', 'hero', 'root'].includes(sectionId)) {
        return 'home';
      }
    }
    return '404';
  };

  const [view, setView] = useState(getActiveView());

  useEffect(() => {
    const handleHashChange = () => {
      setView(getActiveView());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (view === 'admin') {
    return <AdminDashboard />;
  } else if (view === '404') {
    return <NotFound />;
  }
  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
