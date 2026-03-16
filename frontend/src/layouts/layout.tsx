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
          
          {/* แนะนำให้ครอบ children ด้วยแท็ก <main> และใส่ min-h-screen 
              เพื่อให้แน่ใจว่า Footer จะโดนดันไปอยู่ล่างสุดเสมอ แม้เนื้อหาในหน้าจะน้อยก็ตาม */}
          <main className="min-h-screen flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            
            {/* ✅ 2. วาง Footer ไว้ตรงนี้ (อยู่ล่างสุดของเนื้อหาหลัก) */}
         
          </main>

          {/* วาง CartDrawer ไว้ตรงนี้เพื่อให้มันซ้อนทับอยู่บนสุดเสมอ */}
          <CartDrawer />
          
        </CartProvider>
      </body>
    </html>
  );
}