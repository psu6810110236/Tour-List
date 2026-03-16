import { useState, useEffect } from "react";
import { ArrowLeft, Upload, Lock, QrCode, CheckCircle, AlertTriangle, X } from "lucide-react";
import { getLang } from "../../data/mockData";
import { translations } from "../../data/translations";
import type { Language } from "../../data/translations";
import { useAuth } from "../../features/auth/context/AuthContext";
import { bookingService } from "../../services/api";
import { useScrollLock } from "../../hooks/useScrollLock";

interface PaymentPageProps {
  bookingData: any;
  cartItems?: any[];
  onNavigate: (page: string, data?: any) => void;
  language: Language;
  onClearCart?: () => void;
}

export function PaymentPage({ bookingData, cartItems = [], onNavigate, language, onClearCart }: PaymentPageProps) {
  const { user } = useAuth();
  const [localBooking, setLocalBooking] = useState<any>(bookingData || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [slipImage, setSlipImage] = useState<string | null>(null);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "warning" | "error" | "success";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const showAlert = (title: string, message: string, type: "warning" | "error" | "success", onConfirm?: () => void) => {
    setModalConfig({ isOpen: true, title, message, type, onConfirm });
  };

  const closeModal = () => {
    const { onConfirm } = modalConfig;
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    if (onConfirm) onConfirm();
  };

  useScrollLock(modalConfig.isOpen);

  useEffect(() => {
    if (bookingData?.isFromCart || cartItems.length > 0) return;

    if (!localBooking) {
      try {
        const stored = sessionStorage.getItem('bookingData');
        if (stored) setLocalBooking(JSON.parse(stored));
        else onNavigate('home');
      } catch (e) {
        console.warn('Failed to read bookingData from sessionStorage', e);
        onNavigate('home');
      }
    }
  }, [localBooking, onNavigate, bookingData, cartItems]);

  const t = translations[language].payment;
  const common = translations[language].booking;

  let items: any[] = [];
  if (bookingData?.isFromCart || cartItems.length > 0) {
    items = cartItems;
  } else {
    items = localBooking?.items ? localBooking.items : (localBooking ? [localBooking] : []);
  }

  const totalPrice = items.reduce((sum: number, item: any) => sum + (Number(item.totalPrice) || 0), 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showAlert(
          language === "th" ? "ไฟล์มีขนาดใหญ่เกินไป" : "File too large",
          language === "th" ? "กรุณาใช้ไฟล์ขนาดไม่เกิน 5MB" : "Please use a file under 5MB.",
          "error"
        );
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setSlipImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      showAlert(
        language === "th" ? "กรุณาเข้าสู่ระบบ" : "Login Required",
        language === "th" ? "กรุณาเข้าสู่ระบบก่อนทำการชำระเงิน" : "Please login before making a payment.",
        "warning",
        () => onNavigate('login')
      );
      return;
    }

    if (!slipImage || slipImage === "") {
      showAlert(
        language === "th" ? "ข้อมูลไม่ครบถ้วน" : "Missing Information",
        language === "th" ? "กรุณาอัปโหลดสลิปโอนเงินเพื่อยืนยันการชำระเงิน" : "Please upload a payment slip to confirm.",
        "warning"
      );
      return;
    }

    setIsProcessing(true);

    try {
      const bookingPromises = items.map(async (item: any) => {
        const payload = {
          userId: user.id,
          tourId: Number(item.tour?.id || item.tourId),
          travelDate: item.date || item.travelDate || item.selectedDate,
          travelers: item.travelers || item.pax,
          totalPrice: item.totalPrice,
          paymentSlip: slipImage || undefined,
          tourNameSnapshot: item.tour?.name || item.tourName || "Tour from Cart",
          tourNameSnapshot_th: item.tour?.name_th || item.tourName_th || item.tourName || "ทัวร์จากตะกร้า",
          contactName: item.contactInfo?.fullName,
          phone: item.contactInfo?.phone,
          email: item.contactInfo?.email,
          specialRequests: item.contactInfo?.specialRequests,
        };
        const res = await bookingService.createBooking(payload);
        return res.data;
      });

      const results = await Promise.all(bookingPromises);

      if (onClearCart) onClearCart();

      onNavigate("payment-confirmation", {
        ...results[0],
        tour: items[0]?.tour || { name: items[0]?.tourName || "Multiple Tours" },
      });

    } catch (error) {
      console.error("Payment failed:", error);
      showAlert(
        language === "th" ? "ขออภัย ระบบขัดข้อง" : "Payment Error",
        language === "th" ? "ไม่สามารถเชื่อมต่อระบบได้ จะนำท่านไปยังหน้ายืนยันการจองชั่วคราว" : "API Error: Redirecting to mock confirmation.",
        "warning",
        () => {
          if (onClearCart) onClearCart();
          onNavigate("payment-confirmation", {
            id: `BK-TEST-${Date.now().toString().slice(-6)}`,
            tour: items[0]?.tour || { name: items[0]?.tourName || "Multiple Tours" },
            travelDate: items[0]?.date || items[0]?.travelDate || items[0]?.selectedDate,
            travelers: items[0]?.travelers || items[0]?.pax,
            totalPrice: totalPrice,
          });
        }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F9FA] flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {language === 'th' ? 'ไม่พบรายการชำระเงิน' : 'No Payment Items Found'}
        </h2>
        <button
          onClick={() => onNavigate("home")}
          className="bg-[#00A699] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#008c81] transition-colors"
        >
          {language === 'th' ? 'กลับหน้าหลัก' : 'Back to Home'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FA] py-8 md:py-12 font-sans relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => { 
            const data = localBooking || bookingData;
            if (data?.tour?.id) onNavigate("booking", data);
            else onNavigate("booking", data);
          }}
          className="flex items-center gap-2 text-gray-500 hover:text-[#00A699] mb-8 transition-colors font-medium w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{common.back}</span>
        </button>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">{t.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <QrCode className="w-6 h-6 text-[#00A699]" />
                {language === 'th' ? 'ชำระเงินผ่าน QR Code' : 'Payment via QR Code'}
              </h2>

              <div className="flex flex-col items-center justify-center py-6">
                {slipImage ? (
                  <div className="relative mb-6 text-center">
                    <img src={slipImage} alt="Uploaded Slip" className="w-48 h-auto max-h-64 object-contain rounded-xl shadow-md border" />
                    <button
                      onClick={() => setSlipImage(null)}
                      className="text-red-500 text-sm mt-3 hover:underline font-medium block w-full text-center"
                    >
                      {language === "th" ? "ลบรูปภาพ" : "Remove Image"}
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200 mb-6">
                    {/* เปลี่ยนขนาด QR Code เป็น w-64 h-64 */}
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png"
                      alt="Payment QR"
                      className="w-64 h-64 mix-blend-multiply opacity-80"
                    />
                  </div>
                )}

                <label className="w-full max-w-sm cursor-pointer group">
                  <div className={`border py-4 rounded-2xl transition-colors flex items-center justify-center gap-3 font-semibold ${
                    slipImage
                      ? 'bg-green-50 border-green-200 text-green-600'
                      : 'bg-teal-50 hover:bg-teal-100 border-teal-100 text-[#00A699]'
                  }`}>
                    {slipImage ? <CheckCircle className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                    <span>
                      {slipImage
                        ? (language === "en" ? "Slip Uploaded" : "อัปโหลดสลิปสำเร็จ")
                        : (language === "en" ? "Upload Slip" : "อัปโหลดสลิปโอนเงิน")}
                    </span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                <p className="text-gray-400 text-sm mt-4">
                  {language === "th" ? "รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB" : "Supports JPG, PNG up to 5MB"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 sticky top-28">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t.summary}</h2>
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4 mb-4 pb-4 border-b border-gray-50 last:border-0 last:mb-0 last:pb-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                      {item.tour?.image || item.image ? (
                        <img
                          src={item.tour?.image || item.image}
                          alt={item.tour?.name || item.tourName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">Tour</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight">
                        {item.tour
                          ? getLang(item.tour, "name", language)
                          : (language === 'th' ? (item.tourName_th || item.tourName) : item.tourName)}
                      </h3>
                      <div className="text-xs text-gray-500 mt-1.5">
                        {item.date || item.travelDate || item.selectedDate} • {item.travelers || item.pax} {language === "en" ? "Pax" : "ท่าน"}
                      </div>
                      <div className="font-black text-[#00A699] text-sm mt-1">
                        ฿{Number(item.totalPrice).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-6 pt-6">
                <div className="flex justify-between items-end mb-8">
                  <span className="text-gray-500 font-medium">{t.totalAmount}</span>
                  <span className="text-3xl font-black text-[#00A699]">฿{totalPrice.toLocaleString()}</span>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-[#00A699] text-white py-4 md:py-5 rounded-2xl font-bold text-lg hover:bg-[#008c81] transition-all flex justify-center items-center shadow-lg shadow-teal-200/50 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                >
                  {isProcessing
                    ? <span className="animate-pulse">{language === "en" ? "Processing Payment..." : "กำลังดำเนินการ..."}</span>
                    : t.payNow}
                </button>
              </div>
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                <Lock className="w-3.5 h-3.5" />
                <span>{t.secureNote}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-8 text-center relative">
              <button onClick={closeModal} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-6 ${
                modalConfig.type === 'warning' ? 'bg-orange-50 text-orange-500' :
                modalConfig.type === 'error' ? 'bg-red-50 text-red-500' :
                'bg-teal-50 text-[#00A699]'
              }`}>
                {modalConfig.type === 'warning' && <AlertTriangle className="h-10 w-10" />}
                {modalConfig.type === 'error' && <X className="h-10 w-10" />}
                {modalConfig.type === 'success' && <CheckCircle className="h-10 w-10" />}
              </div>

              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
                {modalConfig.title}
              </h3>
              <p className="text-gray-500 font-medium leading-relaxed mb-8">
                {modalConfig.message}
              </p>

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