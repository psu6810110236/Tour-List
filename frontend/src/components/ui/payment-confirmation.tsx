import { CheckCircle2, Calendar, MapPin, Users, Home, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { translations } from "../../data/translations";
import type { Language } from "../../data/translations";

interface PaymentConfirmationProps {
  bookingData: any;
  onNavigate: (page: string, data?: any) => void;
  language: Language;
  cartItems?: any[]; // 🌟 เพิ่มตัวนี้แล้วครับ
}

export function PaymentConfirmation({ bookingData, onNavigate, language, cartItems }: PaymentConfirmationProps) {
  const t = translations[language].confirmation;
  const b = translations[language].booking;

  const data = bookingData || (typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('bookingData') || 'null') : null);

  useEffect(() => {
    if (!data) onNavigate('home');
  }, [data, onNavigate]);

  if (!data) return null;

  // รองรับข้อมูลทั้งแบบเก่า(mock) และจาก Backend API
  const bookingId = data.id || data.bookingId || "PENDING";
  const tourName = data.tourNameSnapshot || data.tourName || data.tour?.name || (language === 'th' ? "ทัวร์ (จากตะกร้า)" : "Tour (Cart)");
  const province = data.tour?.province?.name || data.tour?.province || data.province || (language === 'th' ? "รอการยืนยัน" : "TBD");
  
  // รองรับฟิลด์วันที่จากทั้งสองแบบ
  const dateObj = data.travelDate ? new Date(data.travelDate) : (data.date ? new Date(data.date) : new Date());

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex items-center justify-center p-4 py-12 font-sans">
      <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          
          <div className="bg-gradient-to-br from-[#00A699] to-[#008c81] p-10 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                <CheckCircle2 className="w-10 h-10 text-[#00A699]" />
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-2">{t.success}</h1>
              <p className="text-teal-50 font-medium">
                {language === 'th' ? "ได้รับข้อมูลการชำระเงินของคุณเรียบร้อยแล้ว" : "Your payment has been received successfully"}
              </p>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8 text-center">
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">
                {language === 'th' ? "หมายเลขอ้างอิง" : "Booking Reference"}
              </p>
              <p className="text-3xl font-mono font-black text-gray-900 tracking-tight">{bookingId}</p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-[#00A699]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{language === 'th' ? "ทัวร์ที่จอง" : "Tour Destination"}</p>
                  <p className="font-bold text-gray-900 text-lg leading-tight mt-0.5">{tourName}</p>
                  <p className="text-gray-500 text-sm mt-1">{province}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{b.selectDate}</p>
                    <p className="font-bold text-gray-900 text-sm">
                      {dateObj.toLocaleDateString(language === 'en' ? 'en-US' : 'th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{b.travelers}</p>
                    <p className="font-bold text-gray-900 text-sm">{data.travelers || data.pax || 1} {language === 'th' ? "ท่าน" : "Pax"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-px bg-transparent my-8">
              <div className="absolute inset-0 border-t-2 border-dashed border-gray-200"></div>
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F7F9FA] rounded-full"></div>
              <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F7F9FA] rounded-full"></div>
            </div>

            <div className="flex justify-between items-center mb-10">
              <div>
                <p className="text-sm text-gray-500 font-medium">{language === 'th' ? "ยอดชำระทั้งหมด" : "Total Amount"}</p>
                <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  {language === 'th' ? "รอตรวจสอบยอดเงิน" : "Pending Verification"}
                </div>
              </div>
              <p className="text-3xl font-black text-[#00A699]">
                ฿{Number(data.totalPrice || 0).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => onNavigate('bookings')} className="flex-1 bg-[#FF6B4A] hover:bg-[#F25A38] text-white py-4 rounded-2xl font-bold transition-transform active:scale-95 shadow-lg shadow-orange-200/50 flex items-center justify-center gap-2">
                {t.manageBookings}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => onNavigate('home')} className="sm:flex-none px-6 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2">
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">{t.backToHome}</span>
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}