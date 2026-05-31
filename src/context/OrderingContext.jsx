import { createContext, useContext, useState, useEffect } from 'react';
import { getCart, saveCart, getActiveCoupon, saveActiveCoupon } from '../data/store';
import { useSettings } from './StoreContext';
import { meetsMinimumOrder } from '../lib/pricing';
import { navigate } from '../lib/navigation';

const OrderingContext = createContext(null);

export function OrderingProvider({ children }) {
  const settings = useSettings();
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState(() => getCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [completedOrderData, setCompletedOrderData] = useState(null);
  const [selectedPackaging, setSelectedPackaging] = useState('none');
  const [activeCoupon, setActiveCoupon] = useState(() => getActiveCoupon());

  useEffect(() => { saveCart(cart); }, [cart]);
  useEffect(() => { saveActiveCoupon(activeCoupon); }, [activeCoupon]);

  const handleAddToPlate = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === item.id);
      if (existing) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });

    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(1046.50, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch {
      // AudioContext blocked
    }
  };

  const handleUpdateQty = (itemId, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== itemId));
    } else {
      setCart((prev) => prev.map((item) =>
        item.id === itemId ? { ...item, quantity: qty } : item
      ));
    }
  };

  const handleRemoveItem = (itemId) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleOrderComplete = (orderData) => {
    setIsCheckoutOpen(false);
    setCompletedOrderData(orderData);
  };

  const clearOrderSession = () => {
    setCompletedOrderData(null);
    setCart([]);
    setActiveCoupon(null);
    saveCart([]);
    saveActiveCoupon(null);
  };

  const handleCloseReceipt = () => {
    clearOrderSession();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromReceipt = () => {
    clearOrderSession();
    navigate('/menu');
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!meetsMinimumOrder(cart, settings)) {
      alert(`Minimum order is ₹${settings.minimumOrder ?? 100}. Please add more items to your plate.`);
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <OrderingContext.Provider value={{
      activeCategory,
      setActiveCategory,
      cart,
      isCartOpen,
      setIsCartOpen,
      isCheckoutOpen,
      setIsCheckoutOpen,
      isAIAssistantOpen,
      setIsAIAssistantOpen,
      completedOrderData,
      selectedPackaging,
      setSelectedPackaging,
      activeCoupon,
      setActiveCoupon,
      handleAddToPlate,
      handleUpdateQty,
      handleRemoveItem,
      handleOrderComplete,
      handleCloseReceipt,
      handleBackFromReceipt,
      handleCheckout
    }}>
      {children}
    </OrderingContext.Provider>
  );
}

export function useOrdering() {
  const ctx = useContext(OrderingContext);
  if (!ctx) throw new Error('useOrdering must be used within OrderingProvider');
  return ctx;
}
