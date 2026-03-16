import { ArrowLeft, ShieldCheck, QrCode, CheckCircle2 } from "lucide-react";

interface PaymentMethodsPageProps {
  language: "th" | "en";
  onNavigate: (page: string, data?: any) => void;
}

export function PaymentMethodsPage({ language, onNavigate }: PaymentMethodsPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12 pt-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-10">
          <button 
            onClick={() => onNavigate("dashboard")} // กลับไปหน้าโปรไฟล์
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              {language === "th" ? "วิธีการชำระเงิน" : "Payment Methods"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {language === "th" ? "ช่องทางการชำระเงินหลักของคุณ" : "Your primary payment method"}
            </p>
          </div>
        </div>

        {/* ── Payment Method: PromptPay ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-2 sm:p-3">
          <div className="bg-gradient-to-r from-teal-50/80 to-blue-50/50 rounded-2xl border border-teal-100/50 p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
            
            {/* ลวดลายตกแต่ง */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#00A699]/5 rounded-full blur-2xl"></div>

            <div className="flex items-center gap-5 sm:gap-6 relative z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#113566] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                {/* ไอคอนแทนโลโก้ PromptPay */}
                <QrCode className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-xl font-bold text-gray-900">PromptPay</h3>
                  <span className="bg-[#00A699] text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {language === "th" ? "แนะนำ" : "Recommended"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  {language === "th" ? "พร้อมเพย์ QR Code" : "PromptPay QR Code"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {language === "th" ? "รองรับทุกแอปพลิเคชันธนาคาร" : "Supports all mobile banking apps"}
                </p>
              </div>
            </div>

            {/* Badge สถานะ */}
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-teal-100 shadow-sm shrink-0 w-full sm:w-auto justify-center sm:justify-start relative z-10">
              <CheckCircle2 className="w-5 h-5 text-[#00A699]" />
              <span className="text-sm font-bold text-[#00A699]">
                {language === "th" ? "ช่องทางหลัก" : "Default Method"}
              </span>
            </div>

          </div>
        </div>

        {/* ── Security Note ── */}
        <div className="mt-8 flex items-start gap-4 p-5 bg-blue-50 text-blue-900 rounded-2xl text-sm border border-blue-100/50 shadow-sm">
          <ShieldCheck className="w-6 h-6 shrink-0 text-[#00A699]" />
          <div>
            <h4 className="font-bold mb-1">
              {language === "th" ? "การชำระเงินที่ปลอดภัยและรวดเร็ว" : "Secure and Fast Payment"}
            </h4>
            <p className="text-blue-800/80 leading-relaxed">
              {language === "th" 
                ? "เราใช้ระบบสแกน QR Code พร้อมเพย์เป็นช่องทางหลัก เพื่อให้คุณสามารถตรวจสอบยอดเงินและยืนยันการทำรายการผ่านแอปธนาคารของคุณได้โดยตรง ปลอดภัย 100% โดยไม่ต้องกรอกข้อมูลบัตร" 
                : "We use PromptPay QR Code as our primary method. This allows you to verify and confirm transactions directly via your banking app. 100% secure without needing to enter card details."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}