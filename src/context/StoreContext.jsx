import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getDishes,
  getCategories,
  getSettings,
  getCoupons,
  getOrders,
  getReviews
} from '../data/store';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [dishes, setDishes] = useState(() => getDishes());
  const [categories, setCategories] = useState(() => getCategories());
  const [settings, setSettings] = useState(() => getSettings());
  const [coupons, setCoupons] = useState(() => getCoupons());
  const [orders, setOrders] = useState(() => getOrders());
  const [reviews, setReviews] = useState(() => getReviews());

  const refresh = useCallback(() => {
    setDishes(getDishes());
    setCategories(getCategories());
    setSettings(getSettings());
    setCoupons(getCoupons());
    setOrders(getOrders());
    setReviews(getReviews());
  }, []);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('pk_store_update', handler);
    return () => window.removeEventListener('pk_store_update', handler);
  }, [refresh]);

  return (
    <StoreContext.Provider value={{
      dishes,
      categories,
      settings,
      coupons,
      orders,
      reviews,
      refresh
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function useDishes() {
  return useStore().dishes;
}

export function useCategories() {
  return useStore().categories;
}

export function useSettings() {
  return useStore().settings;
}

export function useCoupons() {
  return useStore().coupons;
}

export function useOrders() {
  return useStore().orders;
}

export function useReviews() {
  return useStore().reviews;
}

export function useAvailableDishes() {
  const dishes = useDishes();
  return dishes.filter(d => d.available !== false);
}

export function getDishRating(reviews, dishId) {
  const approved = reviews.filter(r => r.dishId === dishId && r.status === 'Approved');
  if (approved.length === 0) return null;
  const avg = approved.reduce((s, r) => s + r.rating, 0) / approved.length;
  return Math.round(avg * 10) / 10;
}
