// src/components/ui/TutorialModal.tsx
import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Globe, Search, MapPin, CreditCard, CheckCircle } from "lucide-react";
import type { Language } from "../../data/translations";

interface TutorialModalProps {
  language: Language;
  onClose: () => void;
  onSelectLanguage?: (lang: Language) => void;
  showLanguageFirst?: boolean;
}

const slides = [
  {
    id: 1,
    title_th: "ค้นหาจุดหมายในฝัน",
    title_en: "Find Your Dream Destination",
    desc_th: "พิมพ์ชื่อจังหวัดหรือสถานที่ที่คุณอยากไปในช่องค้นหาที่หน้าแรก",
    desc_en: "Type a province or destination name in the search bar on the home page",
    illustration: (
      <div className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        {/* mock search bar */}
        <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
        <div className="flex gap-2 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <div className="h-3 w-32 bg-gray-200 rounded" />
          </div>
          <div className="w-20 h-10 bg-[#FF6B4A] rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-gray-100 rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-[#00A699] opacity-30" />
            </div>
          </div>
          <div className="h-20 bg-gray-100 rounded-xl relative overflow-hidden">
            {/* cursor indicator */}
            <div className="absolute bottom-3 right-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 2L16 10L10 11L8 18L4 2Z" fill="#00A699" stroke="white" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title_th: "เลือกดูรายละเอียดทัวร์",
    title_en: "Browse Tour Details",
    desc_th: "คลิกที่การ์ดจังหวัดหรือทัวร์ที่สนใจ เพื่อดูรายละเอียดโปรแกรมทั้งหมด",
    desc_en: "Click on any province or tour card to view the full program details",
    illustration: (
      <div className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 gap-3">
          {/* card 1 — normal */}
          <div className="h-24 bg-gray-100 rounded-xl" />
          {/* card 2 — highlighted */}
          <div className="h-24 bg-blue-50 rounded-xl border-2 border-[#00A699] relative overflow-hidden flex items-center justify-center">
            <MapPin className="w-7 h-7 text-[#00A699]" />
            <div className="absolute bottom-2 left-2 right-2 space-y-1">
              <div className="h-2 bg-blue-200 rounded w-3/4" />
            </div>
            {/* cursor */}
            <div className="absolute bottom-2 right-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 2L16 10L10 11L8 18L4 2Z" fill="#00A699" stroke="white" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>
          {/* card 3-4 */}
          <div className="h-14 bg-gray-100 rounded-xl" />
          <div className="h-14 bg-gray-100 rounded-xl" />
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title_th: "จองและชำระเงินง่ายๆ",
    title_en: "Book & Pay Easily",
    desc_th: 'กดปุ่ม "จองเลย" กรอกข้อมูล และเลือกวิธีชำระเงินที่ปลอดภัย',
    desc_en: 'Click "Book Now", fill in your details, and choose a secure payment method',
    illustration: (
      <div className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="space-y-3">
          <div className="h-3 w-32 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-100 rounded-xl" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-100 rounded-xl" />
          <div className="flex justify-between items-center mt-2">
            <div className="h-3 w-16 bg-gray-200 rounded" />
            <div className="h-8 w-20 bg-amber-100 rounded-lg" />
          </div>
          <div className="h-11 bg-[#FF6B4A] rounded-xl flex items-center justify-center gap-2 relative">
            <CreditCard className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-sm">Pay Now</span>
            {/* cursor */}
            <div className="absolute bottom-1 right-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 2L16 10L10 11L8 18L4 2Z" fill="#1a1a1a" stroke="white" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title_th: "พร้อมออกเดินทาง!",
    title_en: "Ready to Go!",
    desc_th: 'เสร็จสิ้น! จัดการการจองได้ที่เมนู "การจองของฉัน" ขอให้สนุกกับการเดินทางครับ',
    desc_en: 'Done! Manage your bookings in "My Bookings". Have a great trip!',
    illustration: (
      <div className="w-full flex flex-col items-center py-4">
        {/* checkmark circle */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" strokeWidth={1.5} />
        </div>
        {/* mock profile cards */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-20 bg-gray-100 rounded-2xl" />
          <div className="w-20 h-24 bg-white border-2 border-gray-200 rounded-2xl shadow-md flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-gray-400" />
            </div>
          </div>
          <div className="w-16 h-20 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    ),
  },
];

export function TutorialModal({ language, onClose, onSelectLanguage, showLanguageFirst = false }: TutorialModalProps) {
  const [step, setStep] = useState<"language" | "tutorial">(showLanguageFirst ? "language" : "tutorial");
  const [currentSlide, setCurrentSlide] = useState(0);
  const total = slides.length;

  // ปิด modal เมื่อกด Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSelectLang = (lang: Language) => {
    onSelectLanguage?.(lang);
    setStep("tutorial");
  };

  const handleNext = () => {
    if (currentSlide < total - 1) setCurrentSlide(c => c + 1);
    else onClose();
  };

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(c => c - 1);
    else setStep("language");
  };

  const slide = slides[currentSlide];

  // ── Language Selector ──────────────────────────────
  if (step === "language") {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* header gradient */}
          <div className="bg-[#00A699] px-8 pt-10 pb-8 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            {/* globe icon */}
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-1">Welcome to RoamHub</h2>
            <p className="text-white/80 text-sm">Select your language / เลือกภาษา</p>
          </div>

          {/* language options */}
          <div className="px-6 py-6 space-y-3">
            <button
              onClick={() => handleSelectLang("th")}
              className="w-full flex items-center gap-4 p-4 bg-white border-2 border-gray-100 hover:border-[#00A699] hover:bg-teal-50/30 rounded-2xl transition-all group"
            >
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#00A699]/10 transition-colors">
                <span className="text-base font-black text-[#00A699]">TH</span>
              </div>
              <div className="text-left">
                <p className="font-extrabold text-gray-900">ภาษาไทย</p>
                <p className="text-sm text-gray-500">Thai</p>
              </div>
            </button>

            <button
              onClick={() => handleSelectLang("en")}
              className="w-full flex items-center gap-4 p-4 bg-white border-2 border-gray-100 hover:border-[#00A699] hover:bg-teal-50/30 rounded-2xl transition-all group"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <span className="text-base font-black text-blue-600">ENG</span>
              </div>
              <div className="text-left">
                <p className="font-extrabold text-gray-900">English</p>
                <p className="text-sm text-gray-500">ภาษาอังกฤษ</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Tutorial Slides ─────────────────────────────────
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#F0F4F8] rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">

        {/* top bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-sm transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          {/* step dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentSlide ? "w-6 bg-[#00A699]" : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-sm transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* illustration area */}
        <div className="px-6 pt-4 pb-2">
          {slide.illustration}
        </div>

        {/* text content */}
        <div className="px-6 pt-4 pb-2">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
            {language === "th" ? slide.title_th : slide.title_en}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {language === "th" ? slide.desc_th : slide.desc_en}
          </p>
        </div>

        {/* navigation buttons */}
        <div className="flex items-center justify-between px-6 py-5">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 font-semibold text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {language === "th" ? "ย้อนกลับ" : "Back"}
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white font-bold px-6 py-3 rounded-2xl transition-all active:scale-[0.97] shadow-lg"
          >
            {currentSlide === total - 1
              ? (language === "th" ? "เริ่มต้นใช้งาน" : "Get Started")
              : (language === "th" ? "ถัดไป" : "Next")}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}