export const NAVIGATE_EVENT = 'pk-navigate';

export function navigate(path, { replace = false } = {}) {
  const target = path || '/';
  const updateHistory = replace ? window.history.replaceState : window.history.pushState;
  updateHistory.call(window.history, null, '', target);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.dispatchEvent(new CustomEvent(NAVIGATE_EVENT));
}

export function getPathname() {
  const path = window.location.pathname.replace(/\/$/, '');
  return path || '/';
}

export function syncMenuCategory(categoryId) {
  const path = categoryId === 'all'
    ? '/menu'
    : `/menu?category=${encodeURIComponent(categoryId)}`;
  const onMenu = getPathname() === '/menu';
  navigate(path, { replace: onMenu });
}

export function parseAdminModule() {
  const path = getPathname();
  if (path.startsWith('/admin/')) {
    const mod = path.slice('/admin/'.length).split('/')[0];
    const valid = ['dashboard', 'orders', 'menu', 'categories', 'customers', 'analytics', 'offers', 'reviews', 'receipts', 'settings'];
    if (valid.includes(mod)) return mod;
  }
  const hash = window.location.hash;
  const match = hash.match(/^#\/admin\/?([^?]*)/);
  if (match?.[1]) {
    const mod = match[1].replace(/\/$/, '');
    const valid = ['dashboard', 'orders', 'menu', 'categories', 'customers', 'analytics', 'offers', 'reviews', 'receipts', 'settings'];
    if (valid.includes(mod)) return mod;
  }
  return 'dashboard';
}

export function getActiveView() {
  const path = getPathname();
  const hash = window.location.hash;

  if (path === '/menu') return 'menu';
  if (path === '/track' || hash.startsWith('#/track')) return 'track';
  if (path === '/admin' || path.startsWith('/admin/') || hash.startsWith('#/admin')) return 'admin';
  if (path === '/privacy' || hash.startsWith('#/privacy')) return 'privacy';
  if (path === '/terms' || hash.startsWith('#/terms')) return 'terms';

  if (path === '/') {
    if (!hash || hash === '#' || hash === '#/') return 'home';
    if (hash.startsWith('#') && !hash.startsWith('#/')) {
      const sectionId = hash.slice(1);
      if (['about-section', 'menu-section', 'packaging-section', 'hero', 'root'].includes(sectionId)) {
        return 'home';
      }
    }
    if (hash.startsWith('#/')) return '404';
    return 'home';
  }

  return '404';
}
