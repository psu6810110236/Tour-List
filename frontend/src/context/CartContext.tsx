'use client'; // ใส่ไว้ถ้าใช้ Next.js App Router

import React, { createContext, useContext, useState } from 'react';

// 1. กำหนดรูปแบบข้อมูลของทัวร์ที่จะลงตะกร้า
export type CartItem = {
  id: string; // ใช้เป็น unique key เช่น รหัสทัวร์ + timestamp
  tourName: string;
  travelDate: string;
  pax: number;
  totalPrice: number;
};

// 2. กำหนดว่า Context ของเราทำอะไรได้บ้าง
type CartContextType = {
  cartItems: CartItem[];
  isDrawerOpen: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  toggleDrawer: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// 3. สร้าง Provider เพื่อครอบแอปของเรา
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ฟังก์ชันเพิ่มลงตะกร้า
  const addToCart = (item: CartItem) => {
    setCartItems((prev) => [...prev, item]);
    setIsDrawerOpen(true); // เปิด Drawer อัตโนมัติเวลาเพิ่มของเสร็จ
  };

  // ฟังก์ชันลบออกจากตะกร้า
  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // ฟังก์ชันเปิด/ปิด Drawer
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  return (
    <CartContext.Provider value={{ cartItems, isDrawerOpen, addToCart, removeFromCart, toggleDrawer }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook สำหรับดึงไปใช้ง่ายๆ
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};