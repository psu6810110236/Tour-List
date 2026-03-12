// src/context/CartContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react'; 
import { useAuth } from '../features/auth/context/AuthContext'; 

interface CartItem {
  id: string;
  tour: any;
  selectedDate: string;
  travelers: number;
  totalPrice: number;
  contactInfo: any;
}

interface CartContextType {
  cartItems: CartItem[];
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  clearCart: () => void;
  addToCart: (item: any) => void;
  removeFromCart: (id: string) => void; // ✅ เพิ่มตรงนี้
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('roamhub_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user } = useAuth(); 

  useEffect(() => {
    localStorage.setItem('roamhub_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  
  const clearCart = () => setCartItems([]);

  // ✅ ลบทีละรายการ
  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addToCart = (item: any) => {
    setIsDrawerOpen(true);

    const newItem: CartItem = {
      id: Date.now().toString(),
      tour: item.tour,
      selectedDate: item.date,
      travelers: item.travelers,
      totalPrice: item.totalPrice,
      contactInfo: item.contactInfo
    };

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (cartItem) => cartItem.tour.id === newItem.tour.id && cartItem.selectedDate === newItem.selectedDate
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].travelers += newItem.travelers;
        updatedItems[existingItemIndex].totalPrice += newItem.totalPrice;
        return updatedItems;
      } else {
        return [...prevItems, newItem];
      }
    });
  };

  return (
    <CartContext.Provider value={{ cartItems, isDrawerOpen, toggleDrawer, clearCart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};