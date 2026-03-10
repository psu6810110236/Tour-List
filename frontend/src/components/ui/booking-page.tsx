import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Users, Plus, Minus, ShoppingBag, ArrowRight, AlertTriangle, X, CheckCircle } from "lucide-react";
import type { Tour } from "../../types/index"; 
import { translations } from "../../data/translations";
import type { Language } from "../../data/translations";
import { tourService } from "../../services/api";

interface BookingPageProps {
  tour?: Tour | null;
  onNavigate: (page: string, data?: any) => void;
  language: Language;
  onAddToCart?: (item: any) => void;
}

export function BookingPage({ tour, onNavigate, language, onAddToCart }: BookingPageProps) {
  const t = translations[language].booking;
  const tTour = translations[language].tourDetail;

  const params = useParams();
  const [localTour, setLocalTour] = useState<Tour | null>(tour || null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2026-03-15");
  const [travelers, setTravelers] = useState(2);
  const [contactInfo, setContactInfo] = useState({ fullName: "", email: "", phone: "", specialRequests: "" });

  // --- ระบบ Pop-up Modal ที่เพิ่มเข้ามาใหม่ ---
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "warning" | "error" | "success";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
  });

  const showAlert = (title: string, message: string, type: "warning" | "error" | "success") => {
    setModalConfig({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };
  // --------------------------------------

  const totalPrice = (localTour?.price || 0) * travelers;

  useEffect(() => {
    if (!localTour && params?.id) {
      setLoading(true);
      (async () => {
        try {
          const resp = await tourService.getById(String(params.id));
          setLocalTour(resp.data);
        } catch (err) {
          console.error("Failed to fetch tour for booking:", err);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [params?.id, localTour]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactInfo((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!contactInfo.fullName || !contactInfo.email || !contactInfo.phone) {
      // เปลี่ยนจาก alert() เป็น showAlert()
      showAlert(
        language === "th" ? "กรุณากรอกข้อมูลให้ครบถ้วน" : "Incomplete Information",
        language === "th" ? "กรุณากรอกข้อมูลผู้ติดต่อให้ครบถ้วนก่อนดำเนินการต่อ" : "Please fill in all contact information before proceeding.",
        "warning"
      );
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateForm()) return;
    if (onAddToCart) onAddToCart({ tour: localTour, date: selectedDate, travelers, totalPrice, contactInfo });
  };

  const handleContinue = () => {
    if (!validateForm()) return;
    onNavigate("payment", { tour: localTour, date: selectedDate, travelers, totalPrice, contactInfo });
  };

  const weekDays = language === "th" ? ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!localTour) return <div className="min-h-screen flex items-center justify-center">{language === 'th' ? 'ไม่พบข้อมูลทัวร์' : 'Tour not found'}</div>;

  return (
    <div className="min-h-screen bg-[#F7F9FA] pb-28 font-sans relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={() => onNavigate("tour-detail", localTour)} className="flex items-center gap-2 text-gray-500 hover:text-[#00A699] transition-colors mb-2 font-medium">
            <ArrowLeft className="w-5 h-5" />
            <span>{t.back}</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{t.title}</h1>
          <p className="text-gray-500 mt-1">{language === "th" && localTour.name_th ? localTour.name_th : localTour.name}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Date Selection */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-teal-50 text-[#00A699] rounded-2xl flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t.selectDate}</h2>
              </div>
              <div className="border border-gray-100 rounded-2xl p-4 md:p-6 bg-gray-50/50">
                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                  {weekDays.map((day) => (
                    <div key={day} className="text-sm font-bold text-gray-400 py-2">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {[...Array(31)].map((_, i) => {
                    const day = i + 1;
                    const dateStr = `2026-03-${String(day).padStart(2, "0")}`;
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isSelected ? "bg-[#00A699] text-white shadow-md shadow-teal-200 scale-105" : "hover:bg-gray-100 text-gray-700 hover:text-[#00A699]"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Travelers */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 text-[#007AFF] rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t.travelers}</h2>
              </div>
              <div className="flex items-center justify-between p-4 md:p-6 border border-gray-100 rounded-2xl">
                <div>
                  <div className="font-bold text-gray-900 text-lg">{language === "th" ? "ผู้ใหญ่" : "Adults"}</div>
                  <div className="text-sm text-gray-500 mt-1">฿{(localTour.price || 0).toLocaleString()} {tTour.perPerson}</div>
                </div>
                <div className="flex items-center gap-5">
                  <button onClick={() => setTravelers(Math.max(1, travelers - 1))} className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full flex items-center justify-center transition-colors">
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-xl font-bold w-6 text-center">{travelers}</span>
                  <button onClick={() => setTravelers(travelers + 1)} className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full flex items-center justify-center transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t.personalInfo}</h2>
              <div className="space-y-4">
                <input name="fullName" type="text" placeholder={t.fullName} value={contactInfo.fullName} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#00A699]/20 focus:border-[#00A699] transition-all" required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="email" type="email" placeholder={t.email} value={contactInfo.email} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#00A699]/20 focus:border-[#00A699] transition-all" required />
                  <input name="phone" type="tel" placeholder={t.phone} value={contactInfo.phone} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#00A699]/20 focus:border-[#00A699] transition-all" required />
                </div>
                <textarea name="specialRequests" placeholder={language === "th" ? "คำขอพิเศษ (ไม่บังคับ)" : "Special Requests (Optional)"} value={contactInfo.specialRequests} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#00A699]/20 focus:border-[#00A699] transition-all resize-none" rows={3} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-32 bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{language === "th" ? "สรุปการจอง" : "Booking Summary"}</h2>
                <div className="rounded-2xl overflow-hidden mb-5">
                <img src={localTour.image} alt={localTour.name} className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">{language === "th" ? "วันที่เดินทาง:" : "Date:"}</span>
                  <span className="font-bold text-gray-900">{selectedDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">{language === "th" ? "จำนวนผู้เดินทาง:" : "Travelers:"}</span>
                  <span className="font-bold text-gray-900">{travelers} ท่าน</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                  <span className="text-gray-500 font-medium">{t.totalPrice}</span>
                  <span className="text-2xl font-black text-[#00A699]">฿{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">{t.totalPrice}</span>
            <span className="text-xl md:text-2xl font-black text-[#00A699]">฿{totalPrice.toLocaleString()}</span>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAddToCart} className="px-5 py-3 md:py-4 rounded-2xl border-2 border-teal-50 bg-teal-50 text-[#00A699] font-bold hover:bg-teal-100 transition-colors flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline">Add to Cart</span>
            </button>
            <button onClick={handleContinue} className="px-6 md:px-8 py-3 md:py-4 bg-[#FF6B4A] hover:bg-[#F25A38] text-white rounded-2xl font-bold shadow-lg shadow-orange-200/50 transition-all active:scale-95 flex items-center gap-2">
              <span>{t.proceedToPayment}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* --- ส่วนที่เพิ่มใหม่: UI Pop-up Modal (แทรกเพิ่มโดยไม่แก้ UI เดิม) --- */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-8 text-center relative">
              <button onClick={closeModal} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <div className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-6 ${
                modalConfig.type === 'warning' ? 'bg-orange-50 text-orange-500' : 
                modalConfig.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-teal-50 text-[#00A699]'
              }`}>
                {modalConfig.type === 'warning' && <AlertTriangle className="h-10 w-10" />}
                {modalConfig.type === 'error' && <X className="h-10 w-10" />}
                {modalConfig.type === 'success' && <CheckCircle className="h-10 w-10" />}
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">{modalConfig.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed mb-8">{modalConfig.message}</p>
              
              <button
                onClick={closeModal}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all active:scale-[0.97] shadow-lg shadow-gray-200"
              >
                {language === "th" ? "รับทราบ" : "Got it"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}