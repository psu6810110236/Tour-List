// frontend/src/components/ui/CartDrawer.tsx
import React from 'react';
import { X, ShoppingBag, Trash2, Clock, Users } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { cartItems, isDrawerOpen, toggleDrawer, clearCart } = useCart();
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);

  const handleCheckout = () => {
    toggleDrawer(); 
    navigate('/payment'); 
  };

  return (
    <>
      {/* Background Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 transition-opacity backdrop-blur-sm"
          onClick={toggleDrawer}
        />
      )}

      {/* Cart Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#00A699]/10 rounded-full text-[#00A699] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">ตะกร้าของฉัน</h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">
              {cartItems.length} รายการ
            </span>
          </div>
          <button 
            onClick={toggleDrawer}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F7F9FA]">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-2">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">ยังไม่มีรายการทัวร์ในตะกร้า</p>
              <button 
                onClick={toggleDrawer}
                className="text-[#00A699] font-bold hover:underline"
              >
                เลือกดูทัวร์เลย
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {/* Tour Image & Title */}
                  <div className="flex gap-4 p-4 border-b border-gray-50">
                    <img 
                      src={item.tour?.image || '/placeholder-tour.jpg'} 
                      alt={item.tour?.name_th || item.tour?.name || 'Tour Image'} 
                      className="w-20 h-20 object-cover rounded-xl bg-gray-100"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-2 leading-tight">
                        {/* ✅ แก้ไขให้อ่านชื่อทัวร์จาก item.tour ได้เลย */}
                        {item.tour?.name_th || item.tour?.name || 'ทัวร์ (ไม่พบชื่อ)'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.tour?.tripDays ? `${item.tour.tripDays} วัน` : '1 วัน'}
                      </p>
                    </div>
                  </div>

                  {/* Details & Price */}
                  <div className="p-4 bg-gray-50/50 flex justify-between items-end">
                    <div className="space-y-1.5 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-white rounded flex items-center justify-center border border-gray-200 shadow-sm">📅</span>
                        <span className="font-medium text-gray-900">{item.selectedDate}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-white rounded flex items-center justify-center border border-gray-200 shadow-sm"><Users className="w-3 h-3 text-gray-500"/></span>
                        {/* ✅ เปลี่ยนจาก item.pax เป็น item.travelers */}
                        <span className="font-medium text-gray-900">{item.travelers} ท่าน</span>
                      </p>
                    </div>
                    <p className="font-black text-[#00A699] text-lg">
                      ฿{Number(item.totalPrice).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-end mb-6">
              <span className="text-gray-500 font-medium text-sm">ราคารวมทั้งหมด<br/><span className="text-xs text-gray-400 font-normal">รวมภาษีและค่าธรรมเนียมแล้ว</span></span>
              <span className="text-3xl font-black text-[#00A699]">
                ฿{totalPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={clearCart}
                className="w-14 h-14 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors active:scale-95"
                title="ล้างตะกร้า"
              >
                <Trash2 className="w-6 h-6" />
              </button>
              <button 
                onClick={handleCheckout}
                className="flex-1 bg-[#FF6B4A] hover:bg-[#F25A38] text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-orange-200/50 active:scale-95"
              >
                ดำเนินการชำระเงิน
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;