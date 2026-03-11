'use client';

// 🌟 จุดที่ 1: เพิ่ม useNavigate เข้ามาจาก react-router-dom
import { useNavigate } from 'react-router-dom';
// แก้ไข Path ถอยหลัง 2 ชั้นให้ตรงกับโครงสร้าง
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const { cartItems, isDrawerOpen, toggleDrawer, removeFromCart } = useCart();
  
  // 🌟 จุดที่ 2: เรียกใช้งาน navigate
  const navigate = useNavigate();

  // ใส่ Type กำหนดให้ sum เป็น number และ item เป็น any (ชั่วคราว) เพื่อแก้ Error
  const grandTotal = cartItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0);

  // 🌟 จุดที่ 3: สร้างฟังก์ชันสำหรับจัดการการ Checkout
  const handleCheckout = () => {
    toggleDrawer(); // ปิดตะกร้าก่อน
    navigate('/payment'); // ไปที่หน้าชำระเงิน (Path นี้ต้องตรงกับที่ตั้งไว้ใน App.tsx)
  };

  return (
    <>
      {/* Background สีดำโปร่งแสงเวลา Drawer เปิด */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={toggleDrawer}
        />
      )}

      {/* ตัว Drawer เลื่อนจากขวา */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header ของ Drawer */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">ตะกร้าของฉัน</h2>
          <button onClick={toggleDrawer} className="text-gray-500 hover:text-gray-800 text-xl font-bold">
            ✕
          </button>
        </div>

        {/* รายการสินค้า */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">ยังไม่มีรายการจองในตะกร้า</div>
          ) : (
            // ใส่ Type Any ให้ item ใน map เพื่อแก้ Error
            cartItems.map((item: any) => (
              <div key={item.id} className="border rounded-lg p-4 shadow-sm bg-gray-50">
                <h3 className="font-semibold text-lg text-gray-800">{item.tourName}</h3>
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  <p>วันที่เดินทาง: <span className="font-medium text-gray-800">{item.travelDate}</span></p>
                  <p>จำนวน: <span className="font-medium text-gray-800">{item.pax} ท่าน</span></p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-teal-600 font-bold text-lg">฿{item.totalPrice.toLocaleString()}</span>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 text-sm font-medium hover:underline"
                  >
                    ลบออก
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer สรุปยอดและปุ่มไปชำระเงิน */}
        {cartItems.length > 0 && (
          <div className="border-t p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-600">ราคารวมทั้งหมด</span>
              <span className="font-bold text-2xl text-teal-600">฿{grandTotal.toLocaleString()}</span>
            </div>
            {/* 🌟 จุดที่ 4: ใส่ onClick={handleCheckout} ที่ปุ่มเดิมของคุณ */}
            <button 
              onClick={handleCheckout}
              className="w-full bg-[#FF6B4A] text-white font-bold py-3 rounded-lg hover:bg-[#ee5a3a] transition-colors"
            >
              ดำเนินการชำระเงิน
            </button>
          </div>
        )}
      </div>
    </>
  );
}