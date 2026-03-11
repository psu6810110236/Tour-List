// ลบ @ ออกแล้วใช้ ../ เพื่อถอยหลัง 1 โฟลเดอร์ออกจาก layouts ไปที่ src
import { CartProvider } from '../context/CartContext'; 

// ลบปีกกาออก และแก้ Path ให้ชี้ไปที่โฟลเดอร์ ui ตามโครงสร้างด้านซ้าย
import CartDrawer from '../components/ui/CartDrawer'; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        {/* ครอบ CartProvider ไว้รอบแอป */}
        <CartProvider>
          {children}
          {/* วาง CartDrawer ไว้ตรงนี้เพื่อให้มันซ้อนทับอยู่บนสุดเสมอ */}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}