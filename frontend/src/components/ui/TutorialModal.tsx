// src/components/ui/TutorialModal.tsx
import { useState, useEffect } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Search,
  MapPin,
  CreditCard,
  CheckCircle2,
  MousePointer2,
  Globe,
} from "lucide-react";
import type { Language } from "../../data/translations";
import { useScrollLock } from "../../hooks/useScrollLock";

interface TutorialModalProps {
  isOpen?: boolean;
  language: Language;
  onClose: () => void;
  onSelectLanguage?: (lang: Language) => void;
  showLanguageFirst?: boolean;
}

export function TutorialModal({
  isOpen = true,
  language,
  onClose,
  onSelectLanguage,
  showLanguageFirst = true,
}: TutorialModalProps) {
  // ✨ แก้ไข 1: ตั้งค่าหน้าเริ่มต้นให้ตรงกับคำสั่งที่ส่งมา เพื่อป้องกันอาการแว๊บ (Flicker)
  const [step, setStep] = useState<"language" | "tutorial">(
    showLanguageFirst ? "language" : "tutorial"
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // ล็อก scroll พื้นหลัง
  useScrollLock(isOpen);

  const lang = language;

  // รีเซ็ตกลับไปหน้าแรกเสมอ ทุกครั้งที่ Modal ถูกเปิดขึ้นมาใหม่
  useEffect(() => {
    if (isOpen) {
      setStep(showLanguageFirst ? "language" : "tutorial");
      setCurrentStepIndex(0);
    }
  }, [isOpen, showLanguageFirst]);

  // ปิด modal เมื่อกด Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleLanguageSelect = (selectedLang: Language) => {
    onSelectLanguage?.(selectedLang);
    setStep("tutorial");
  };

  const tutorialSteps = [
    {
      title: lang === "th" ? "ค้นหาจุดหมายในฝัน" : "Search Your Destination",
      desc:
        lang === "th"
          ? "พิมพ์ชื่อจังหวัดหรือสถานที่ที่คุณอยากไปในช่องค้นหาที่หน้าแรก"
          : "Type your desired province or destination in the search bar.",
      mockUI: (
        <div className="w-full max-w-[280px] sm:max-w-sm mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-4 mt-2 sm:mt-6 relative overflow-hidden">
          <div className="h-3 sm:h-4 w-1/3 bg-gray-200 rounded mb-3 sm:mb-4"></div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2 sm:p-3 relative z-10">
            <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            <div className="h-2 sm:h-3 w-24 sm:w-32 bg-gray-200 rounded"></div>
            <div className="absolute right-2 top-1.5 sm:top-2 bg-[#FF6B4A] h-6 sm:h-8 w-12 sm:w-16 rounded flex items-center justify-center">
              <div className="h-1.5 sm:h-2 w-6 sm:w-8 bg-white/50 rounded"></div>
            </div>
          </div>
          <div className="absolute top-[60%] left-[60%] animate-bounce duration-1000 z-20">
            <MousePointer2 className="w-6 h-6 sm:w-8 sm:h-8 text-[#00A699] fill-[#00A699]/20 -rotate-12 drop-shadow-lg" />
          </div>
          <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 opacity-50">
            <div className="h-16 sm:h-20 bg-gray-100 rounded-lg"></div>
            <div className="h-16 sm:h-20 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      ),
    },
    {
      title: lang === "th" ? "เลือกดูรายละเอียดทัวร์" : "Select & View Details",
      desc:
        lang === "th"
          ? "คลิกที่การ์ดจังหวัดหรือทัวร์ที่สนใจ เพื่อดูรายละเอียดโปรแกรมทั้งหมด"
          : "Click on a card to view full itinerary and details.",
      mockUI: (
        <div className="w-full max-w-[280px] sm:max-w-sm mx-auto mt-2 sm:mt-4 relative">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-white p-2 rounded-xl border border-gray-100 opacity-50">
              <div className="h-12 sm:h-16 bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-2 sm:h-3 w-3/4 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white p-2 rounded-xl border-2 border-[#00A699] shadow-lg transform scale-105 relative z-10">
              <div className="h-12 sm:h-16 bg-blue-100 rounded-lg mb-2 flex items-center justify-center">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <div className="h-2 sm:h-3 w-3/4 bg-gray-200 rounded mb-1"></div>
              <div className="h-1.5 sm:h-2 w-1/2 bg-gray-100 rounded"></div>
              <div className="absolute -bottom-3 -right-2 animate-pulse z-20">
                <MousePointer2 className="w-6 h-6 sm:w-8 sm:h-8 text-[#00A699] fill-white" />
              </div>
            </div>
            <div className="bg-white p-2 rounded-xl border border-gray-100 opacity-50">
              <div className="h-12 sm:h-16 bg-gray-200 rounded-lg mb-2"></div>
            </div>
            <div className="bg-white p-2 rounded-xl border border-gray-100 opacity-50">
              <div className="h-12 sm:h-16 bg-gray-200 rounded-lg mb-2"></div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: lang === "th" ? "จองและชำระเงินง่ายๆ" : "Easy Booking",
      desc:
        lang === "th"
          ? 'กดปุ่ม "จองเลย" กรอกข้อมูล และเลือกวิธีชำระเงินที่ปลอดภัย'
          : 'Click "Book Now", fill details, and choose a secure payment method.',
      mockUI: (
        <div className="w-full max-w-[280px] sm:max-w-sm mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-4 mt-2 sm:mt-6 relative">
          <div className="space-y-2 sm:space-y-3 opacity-60">
            <div className="h-2 sm:h-3 w-1/3 bg-gray-200 rounded"></div>
            <div className="h-6 sm:h-8 w-full bg-gray-100 rounded border border-gray-200"></div>
            <div className="h-2 sm:h-3 w-1/3 bg-gray-200 rounded"></div>
            <div className="h-6 sm:h-8 w-full bg-gray-100 rounded border border-gray-200"></div>
          </div>

          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <div className="h-3 sm:h-4 w-16 bg-gray-200 rounded"></div>
              <div className="h-4 sm:h-6 w-20 bg-orange-100 rounded"></div>
            </div>
            <div className="w-full h-8 sm:h-10 bg-[#FF6B4A] rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-200 relative animate-pulse">
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="text-[10px] sm:text-xs font-bold">Pay Now</span>
              <div className="absolute -right-2 -bottom-4">
                <MousePointer2 className="w-6 h-6 sm:w-8 sm:h-8 text-black fill-white -rotate-12" />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: lang === "th" ? "พร้อมออกเดินทาง!" : "Ready to Roam!",
      desc:
        lang === "th"
          ? 'เสร็จสิ้น! จัดการการจองได้ที่เมนู "การจองของฉัน" ขอให้สนุกกับการเดินทางครับ'
          : 'Done! Manage bookings in "My Bookings". Enjoy your trip!',
      mockUI: (
        <div className="w-full max-w-[280px] sm:max-w-sm mx-auto flex flex-col items-center justify-center mt-4 sm:mt-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-[bounce_2s_infinite]">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
          </div>
          <div className="flex gap-2 mb-4">
            <div className="w-12 h-16 sm:w-16 sm:h-20 bg-gray-100 rounded-lg rotate-[-10deg] transform origin-bottom-right border border-gray-200"></div>
            <div className="w-16 h-20 sm:w-20 sm:h-24 bg-white shadow-xl rounded-lg border border-gray-100 z-10 flex flex-col items-center justify-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-200 rounded-full mb-2"></div>
              <div className="w-8 h-1.5 sm:w-10 sm:h-2 bg-gray-200 rounded"></div>
            </div>
            <div className="w-12 h-16 sm:w-16 sm:h-20 bg-gray-100 rounded-lg rotate-[10deg] transform origin-bottom-left border border-gray-200"></div>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    } else {
      setStep("language");
    }
  };

  // ── หน้าเลือกภาษา ──────────────────────────────
  if (step === "language") {
    return (
      <div 
        className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose} // ✨ กดพื้นหลังเพื่อปิด
      >
        <div 
          className="w-[95vw] max-w-sm rounded-3xl p-0 overflow-hidden bg-white border-none shadow-2xl animate-in fade-in zoom-in duration-200 relative"
          onClick={(e) => e.stopPropagation()} // ป้องกันการกดโดนตัวกล่องแล้วปิด
        >
          <div className="bg-[#00A699] p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white/10 rotate-12 scale-150 transform origin-top-right"></div>
            <div className="relative z-10 flex justify-center mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner">
                <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white relative z-10">
              Welcome to RoamHub
            </h2>
            <p className="text-white/90 text-sm mt-2 relative z-10">
              Select your language / เลือกภาษา
            </p>
          </div>

          <div className="p-6 sm:p-8 grid gap-3 sm:gap-4">
            <button
              type="button" // ✨ ป้องกันการเผลอ Submit โหลดหน้าใหม่
              className="w-full flex items-center h-14 sm:h-16 text-base sm:text-lg justify-start px-4 sm:px-6 border-2 border-gray-100 hover:border-[#00A699] hover:bg-teal-50 transition-all group relative overflow-hidden rounded-xl bg-white"
              onClick={() => handleLanguageSelect("th")}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs sm:text-sm mr-3 sm:mr-4 border border-teal-200 flex-shrink-0">
                TH
              </div>
              <div className="text-left flex-1">
                <span className="block font-bold text-gray-800 text-sm sm:text-base">
                  ภาษาไทย
                </span>
                <span className="block text-[10px] sm:text-xs text-gray-500">
                  Thai
                </span>
              </div>
              <div className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 sm:translate-x-4 pr-2">
                <ChevronRight className="w-5 h-5 text-[#00A699]" />
              </div>
            </button>

            <button
              type="button"
              className="w-full flex items-center h-14 sm:h-16 text-base sm:text-lg justify-start px-4 sm:px-6 border-2 border-gray-100 hover:border-[#007AFF] hover:bg-blue-50 transition-all group relative overflow-hidden rounded-xl bg-white"
              onClick={() => handleLanguageSelect("en")}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs sm:text-sm mr-3 sm:mr-4 border border-blue-200 flex-shrink-0">
                ENG
              </div>
              <div className="text-left flex-1">
                <span className="block font-bold text-gray-800 text-sm sm:text-base">
                  English
                </span>
                <span className="block text-[10px] sm:text-xs text-gray-500">
                  ภาษาอังกฤษ
                </span>
              </div>
              <div className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 sm:translate-x-4 pr-2">
                <ChevronRight className="w-5 h-5 text-[#007AFF]" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── หน้า Tutorial Slides ─────────────────────────────────
  const currentData = tutorialSteps[currentStepIndex];

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose} // ✨ กดพื้นหลังเพื่อปิด
    >
      <div 
        className="w-[95vw] max-w-lg h-[80vh] sm:h-[600px] p-0 bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* พื้นที่แสดงรูปประกอบ (Mock UI) ด้านบน */}
        <div className="flex-1 bg-gray-50 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          <div
            key={currentStepIndex}
            className="w-full transform scale-95 sm:scale-100 animate-in zoom-in-95 duration-500 relative z-10"
          >
            {currentData.mockUI}
          </div>

          {/* จุดบ่งบอกสถานะหน้าปัจจุบัน */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-1.5 z-30">
            {tutorialSteps.map((_, idx) => (
              <div
                key={idx}
                className={`transition-all duration-300 rounded-full h-1.5 ${
                  idx === currentStepIndex
                    ? "w-4 sm:w-6 bg-[#00A699]"
                    : "w-1.5 sm:w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 p-2 bg-white/80 rounded-full hover:bg-white text-gray-500 hover:text-gray-800 transition z-30 shadow-sm border border-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* พื้นที่แสดงข้อความและปุ่มด้านล่าง */}
        <div className="bg-white p-5 sm:p-8 border-t border-gray-100 relative z-20 shrink-0">
          <div className="mb-4 sm:mb-8 min-h-[60px] sm:min-h-[80px]">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {currentData.title}
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              {currentData.desc}
            </p>
          </div>

          <div className="flex flex-row justify-between items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center text-gray-400 hover:text-gray-600 px-2 sm:px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors font-medium"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">
                {lang === "th" ? "ย้อนกลับ" : "Back"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center justify-center flex-1 sm:flex-none bg-gray-900 hover:bg-black text-white px-6 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl shadow-lg shadow-gray-200 transition-all active:scale-95"
            >
              <span className="font-bold text-sm sm:text-base">
                {currentStepIndex === tutorialSteps.length - 1
                  ? lang === "th"
                    ? "เริ่มต้นใช้งาน"
                    : "Get Started"
                  : lang === "th"
                  ? "ถัดไป"
                  : "Next"}
              </span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}