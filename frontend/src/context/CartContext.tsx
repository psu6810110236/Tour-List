// src/context/CartContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react'; 
import { useAuth } from '../features/auth/context/AuthContext'; 

// ปรับปรุง Interface ให้รับข้อมูลได้ครบถ้วนขึ้น เพื่อให้ CartDrawer เอาไปแสดงรูป/ชื่อได้
interface CartItem {
  id: string;
  tour: any;          // เก็บข้อมูลทัวร์ทั้งหมด (ชื่อ, รูป, ราคา)
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // ดึงตะกร้าเดิมจาก LocalStorage (ถ้ามี)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('roamhub_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user } = useAuth(); 

  // บันทึกลง LocalStorage ทุกครั้งที่ตะกร้ามีการเปลี่ยนแปลง
  useEffect(() => {
    localStorage.setItem('roamhub_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  
  const clearCart = () => setCartItems([]);

  // ✅ ฟังก์ชันเพิ่มลงตะกร้า (อัปเดตเวอร์ชันให้เด้ง Drawer ทันที)
  const addToCart = (item: any) => {
    // 1. เปิดหน้าต่าง Drawer ออกมาทางขวาทันที
    setIsDrawerOpen(true);

    // 2. จัดระเบียบข้อมูลที่จะเอาลงตะกร้า
    const newItem: CartItem = {
      id: Date.now().toString(), // สร้าง ID ชั่วคราวให้แต่ละรายการ
      tour: item.tour,           // ส่งข้อมูลทัวร์ไปทั้งก้อน
      selectedDate: item.date,
      travelers: item.travelers,
      totalPrice: item.totalPrice,
      contactInfo: item.contactInfo
    };

    // 3. เพิ่มของชิ้นใหม่ต่อท้ายของเดิมในตะกร้า
    setCartItems((prevItems) => {
      // เช็คก่อนว่ามีทัวร์นี้ วันที่นี้ อยู่ในตะกร้าแล้วหรือยัง (ถ้ามีก็บวกจำนวนคนเพิ่ม)
      const existingItemIndex = prevItems.findIndex(
        (cartItem) => cartItem.tour.id === newItem.tour.id && cartItem.selectedDate === newItem.selectedDate
      );

      if (existingItemIndex >= 0) {
        // อัปเดตรายการเดิม
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].travelers += newItem.travelers;
        updatedItems[existingItemIndex].totalPrice += newItem.totalPrice;
        return updatedItems;
      } else {
        // เพิ่มรายการใหม่
        return [...prevItems, newItem];
      }
    });
  };

  return (
    <CartContext.Provider value={{ cartItems, isDrawerOpen, toggleDrawer, clearCart, addToCart }}>
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