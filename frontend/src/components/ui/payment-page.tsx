import { useState, useEffect } from "react";
import { ArrowLeft, Upload, Lock, QrCode, CreditCard, CheckCircle } from "lucide-react";
import { getLang } from "../../data/mockData";
import { translations } from "../../data/translations";
import type { Language } from "../../data/translations";
import { useAuth } from "../../features/auth/context/AuthContext";
import { bookingService } from "../../services/api";

interface PaymentPageProps {
  bookingData: any;
  onNavigate: (page: string, data?: any) => void;
  language: Language;
  onClearCart?: () => void;
}

export function PaymentPage({ bookingData, onNavigate, language, onClearCart }: PaymentPageProps) {
  const { user } = useAuth();
  const [localBooking, setLocalBooking] = useState<any>(bookingData || null);
  const [selectedMethod, setSelectedMethod] = useState<"qrcode" | "card">("qrcode");
  const [isProcessing, setIsProcessing] = useState(false);
  const [slipImage, setSlipImage] = useState<string | null>(null);

  useEffect(() => {
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
  }, [localBooking, onNavigate]);

  const t = translations[language].payment;
  const common = translations[language].booking;

  const items = (localBooking?.items) ? localBooking.items : [localBooking];
  const totalPrice = items.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(language === "th" ? "ขนาดไฟล์ใหญ่เกินไป กรุณาใช้ไฟล์ขนาดไม่เกิน 5MB" : "File is too large. Please use a file under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setSlipImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      alert(language === "th" ? "กรุณาเข้าสู่ระบบก่อนทำการชำระเงิน" : "Please login before making a payment.");
      onNavigate('login');
      return;
    }
    
    if (selectedMethod === "qrcode" && !slipImage) {
      alert(language === "th" ? "กรุณาอัปโหลดสลิปโอนเงินเพื่อยืนยันการชำระเงิน" : "Please upload a payment slip to confirm.");
      return;
    }

    setIsProcessing(true);

    try {
      const bookingPromises = items.map(async (item: any) => {
        const payload = {
          userId: user.id,
          tourId: Number(item.tour.id),
          travelDate: item.date,
          travelers: item.travelers,
          totalPrice: item.totalPrice,
          // 🟢 แก้จาก slipImage || null เป็น slipImage || undefined
          paymentSlip: slipImage || undefined,
          tourNameSnapshot: item.tour.name,
          tourNameSnapshot_th: item.tour.name_th,
        };
        const res = await bookingService.createBooking(payload);
        return res.data;
      });

      const results = await Promise.all(bookingPromises);
      
      if (onClearCart) onClearCart();
      
      onNavigate("payment-confirmation", {
        ...results[0],
        tour: items[0].tour
      });
      
    } catch (error) {
      console.error("Payment failed:", error);
      alert(language === "th" ? "เชื่อมต่อ API ไม่สำเร็จ: จะจำลองพาไปหน้ายืนยันการจอง" : "API Error: Redirecting to mock confirmation.");
      
      if (onClearCart) onClearCart();
      
      onNavigate("payment-confirmation", {
        id: `BK-TEST-${Date.now().toString().slice(-6)}`, // จำลองรหัสการจอง
        tour: items[0].tour,
        travelDate: items[0].date,
        travelers: items[0].travelers,
        totalPrice: items[0].totalPrice
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] py-8 md:py-12 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-2 text-gray-500 hover:text-[#00A699] mb-8 transition-colors font-medium w-fit">
          <ArrowLeft className="w-5 h-5" />
          <span>{common.back}</span>
        </button>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">{t.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{language === 'th' ? 'เลือกช่องทางการชำระเงิน' : 'Select Payment Method'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => setSelectedMethod("qrcode")} className={`relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left ${selectedMethod === "qrcode" ? "border-[#00A699] bg-[#00A699]/5 shadow-sm" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedMethod === "qrcode" ? "bg-[#00A699] text-white" : "bg-gray-100 text-gray-400"}`}>
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{t.qrCode}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{language === "en" ? "Any banking app" : "แอปธนาคารใดก็ได้"}</div>
                  </div>
                  {selectedMethod === "qrcode" && <div className="absolute top-4 right-4 w-3 h-3 bg-[#00A699] rounded-full ring-4 ring-teal-100" />}
                </button>

                <button onClick={() => setSelectedMethod("card")} className={`relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left ${selectedMethod === "card" ? "border-[#00A699] bg-[#00A699]/5 shadow-sm" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedMethod === "card" ? "bg-[#00A699] text-white" : "bg-gray-100 text-gray-400"}`}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{t.creditCard}</div>
                    <div className="text-sm text-gray-500 mt-0.5">Visa, Mastercard, JCB</div>
                  </div>
                  {selectedMethod === "card" && <div className="absolute top-4 right-4 w-3 h-3 bg-[#00A699] rounded-full ring-4 ring-teal-100" />}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              {selectedMethod === "qrcode" ? (
                <div className="flex flex-col items-center justify-center py-6">
                  {slipImage ? (
                    <div className="relative mb-6 text-center">
                       <img src={slipImage} alt="Uploaded Slip" className="w-48 h-auto max-h-64 object-contain rounded-xl shadow-md border" />
                       <button onClick={() => setSlipImage(null)} className="text-red-500 text-sm mt-3 hover:underline font-medium block w-full text-center">
                         {language === "th" ? "ลบรูปภาพ" : "Remove Image"}
                       </button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200 mb-6">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png" alt="Payment QR" className="w-48 h-48 mix-blend-multiply opacity-80" />
                    </div>
                  )}
                  
                  <label className="w-full max-w-sm cursor-pointer group">
                    <div className={`border py-4 rounded-2xl transition-colors flex items-center justify-center gap-3 font-semibold ${slipImage ? 'bg-green-50 border-green-200 text-green-600' : 'bg-teal-50 hover:bg-teal-100 border-teal-100 text-[#00A699]'}`}>
                      {slipImage ? <CheckCircle className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                      <span>{slipImage ? (language === "en" ? "Slip Uploaded" : "อัปโหลดสลิปสำเร็จ") : (language === "en" ? "Upload Slip" : "อัปโหลดสลิปโอนเงิน")}</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <p className="text-gray-400 text-sm mt-4">{language === "th" ? "รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB" : "Supports JPG, PNG up to 5MB"}</p>
                </div>
              ) : (
                <div className="space-y-5 py-2">
                  <h3 className="font-bold text-gray-900 mb-2">{language === "en" ? "Enter Card Details" : "กรอกข้อมูลบัตร"}</h3>
                  <input type="text" placeholder={t.cardNumber} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#00A699]/20 focus:border-[#00A699] transition-all" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder={t.expiry} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#00A699]/20 focus:border-[#00A699] transition-all" />
                    <input type="text" placeholder="CVV" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#00A699]/20 focus:border-[#00A699] transition-all" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 sticky top-28">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t.summary}</h2>
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4 mb-4 pb-4 border-b border-gray-50 last:border-0 last:mb-0 last:pb-0">
                    <img src={item.tour.image} alt={item.tour.name} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight">{getLang(item.tour, "name", language)}</h3>
                      <div className="text-xs text-gray-500 mt-1.5">{item.date} • {item.travelers} {language === "en" ? "Pax" : "ท่าน"}</div>
                      <div className="font-black text-[#00A699] text-sm mt-1">฿{item.totalPrice.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-6 pt-6">
                <div className="flex justify-between items-end mb-8">
                  <span className="text-gray-500 font-medium">{t.totalAmount}</span>
                  <span className="text-3xl font-black text-[#00A699]">฿{totalPrice.toLocaleString()}</span>
                </div>
                <button onClick={handlePayment} disabled={isProcessing} className="w-full bg-[#00A699] text-white py-4 md:py-5 rounded-2xl font-bold text-lg hover:bg-[#008c81] transition-all flex justify-center items-center shadow-lg shadow-teal-200/50 active:scale-95 disabled:opacity-70 disabled:active:scale-100">
                  {isProcessing ? <span className="animate-pulse">{language === "en" ? "Processing Payment..." : "กำลังดำเนินการ..."}</span> : t.payNow}
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
    </div>
  );
}