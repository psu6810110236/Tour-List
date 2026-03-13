// src/context/CartContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';

export interface CartItem {
  id: string;
  tour: any;
  tourName?: string;
  tourName_th?: string;
  image?: string;
  selectedDate: string;
  travelDate?: string;
  travelers: number;
  pax?: number;
  totalPrice: number;
  contactInfo?: any;
}

interface CartContextType {
  cartItems: CartItem[];
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  clearCart: () => void;
  addToCart: (item: any) => void;
  removeFromCart: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('roamhub_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    localStorage.setItem('roamhub_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  const clearCart = () => setCartItems([]);

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addToCart = (item: any) => {
    const newItem: CartItem = {
      id: Date.now().toString(),
      tour: item.tour,
      tourName: item.tour?.name || item.tourName,
      tourName_th: item.tour?.name_th || item.tourName_th,
      image: item.tour?.image || item.image,
      selectedDate: item.date || item.selectedDate || item.travelDate,
      travelDate: item.date || item.selectedDate || item.travelDate,
      travelers: item.travelers || item.pax,
      pax: item.travelers || item.pax,
      totalPrice: item.totalPrice,
      contactInfo: item.contactInfo,
    };

    // ✅ เพิ่มใหม่ทุกครั้ง ไม่ merge เพื่อกันการบวกซ้ำ
    setCartItems((prev) => [...prev, newItem]);
    setIsDrawerOpen(true);
  };

  return (
    <CartContext.Provider value={{ cartItems, isDrawerOpen, toggleDrawer, clearCart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};