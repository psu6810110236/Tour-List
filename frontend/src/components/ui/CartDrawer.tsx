// frontend/src/components/ui/CartDrawer.tsx
import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, Clock, Users, CheckCircle2, Circle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const FALLBACK_IMAGE = 'https://raw.githubusercontent.com/psu6810110318/-/main/611177844_1219279366819683_4920076292858051338_n-removebg-preview.png';

const CartDrawer = () => {
  const { cartItems, isDrawerOpen, toggleDrawer, clearCart, removeFromCart } = useCart();
  const navigate = useNavigate();

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const totalPrice = cartItems.reduce((sum: number, item: any) => sum + Number(item.totalPrice), 0);

  const handleCheckout = () => {
    toggleDrawer();
    navigate('/payment');
  };

  const toggleSelectMode = () => {
    setSelectMode((prev) => !prev);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === cartItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cartItems.map((i) => i.id)));
    }
  };

  const handleDeleteSelected = () => {
    const ids = new Set(selectedIds);
    setRemovingIds(ids);
    setTimeout(() => {
      ids.forEach((id) => removeFromCart(id));
      setRemovingIds(new Set());
      setSelectedIds(new Set());
      setSelectMode(false);
    }, 300);
  };

  const handleRemoveOne = (id: string) => {
    setRemovingIds(new Set([id]));
    setTimeout(() => {
      removeFromCart(id);
      setRemovingIds(new Set());
    }, 300);
  };

  // ✅ helper ดึงชื่อทัวร์จาก item — fallback ทุก field ที่เป็นไปได้
  const getTourName = (item: any): string => {
    return (
      item.tour?.name_th ||
      item.tour?.name ||
      item.tour?.title_th ||
      item.tour?.title ||
      item.tourName_th ||
      item.tourName ||
      item.name_th ||
      item.name ||
      'ทัวร์'
    );
  };

  // ✅ helper ดึงรูปภาพ — fallback เป็น logo RoamHub
  const getTourImage = (item: any): string => {
    return (
      item.tour?.image ||
      item.image ||
      item.tour?.thumbnail ||
      item.thumbnail ||
      FALLBACK_IMAGE
    );
  };

  const allSelected = cartItems.length > 0 && selectedIds.size === cartItems.length;

  return (
    <>
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
          onClick={toggleDrawer}
        />
      )}

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

        {/* Select-mode toolbar */}
        {cartItems.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white" style={{ minHeight: 52 }}>
            {selectMode ? (
              <>
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#00A699] transition-colors"
                >
                  {allSelected
                    ? <CheckCircle2 className="w-5 h-5 text-[#00A699]" />
                    : <Circle className="w-5 h-5 text-gray-300" />
                  }
                  เลือกทั้งหมด
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.size === 0}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
                      selectedIds.size > 0
                        ? 'bg-red-500 text-white shadow-md shadow-red-200 active:scale-95'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    ลบ {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
                  </button>
                  <button
                    onClick={toggleSelectMode}
                    className="px-3 py-1.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={toggleSelectMode}
                className="ml-auto text-sm font-semibold text-[#00A699] hover:underline transition-colors"
              >
                เลือกลบหลายรายการ
              </button>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F7F9FA]">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-2">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">ยังไม่มีรายการทัวร์ในตะกร้า</p>
              
              {/* ✅ แก้ไขปุ่มนี้ ให้กดแล้วไปหน้า provinces */}
              <button 
                onClick={() => {
                  toggleDrawer(); // ปิด Drawer
                  navigate('/provinces'); // นำทางไปหน้า Provinces
                }} 
                className="text-[#00A699] font-bold hover:underline"
              >
                เลือกดูทัวร์เลย
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item: any) => {
                const isRemoving = removingIds.has(item.id);
                const isSelected = selectedIds.has(item.id);
                const tourName = getTourName(item);
                const tourImage = getTourImage(item);

                return (
                  <div
                    key={item.id}
                    onClick={() => selectMode && toggleSelect(item.id)}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${
                      selectMode ? 'cursor-pointer' : 'hover:shadow-md'
                    } ${isSelected ? 'border-[#00A699] ring-2 ring-[#00A699]/20' : 'border-gray-100'}`}
                    style={{
                      opacity: isRemoving ? 0 : 1,
                      transform: isRemoving ? 'translateX(40px) scale(0.96)' : 'translateX(0) scale(1)',
                      transition: 'opacity 0.3s ease, transform 0.3s ease',
                    }}
                  >
                    <div className="flex gap-4 p-4 border-b border-gray-50">
                      {selectMode && (
                        <div className="flex items-center flex-shrink-0">
                          {isSelected
                            ? <CheckCircle2 className="w-5 h-5 text-[#00A699]" />
                            : <Circle className="w-5 h-5 text-gray-300" />
                          }
                        </div>
                      )}

                      {/* ✅ รูปภาพทัวร์ พร้อม fallback */}
                      <div className="w-20 h-20 rounded-xl bg-[#00A699] flex-shrink-0 overflow-hidden">
                        <img
                          src={tourImage}
                          alt={tourName}
                          className={`w-full h-full ${
                            tourImage === FALLBACK_IMAGE
                              ? 'object-contain p-2'
                              : 'object-cover'
                          }`}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = FALLBACK_IMAGE;
                            target.className = 'w-full h-full object-contain p-2';
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        {/* ✅ ชื่อทัวร์ */}
                        <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-2 leading-tight">
                          {tourName}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.tour?.tripDays ? `${item.tour.tripDays} วัน` : '1 วัน'}
                        </p>
                      </div>

                      {!selectMode && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveOne(item.id); }}
                          className="self-start p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all active:scale-90 flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="p-4 bg-gray-50/50 flex justify-between items-end">
                      <div className="space-y-1.5 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-white rounded flex items-center justify-center border border-gray-200 shadow-sm">📅</span>
                          <span className="font-medium text-gray-900">
                            {item.selectedDate || item.travelDate}
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-white rounded flex items-center justify-center border border-gray-200 shadow-sm">
                            <Users className="w-3 h-3 text-gray-500" />
                          </span>
                          <span className="font-medium text-gray-900">
                            {item.travelers || item.pax} ท่าน
                          </span>
                        </p>
                      </div>
                      <p className="font-black text-[#00A699] text-lg">
                        ฿{Number(item.totalPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-end mb-6">
              <span className="text-gray-500 font-medium text-sm">
                ราคารวมทั้งหมด
                <br />
                <span className="text-xs text-gray-400 font-normal">รวมภาษีและค่าธรรมเนียมแล้ว</span>
              </span>
              <span className="text-3xl font-black text-[#00A699]">฿{totalPrice.toLocaleString()}</span>
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