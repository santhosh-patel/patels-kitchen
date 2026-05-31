// ==========================================================================
// Patel's Kitchen — Admin Dummy Data Engine
// Generates realistic orders, customers, reviews, coupons, and analytics
// seeded from the live menuData.js for full consistency.
// ==========================================================================

import { menuData, MENU_CATEGORIES } from './menuData.js';

// ---------------------------------------------------------------------------
// 1. CUSTOMER DATABASE (40 customers)
// ---------------------------------------------------------------------------
const firstNames = [
  'Aarav', 'Priya', 'Rohit', 'Sneha', 'Vikram', 'Ananya', 'Karthik', 'Divya',
  'Arjun', 'Meera', 'Siddharth', 'Pooja', 'Rahul', 'Kavya', 'Aditya', 'Nisha',
  'Varun', 'Lakshmi', 'Suresh', 'Anjali', 'Manish', 'Swathi', 'Ravi', 'Deepa',
  'Nikhil', 'Bhavana', 'Prasad', 'Harini', 'Rajesh', 'Sanya', 'Gopal', 'Radha',
  'Venkat', 'Madhavi', 'Ashwin', 'Tanvi', 'Srinivas', 'Lavanya', 'Chetan', 'Ritu'
];

const lastNames = [
  'Sharma', 'Reddy', 'Patel', 'Iyer', 'Rao', 'Gupta', 'Nair', 'Kumar',
  'Singh', 'Menon', 'Desai', 'Joshi', 'Verma', 'Bhat', 'Choudhary', 'Pillai',
  'Agarwal', 'Mishra', 'Hegde', 'Kulkarni', 'Shetty', 'Patil', 'Malhotra', 'Kapoor',
  'Bansal', 'Saxena', 'Dubey', 'Tiwari', 'Chauhan', 'Pandey', 'Rajan', 'Das',
  'Prasad', 'Mukherjee', 'Bose', 'Ghosh', 'Dutta', 'Sen', 'Nanda', 'Thakur'
];

const areas = [
  'Jubilee Hills', 'Banjara Hills', 'Madhapur', 'Gachibowli', 'Kondapur',
  'Hitech City', 'Kukatpally', 'Ameerpet', 'Begumpet', 'Secunderabad',
  'Mehdipatnam', 'Tolichowki', 'Miyapur', 'Manikonda', 'Narsingi',
  'Attapur', 'Shamshabad', 'LB Nagar', 'Dilsukhnagar', 'Charminar'
];

function generatePhone() {
  const prefixes = ['98480', '90000', '81425', '99490', '70135', '88860', '93928', '77020'];
  return `+91 ${prefixes[Math.floor(Math.random() * prefixes.length)]}${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
}

function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = seededRandom(42);

export const customers = firstNames.map((first, i) => {
  const last = lastNames[i % lastNames.length];
  const area = areas[i % areas.length];
  const houseNo = Math.floor(rng() * 500) + 1;
  const street = Math.floor(rng() * 20) + 1;
  return {
    id: `cust-${String(i + 1).padStart(3, '0')}`,
    name: `${first} ${last}`,
    phone: generatePhone(),
    email: `${first.toLowerCase()}.${last.toLowerCase()}@gmail.com`,
    address: `${houseNo}, Street ${street}, ${area}, Hyderabad`,
    area,
    totalOrders: 0,
    totalSpent: 0,
    lastOrderDate: null,
    joinedDate: new Date(2025, Math.floor(rng() * 12), Math.floor(rng() * 28) + 1).toISOString()
  };
});

// ---------------------------------------------------------------------------
// 2. ORDER DATABASE (~120 orders across 30 days)
// ---------------------------------------------------------------------------
const ORDER_STATUSES = ['New', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'];
const PAYMENT_METHODS = ['UPI', 'Cash on Delivery', 'Credit Card', 'Debit Card', 'Wallet'];

const specialInstructions = [
  '', '', '', '', '', // Most orders have no special instructions
  'Extra spicy please',
  'No onions',
  'Less oil',
  'Pack raita separately',
  'Extra chutney',
  'Add extra ghee',
  'No garlic',
  'Pack items separately',
  'Ring the bell twice',
  'Leave at door',
  'Extra napkins please'
];

function generateOrderItems() {
  const itemCount = Math.floor(rng() * 4) + 1; // 1-4 items per order
  const items = [];
  const usedIds = new Set();

  for (let i = 0; i < itemCount; i++) {
    let item;
    do {
      item = menuData[Math.floor(rng() * menuData.length)];
    } while (usedIds.has(item.id));
    usedIds.add(item.id);

    const qty = Math.floor(rng() * 3) + 1; // 1-3 qty
    items.push({
      ...item,
      quantity: qty,
      lineTotal: item.price * qty
    });
  }
  return items;
}

function generateOrders() {
  const orders = [];
  const now = new Date();

  for (let i = 0; i < 120; i++) {
    const daysAgo = Math.floor(rng() * 30);
    const hour = Math.floor(rng() * 14) + 8; // 8 AM to 10 PM
    const minute = Math.floor(rng() * 60);

    const orderDate = new Date(now);
    orderDate.setDate(orderDate.getDate() - daysAgo);
    orderDate.setHours(hour, minute, 0, 0);

    const customer = customers[Math.floor(rng() * customers.length)];
    const items = generateOrderItems();
    const subtotal = items.reduce((sum, it) => sum + it.lineTotal, 0);
    const tax = Math.round(subtotal * 0.05);
    const deliveryFee = subtotal > 500 ? 0 : 40;
    const total = subtotal + tax + deliveryFee;

    // Recent orders get active statuses, older ones are delivered/cancelled
    let status;
    if (daysAgo === 0) {
      const statusPool = ['New', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'];
      status = statusPool[Math.floor(rng() * statusPool.length)];
    } else if (daysAgo <= 1) {
      status = rng() > 0.1 ? 'Delivered' : 'Cancelled';
    } else {
      status = rng() > 0.08 ? 'Delivered' : 'Cancelled';
    }

    const orderId = `PK-${String(2600 + i).padStart(5, '0')}`;

    orders.push({
      id: orderId,
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      address: customer.address,
      items,
      subtotal,
      tax,
      deliveryFee,
      total,
      status,
      paymentMethod: PAYMENT_METHODS[Math.floor(rng() * PAYMENT_METHODS.length)],
      timestamp: orderDate.toISOString(),
      specialInstructions: specialInstructions[Math.floor(rng() * specialInstructions.length)],
      deliveryType: rng() > 0.3 ? 'Delivery' : 'Dine-in'
    });

    // Update customer aggregates
    customer.totalOrders += 1;
    customer.totalSpent += total;
    if (!customer.lastOrderDate || new Date(orderDate) > new Date(customer.lastOrderDate)) {
      customer.lastOrderDate = orderDate.toISOString();
    }
  }

  // Sort by timestamp descending (newest first)
  orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return orders;
}

export const orders = generateOrders();

// ---------------------------------------------------------------------------
// 3. REVIEWS DATABASE (~60 reviews)
// ---------------------------------------------------------------------------
const reviewTexts = [
  'Absolutely incredible! The biryani was perfectly cooked with tender meat and fragrant rice.',
  'Best dosa I have ever had in Hyderabad. Crispy, golden, and paired perfectly with the chutney.',
  'The Chicken 65 was bursting with flavor. Will definitely order again!',
  'Paneer Tikka was smoky and well-marinated. A must-try for vegetarians.',
  'Filter Coffee reminded me of my grandmother kitchen. Authentic and soulful.',
  'Good food but delivery was slightly delayed. Otherwise everything was perfect.',
  'The Gulab Jamun was heavenly soft and perfectly sweetened. Amazing!',
  'Mutton Biryani was outstanding. Rich, aromatic, and extremely generous portions.',
  'Upma was average. Expected a bit more flavor and texture.',
  'Patel Special Mega Thali is a complete feast. Every item on the plate was exceptional.',
  'Butter Chicken was creamy and rich. Paired it with Garlic Naan, absolutely divine.',
  'Masala Dosa was crispy and the potato filling was well-seasoned. Loved it!',
  'Haleem was thick, flavorful, and slow-cooked to perfection. Outstanding!',
  'Mango Lassi was refreshing and thick. Perfect to balance the spicy starters.',
  'Mysore Masala Dosa had the right amount of spice. Perfectly balanced!',
  'Double Ka Meetha was rich and soaked in saffron milk. A true Hyderabadi treat.',
  'Great taste but portions could be slightly bigger for the price.',
  'Quick delivery and food was still hot. Very impressed with the packaging!',
  'Rasmalai was soft, creamy, and delicate. One of the best I have tried.',
  'The Special Family Biryani fed our entire family. Great value for money!',
  'Bagara Baingan had such a unique and rich flavor. Traditional Hyderabadi at its best.',
  'Kadai Paneer was fresh and well-spiced. Perfect with Butter Naan.',
  'Sweet Lassi was perfectly sweetened with rose water. Very refreshing.',
  'Andhra Chicken Curry was fiery hot! Exactly how I like it.',
  'Qubani Ka Meetha was a revelation. Never tasted anything like it before.',
  'Badam Milk was thick, creamy, and loaded with real nuts. Premium quality!',
  'Chicken Majestic was crispy outside, juicy inside. Addictive!',
  'Veg Dum Biryani was fragrant and well-cooked. Even non-veg lovers enjoyed it.',
  'Gobi Manchurian was crispy and tangy. A solid starter.',
  'Pongal was comforting and wholesome. Traditional South Indian breakfast at its finest.'
];

function generateReviews() {
  const reviews = [];
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');

  for (let i = 0; i < 60 && i < deliveredOrders.length; i++) {
    const order = deliveredOrders[i];
    const reviewedItem = order.items[Math.floor(rng() * order.items.length)];
    const rating = rng() > 0.15 ? (rng() > 0.3 ? 5 : 4) : (rng() > 0.5 ? 3 : 2);

    reviews.push({
      id: `rev-${String(i + 1).padStart(3, '0')}`,
      orderId: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      dishId: reviewedItem.id,
      dishName: reviewedItem.name,
      rating,
      comment: reviewTexts[i % reviewTexts.length],
      timestamp: new Date(new Date(order.timestamp).getTime() + 3600000 * 2).toISOString(),
      status: rng() > 0.1 ? 'Approved' : 'Pending'
    });
  }

  return reviews;
}

export const reviews = generateReviews();

// ---------------------------------------------------------------------------
// 4. COUPONS DATABASE (8 coupons)
// ---------------------------------------------------------------------------
export const coupons = [
  {
    id: 'coup-001',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minOrder: 200,
    maxDiscount: 150,
    expiryDate: new Date(2026, 7, 31).toISOString(),
    usageLimit: 500,
    usageCount: 187,
    isActive: true,
    description: '10% off for new customers'
  },
  {
    id: 'coup-002',
    code: 'BIRYANI20',
    type: 'percentage',
    value: 20,
    minOrder: 300,
    maxDiscount: 200,
    expiryDate: new Date(2026, 6, 15).toISOString(),
    usageLimit: 300,
    usageCount: 124,
    isActive: true,
    description: '20% off on biryani orders'
  },
  {
    id: 'coup-003',
    code: 'DOSA15',
    type: 'percentage',
    value: 15,
    minOrder: 150,
    maxDiscount: 100,
    expiryDate: new Date(2026, 8, 30).toISOString(),
    usageLimit: 200,
    usageCount: 56,
    isActive: true,
    description: '15% off on breakfast items'
  },
  {
    id: 'coup-004',
    code: 'FLAT100',
    type: 'flat',
    value: 100,
    minOrder: 500,
    maxDiscount: 100,
    expiryDate: new Date(2026, 5, 30).toISOString(),
    usageLimit: 100,
    usageCount: 88,
    isActive: true,
    description: 'Flat ₹100 off on orders above ₹500'
  },
  {
    id: 'coup-005',
    code: 'FAMILY50',
    type: 'flat',
    value: 50,
    minOrder: 800,
    maxDiscount: 50,
    expiryDate: new Date(2026, 9, 31).toISOString(),
    usageLimit: 150,
    usageCount: 23,
    isActive: true,
    description: '₹50 off on family orders above ₹800'
  },
  {
    id: 'coup-006',
    code: 'SPICY25',
    type: 'percentage',
    value: 25,
    minOrder: 400,
    maxDiscount: 250,
    expiryDate: new Date(2026, 4, 15).toISOString(),
    usageLimit: 100,
    usageCount: 100,
    isActive: false,
    description: '25% off on spicy dishes (Expired)'
  },
  {
    id: 'coup-007',
    code: 'THALI30',
    type: 'percentage',
    value: 30,
    minOrder: 500,
    maxDiscount: 180,
    expiryDate: new Date(2026, 11, 31).toISOString(),
    usageLimit: 75,
    usageCount: 12,
    isActive: true,
    description: '30% off on Thali orders'
  },
  {
    id: 'coup-008',
    code: 'DESSERT10',
    type: 'flat',
    value: 30,
    minOrder: 100,
    maxDiscount: 30,
    expiryDate: new Date(2026, 7, 31).toISOString(),
    usageLimit: 250,
    usageCount: 67,
    isActive: true,
    description: '₹30 off on dessert orders'
  }
];

// ---------------------------------------------------------------------------
// 5. ANALYTICS HELPERS
// ---------------------------------------------------------------------------
export function getDailyRevenue(dayCount = 7) {
  const now = new Date();
  const days = [];

  for (let i = dayCount - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

    const dayOrders = orders.filter(o => {
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
}

export function getWeeklyRevenue() {
  const now = new Date();
  const weeks = [];

  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (w * 7) - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekOrders = orders.filter(o => {
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
}

export function getMonthlyRevenue() {
  const months = [];
  const now = new Date();

  for (let m = 5; m >= 0; m--) {
    const month = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 0);

    const monthOrders = orders.filter(o => {
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
}

export function getMostOrderedDishes(limit = 10) {
  const dishCounts = {};

  orders.forEach(order => {
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
}

export function getOrdersByCategory() {
  const catCounts = {};

  MENU_CATEGORIES.filter(c => c.id !== 'all').forEach(cat => {
    catCounts[cat.id] = { name: cat.name, count: 0, revenue: 0 };
  });

  orders.forEach(order => {
    if (order.status === 'Cancelled') return;
    order.items.forEach(item => {
      if (catCounts[item.category]) {
        catCounts[item.category].count += item.quantity;
        catCounts[item.category].revenue += item.lineTotal;
      }
    });
  });

  return Object.values(catCounts).sort((a, b) => b.revenue - a.revenue);
}

// ---------------------------------------------------------------------------
// 6. DASHBOARD QUICK STATS
// ---------------------------------------------------------------------------
export function getDashboardStats() {
  const now = new Date();
  const todayOrders = orders.filter(o => new Date(o.timestamp).toDateString() === now.toDateString());

  return {
    totalOrdersToday: todayOrders.length,
    revenueToday: todayOrders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0),
    pendingOrders: todayOrders.filter(o => o.status === 'New' || o.status === 'Accepted').length,
    preparingOrders: todayOrders.filter(o => o.status === 'Preparing').length,
    deliveredOrders: todayOrders.filter(o => o.status === 'Delivered').length,
    cancelledOrders: todayOrders.filter(o => o.status === 'Cancelled').length,
    totalCustomers: customers.length,
    popularDish: getMostOrderedDishes(1)[0]?.name || 'N/A',
    totalAllTimeOrders: orders.length,
    totalAllTimeRevenue: orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0)
  };
}

// ---------------------------------------------------------------------------
// 7. RESTAURANT SETTINGS (Pre-populated)
// ---------------------------------------------------------------------------
export const restaurantSettings = {
  name: "Patel's Kitchen",
  tagline: 'Authentic South Indian & Hyderabadi Flavours',
  phone: '+91 98480 22338',
  altPhone: '+91 40 22849182',
  email: 'info@patelskitchen.in',
  address: '14 Royal Palace Lane, Jubilee Hills, Hyderabad, Telangana 500033',
  openingHours: {
    monday: { open: '11:30', close: '22:30', isOpen: true },
    tuesday: { open: '11:30', close: '22:30', isOpen: true },
    wednesday: { open: '11:30', close: '22:30', isOpen: true },
    thursday: { open: '11:30', close: '22:30', isOpen: true },
    friday: { open: '08:30', close: '23:30', isOpen: true },
    saturday: { open: '08:30', close: '23:30', isOpen: true },
    sunday: { open: '08:30', close: '23:30', isOpen: true }
  },
  deliveryFee: 40,
  freeDeliveryAbove: 500,
  minimumOrder: 100,
  taxRate: 5,
  socialLinks: {
    instagram: 'https://instagram.com/patelskitchen',
    facebook: 'https://facebook.com/patelskitchen',
    twitter: 'https://twitter.com/patelskitchen',
    youtube: ''
  }
};

export { ORDER_STATUSES, PAYMENT_METHODS };
