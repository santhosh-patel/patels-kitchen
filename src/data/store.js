import { menuData, MENU_CATEGORIES } from './menuData.js';
import {
  orders as seedOrders,
  customers as seedCustomers,
  reviews as seedReviews,
  coupons as seedCoupons,
  restaurantSettings as seedSettings,
  ORDER_STATUSES,
  PAYMENT_METHODS
} from './adminData.js';

export { ORDER_STATUSES, PAYMENT_METHODS };

// Helper to safely parse localStorage keys or return a seed
const loadData = (key, seed) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error(`Error loading localStorage key: ${key}`, e);
    return seed;
  }
};

const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Dispatch custom event to notify other parts of the app if needed
    window.dispatchEvent(new Event('pk_store_update'));
  } catch (e) {
    console.error(`Error saving localStorage key: ${key}`, e);
  }
};

// Initial setup / seeding
export const initializeStore = () => {
  loadData('pk_dishes', menuData);
  loadData('pk_categories', MENU_CATEGORIES);
  loadData('pk_orders', seedOrders);
  loadData('pk_customers', seedCustomers);
  loadData('pk_reviews', seedReviews);
  loadData('pk_coupons', seedCoupons);
  loadData('pk_settings', seedSettings);
};

// Always run initialization on load
initializeStore();

// --- DISHES CRUD ---
export const getDishes = () => loadData('pk_dishes', menuData);
export const saveDish = (dish) => {
  const dishes = getDishes();
  const index = dishes.findIndex(d => d.id === dish.id);
  if (index >= 0) {
    dishes[index] = { ...dishes[index], ...dish };
  } else {
    dishes.push(dish);
  }
  saveData('pk_dishes', dishes);
  return dish;
};
export const deleteDish = (dishId) => {
  const dishes = getDishes();
  const updated = dishes.filter(d => d.id !== dishId);
  saveData('pk_dishes', updated);
};

// --- CATEGORIES CRUD ---
export const getCategories = () => loadData('pk_categories', MENU_CATEGORIES);
export const saveCategories = (categories) => {
  saveData('pk_categories', categories);
};

// --- CUSTOMERS CRUD ---
export const getCustomers = () => loadData('pk_customers', seedCustomers);
export const saveCustomer = (customer) => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === customer.id);
  if (index >= 0) {
    customers[index] = { ...customers[index], ...customer };
  } else {
    customers.push(customer);
  }
  saveData('pk_customers', customers);
  return customer;
};

// --- REVIEWS CRUD ---
export const getReviews = () => loadData('pk_reviews', seedReviews);
export const saveReview = (review) => {
  const reviews = getReviews();
  const index = reviews.findIndex(r => r.id === review.id);
  if (index >= 0) {
    reviews[index] = { ...reviews[index], ...review };
  } else {
    reviews.push(review);
  }
  saveData('pk_reviews', reviews);
  return review;
};

// --- COUPONS CRUD ---
export const getCoupons = () => loadData('pk_coupons', seedCoupons);
export const saveCoupon = (coupon) => {
  const coupons = getCoupons();
  const index = coupons.findIndex(c => c.id === coupon.id);
  if (index >= 0) {
    coupons[index] = { ...coupons[index], ...coupon };
  } else {
    coupons.push(coupon);
  }
  saveData('pk_coupons', coupons);
  return coupon;
};
export const deleteCoupon = (couponId) => {
  const coupons = getCoupons();
  const updated = coupons.filter(c => c.id !== couponId);
  saveData('pk_coupons', updated);
};

// --- SETTINGS CRUD ---
export const getSettings = () => loadData('pk_settings', seedSettings);
export const saveSettings = (settings) => {
  saveData('pk_settings', settings);
};

// --- CART & COUPON PERSISTENCE ---
export const getCart = () => loadData('pk_cart', []);
export const saveCart = (cart) => saveData('pk_cart', cart);
export const getActiveCoupon = () => {
  const data = localStorage.getItem('pk_active_coupon');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};
export const saveActiveCoupon = (coupon) => {
  if (coupon) {
    localStorage.setItem('pk_active_coupon', JSON.stringify(coupon));
  } else {
    localStorage.removeItem('pk_active_coupon');
  }
  window.dispatchEvent(new Event('pk_store_update'));
};

export const deleteReview = (reviewId) => {
  const reviews = getReviews().filter(r => r.id !== reviewId);
  saveData('pk_reviews', reviews);
};

export const restoreDemoData = () => {
  const keys = [
    'pk_dishes', 'pk_categories', 'pk_orders', 'pk_customers',
    'pk_reviews', 'pk_coupons', 'pk_settings', 'pk_cart', 'pk_active_coupon'
  ];
  keys.forEach(k => localStorage.removeItem(k));
  initializeStore();
  window.dispatchEvent(new Event('pk_store_update'));
};

// --- ORDERS CRUD & LIVE SYNC ---
export const getOrders = () => loadData('pk_orders', seedOrders);

export const addOrder = (order) => {
  const orders = getOrders();
  // Ensure order has ID, timestamp, status
  const finalOrder = {
    id: order.id || `PK-${Math.floor(100000 + Math.random() * 900000)}`,
    status: order.status || 'New',
    timestamp: order.timestamp || new Date().toISOString(),
    items: order.items || [],
    subtotal: order.subtotal || 0,
    tax: order.tax || 0,
    deliveryFee: order.deliveryFee || 0,
    discount: order.discount || 0,
    couponCode: order.couponCode || null,
    packagingFee: order.packagingFee || 0,
    packagingType: order.packagingType || 'none',
    deliveryMode: order.deliveryMode || 'delivery',
    total: order.total || 0,
    paymentMethod: order.paymentMethod || 'UPI',
    specialInstructions: order.specialInstructions || '',
    deliveryType: order.deliveryType || 'Delivery',
    customerName: order.customerName || 'Guest',
    phone: order.phone || '',
    address: order.address || '',
    customerId: order.customerId || `cust-${Math.floor(100 + Math.random() * 900)}`
  };

  orders.unshift(finalOrder); // Add to the top
  saveData('pk_orders', orders);

  // Sync or create customer profile
  const customersList = getCustomers();
  let customer = customersList.find(c => c.phone === finalOrder.phone || c.id === finalOrder.customerId);
  if (!customer) {
    customer = {
      id: finalOrder.customerId,
      name: finalOrder.customerName,
      phone: finalOrder.phone,
      email: `${finalOrder.customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
      address: finalOrder.address,
      area: finalOrder.address ? finalOrder.address.split(',').slice(-2, -1)[0]?.trim() || 'Jubilee Hills' : 'Jubilee Hills',
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: null,
      joinedDate: new Date().toISOString()
    };
    customersList.push(customer);
  }

  customer.totalOrders += 1;
  customer.totalSpent += finalOrder.total;
  customer.lastOrderDate = finalOrder.timestamp;
  saveData('pk_customers', customersList);

  // Sync coupon usage if coupon code was used
  if (order.couponCode) {
    const couponsList = getCoupons();
    const couponIndex = couponsList.findIndex(c => c.code.toUpperCase() === order.couponCode.toUpperCase());
    if (couponIndex >= 0) {
      couponsList[couponIndex].usageCount = (couponsList[couponIndex].usageCount || 0) + 1;
      saveData('pk_coupons', couponsList);
    }
  }

  return finalOrder;
};

export const updateOrderStatus = (orderId, newStatus) => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index >= 0) {
    orders[index].status = newStatus;
    saveData('pk_orders', orders);
    return orders[index];
  }
  return null;
};

// --- DYNAMIC ANALYTICS ENGINE (COMPUTED ON LIVE LS DATA) ---

export const getDailyRevenue = (dayCount = 7) => {
  const now = new Date();
  const days = [];
  const allOrders = getOrders();

  for (let i = dayCount - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

    const dayOrders = allOrders.filter(o => {
      const oDate = new Date(o.timestamp);
      return oDate.toDateString() === date.toDateString() && o.status !== 'Cancelled';
    });

    days.push({
      label: dateStr,
      date: date.toISOString().split('T')[0],
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      orderCount: dayOrders.length
    });
  }
  return days;
};

export const getWeeklyRevenue = () => {
  const now = new Date();
  const weeks = [];
  const allOrders = getOrders();

  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (w * 7) - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekOrders = allOrders.filter(o => {
      const oDate = new Date(o.timestamp);
      return oDate >= weekStart && oDate <= weekEnd && o.status !== 'Cancelled';
    });

    weeks.push({
      label: `Week ${4 - w}`,
      startDate: weekStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      endDate: weekEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      revenue: weekOrders.reduce((sum, o) => sum + o.total, 0),
      orderCount: weekOrders.length
    });
  }
  return weeks;
};

export const getMonthlyRevenue = () => {
  const months = [];
  const now = new Date();
  const allOrders = getOrders();

  for (let m = 5; m >= 0; m--) {
    const month = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 0);

    const monthOrders = allOrders.filter(o => {
      const oDate = new Date(o.timestamp);
      return oDate >= month && oDate <= monthEnd && o.status !== 'Cancelled';
    });

    months.push({
      label: month.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      revenue: monthOrders.reduce((sum, o) => sum + o.total, 0),
      orderCount: monthOrders.length
    });
  }
  return months;
};

export const getMostOrderedDishes = (limit = 10) => {
  const dishCounts = {};
  const allOrders = getOrders();

  allOrders.forEach(order => {
    if (order.status === 'Cancelled') return;
    order.items.forEach(item => {
      if (!dishCounts[item.id]) {
        dishCounts[item.id] = { name: item.name, count: 0, revenue: 0 };
      }
      dishCounts[item.id].count += item.quantity;
      dishCounts[item.id].revenue += item.lineTotal;
    });
  });

  return Object.values(dishCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

export const getOrdersByCategory = () => {
  const catCounts = {};
  const categories = getCategories();
  const allOrders = getOrders();

  categories.filter(c => c.id !== 'all').forEach(cat => {
    catCounts[cat.id] = { name: cat.name, count: 0, revenue: 0 };
  });

  allOrders.forEach(order => {
    if (order.status === 'Cancelled') return;
    order.items.forEach(item => {
      if (catCounts[item.category]) {
        catCounts[item.category].count += item.quantity;
        catCounts[item.category].revenue += item.lineTotal;
      }
    });
  });

  return Object.values(catCounts).sort((a, b) => b.revenue - a.revenue);
};

export const getDashboardStats = () => {
  const now = new Date();
  const allOrders = getOrders();
  const customersList = getCustomers();
  const todayOrders = allOrders.filter(o => new Date(o.timestamp).toDateString() === now.toDateString());

  return {
    totalOrdersToday: todayOrders.length,
    revenueToday: todayOrders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0),
    pendingOrders: todayOrders.filter(o => o.status === 'New' || o.status === 'Accepted').length,
    preparingOrders: todayOrders.filter(o => o.status === 'Preparing').length,
    deliveredOrders: todayOrders.filter(o => o.status === 'Delivered').length,
    cancelledOrders: todayOrders.filter(o => o.status === 'Cancelled').length,
    totalCustomers: customersList.length,
    popularDish: getMostOrderedDishes(1)[0]?.name || 'N/A',
    totalAllTimeOrders: allOrders.length,
    totalAllTimeRevenue: allOrders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0)
  };
};

export const calculateDiscount = (coupon, subtotal) => {
  if (!coupon || !coupon.isActive) return 0;
  if (subtotal < coupon.minOrder) return 0;
  
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = Math.round(subtotal * (coupon.value / 100));
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else if (coupon.type === 'flat') {
    discount = Math.min(coupon.value, subtotal);
  }
  return discount;
};
