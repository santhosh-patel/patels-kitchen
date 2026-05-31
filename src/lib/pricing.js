import { calculateDiscount } from '../data/store';

const PACKAGING_FEES = { box: 30, bag: 15, none: 0 };

export function getPackagingFee(packaging, deliveryMode) {
  if (deliveryMode === 'dinein' || deliveryMode === 'Dine-in') return 0;
  return PACKAGING_FEES[packaging] ?? 0;
}

export function getDeliveryFee(subtotal, deliveryMode, settings) {
  if (deliveryMode === 'dinein' || deliveryMode === 'Dine-in') return 0;
  const fee = settings?.deliveryFee ?? 40;
  const freeAbove = settings?.freeDeliveryAbove ?? 500;
  return subtotal >= freeAbove ? 0 : fee;
}

export function calculateOrderTotals({
  cart = [],
  deliveryMode = 'dinein',
  packaging = 'none',
  coupon = null,
  settings = null
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = coupon ? calculateDiscount(coupon, subtotal) : 0;
  const discountedSubtotal = subtotal - discount;
  const packagingFee = getPackagingFee(packaging, deliveryMode);
  const deliveryFee = getDeliveryFee(discountedSubtotal, deliveryMode, settings);
  const taxRate = settings?.taxRate ?? 5;
  const tax = Math.round(discountedSubtotal * (taxRate / 100));
  const grandTotal = discountedSubtotal + packagingFee + deliveryFee + tax;

  return {
    subtotal,
    discount,
    discountedSubtotal,
    packagingFee,
    deliveryFee,
    tax,
    taxRate,
    grandTotal
  };
}

export function meetsMinimumOrder(cart, settings) {
  const minimum = settings?.minimumOrder ?? 100;
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return subtotal >= minimum;
}
