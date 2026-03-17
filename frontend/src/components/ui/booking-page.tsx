  import { useState, useEffect } from "react";
  import { useParams } from "react-router-dom";
  import { ArrowLeft, Calendar, Users, Plus, Minus, ShoppingBag, ArrowRight, AlertCircle, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, X, Sparkles } from "lucide-react";
  import type { Tour } from "../../types/index";
  import { translations } from "../../data/translations";
  import type { Language } from "../../data/translations";
  import { useCart } from "../../context/CartContext";
  import { tourService, bookingService } from "../../services/api";
  import { useScrollLock } from "../../hooks/useScrollLock";
  import { useAuth } from "../../features/auth/context/AuthContext";

  type ToastType = "success" | "error" | "warning";
  interface ToastData { id: number; type: ToastType; message: string; }

  function ToastContainer({ toasts, onRemove }: { toasts: ToastData[]; onRemove: (id: number) => void }) {
    return (
      // ✅ top-20 = ลงมาใต้ navbar (navbar สูงประมาณ 72px) + right-4 ชิดขวา แทนกลาง
      <div className="fixed top-20 right-4 z-[9999] flex flex-col items-end gap-2.5 pointer-events-none w-full max-w-xs">
        {toasts.map((toast) => <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />)}
      </div>
    );
  }

  function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: number) => void }) {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
      const enterTimer = setTimeout(() => setVisible(true), 10);
      const leaveTimer = setTimeout(() => handleClose(), 3800);
      return () => { clearTimeout(enterTimer); clearTimeout(leaveTimer); };
    }, []);

    const handleClose = () => {
      setLeaving(true);
      setTimeout(() => onRemove(toast.id), 350);
    };

    const config = {
      success: { bg: "bg-white", border: "border-[#00A699]/20", accent: "bg-[#00A699]", iconBg: "bg-[#00A699]/10", iconColor: "text-[#00A699]", Icon: CheckCircle, progressColor: "bg-[#00A699]" },
      error:   { bg: "bg-white", border: "border-red-200",       accent: "bg-red-500",   iconBg: "bg-red-50",        iconColor: "text-red-500",   Icon: XCircle,     progressColor: "bg-red-500"   },
      warning: { bg: "bg-white", border: "border-amber-200",     accent: "bg-amber-400", iconBg: "bg-amber-50",      iconColor: "text-amber-500", Icon: AlertCircle, progressColor: "bg-amber-400" },
    }[toast.type];

    const { Icon } = config;

    return (
      <div
        className="pointer-events-auto w-full"
        style={{
          transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          opacity: visible && !leaving ? 1 : 0,
          // ✅ slide in จากขวา แทน drop down จากบน
          transform: visible && !leaving ? "translateX(0) scale(1)" : "translateX(60px) scale(0.95)",
        }}
      >
        <div className={`relative flex items-center gap-3 ${config.bg} border ${config.border} rounded-2xl px-4 py-3.5 shadow-lg shadow-black/[0.06] overflow-hidden`}>
          {/* accent bar ซ้าย */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.accent} rounded-l-2xl`} />
          {/* icon */}
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${config.iconBg}`}>
            <Icon className={`w-4 h-4 ${config.iconColor}`} />
          </div>
          {/* message */}
          <p className="flex-1 text-sm font-semibold text-gray-800 leading-snug">{toast.message}</p>
          {/* close */}
          <button onClick={handleClose} className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 ml-1">
            <X className="w-3.5 h-3.5" />
          </button>
          {/* progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-100 overflow-hidden">
            <div className={`h-full ${config.progressColor}`} style={{ animation: "toastProgress 3.8s linear forwards" }} />
          </div>
        </div>
        <style>{`@keyframes toastProgress { from { width: 100%; } to { width: 0%; } }`}</style>
      </div>
    );
  }

  function useToast() {
    const [toasts, setToasts] = useState<ToastData[]>([]);
    let counter = 0;
    const show = (message: string, type: ToastType = "success") => {
      const id = Date.now() + counter++;
      setToasts((prev) => [...prev, { id, type, message }]);
    };
    const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));
    return { toasts, show, remove };
  }

  interface BookingPageProps {
    tour?: Tour | null;
    bookingData?: any; // รับ bookingData เต็มเมื่อย้อนกลับจากหน้าชำระเงิน
    onNavigate: (page: string, data?: any) => void;
    language: Language;
    onAddToCart?: (item: any) => void;
  }

  export function BookingPage({ tour, bookingData, onNavigate, language }: BookingPageProps) {
    const { addToCart } = useCart();
    const { user, token } = useAuth();
    const t = translations[language].booking;
    const params = useParams();
    const [localTour, setLocalTour] = useState<Tour | null>(tour || bookingData?.tour || null);
    const [loading, setLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));
    // ✅ restore ค่าเดิมถ้ามี bookingData ส่งมา (กรณีย้อนกลับจากหน้าชำระเงิน)
    const [selectedDate, setSelectedDate] = useState(bookingData?.date || "");
    const [datePopup, setDatePopup] = useState<{ isOpen: boolean; startDate: string; endDate: string }>({ isOpen: false, startDate: "", endDate: "" });
    const [travelers, setTravelers] = useState(bookingData?.travelers || 0);
    const [contactInfo, setContactInfo] = useState(bookingData?.contactInfo || { fullName: "", email: "", phone: "", specialRequests: "" });
    const [availableSeats, setAvailableSeats] = useState<number>(10);
    const [isFull, setIsFull] = useState<boolean>(false);
    const [autofillLoading, setAutofillLoading] = useState(false);
    const [autofillFlash, setAutofillFlash] = useState(false);

    const { toasts, show: showToast, remove: removeToast } = useToast();

    // ดึง profile จาก API (GET /users/profile) แล้ว fallback ไป localStorage / AuthContext
    const handleAutofill = async () => {
      setAutofillLoading(true);
      try {
        let profileData = { fullName: "", email: "", phone: "" };

        if (token) {
          const res = await fetch(`${import.meta.env.VITE_API_URL || "http://wd04.pupasoft.com:3000"}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            profileData = {
              fullName: data.fullName || "",
              email: data.email || "",
              phone: data.phone || "",
            };
            localStorage.setItem("userProfile", JSON.stringify(profileData));
          } else {
            throw new Error("API error");
          }
        } else {
          const cached = localStorage.getItem("userProfile");
          if (cached) {
            profileData = JSON.parse(cached);
          } else {
            profileData = { fullName: user?.fullName || "", email: user?.email || "", phone: "" };
          }
        }

        setContactInfo((prev: typeof contactInfo) => ({
          ...prev,
          fullName: profileData.fullName,
          email: profileData.email,
          phone: profileData.phone,
        }));
        setAutofillFlash(true);
        setTimeout(() => setAutofillFlash(false), 1500);
        showToast(
          language === "th" ? "กรอกข้อมูลจากโปรไฟล์แล้ว ✓" : "Auto-filled from your profile ✓",
          "success"
        );
      } catch {
        setContactInfo((prev: typeof contactInfo) => ({
          ...prev,
          fullName: user?.fullName || "",
          email: user?.email || "",
        }));
        showToast(
          language === "th" ? "กรอกข้อมูลบางส่วนแล้ว (ไม่พบเบอร์โทร)" : "Partially filled — phone not found",
          "warning"
        );
      } finally {
        setAutofillLoading(false);
      }
    };
    const totalPrice = (localTour?.price || 0) * travelers;
    useScrollLock(datePopup.isOpen);

    useEffect(() => {
      if (!localTour && params?.id) {
        setLoading(true);
        (async () => {
          try {
            const resp = await tourService.getById(String(params.id));
            const data = resp.data;
            console.log('✅ localTour fetched:', data); // debug
            setLocalTour(data);
          } catch (err) {
            console.error("Failed to fetch tour:", err);
          } finally {
            setLoading(false);
          }
        })();
      }
    }, [params?.id, localTour]);

    useEffect(() => {
      if (localTour?.availableDates && localTour.availableDates.length > 0 && !selectedDate) {
        const [y, m] = localTour.availableDates[0].split('-');
        setCurrentMonth(new Date(Number(y), Number(m) - 1, 1));
      }
    }, [localTour]);

    // 🟢 ระบบตรวจสอบและตัดยอดที่นั่งแบบ Real-time
    useEffect(() => {
      if (!localTour || !selectedDate) return;
      
      const fetchSeats = async () => {
        try {
          const max = Number(localTour.maxCapacity) || 10;
          const res = await bookingService.getAllBookings();
          const bookings = res.data || [];
          
          const bookedCount = bookings
            .filter((b: any) => {
              // 1. เช็คว่าเป็นทัวร์เดียวกัน
              const isSameTour = String(b.tourId) === String(localTour.id) || String((b.tour as any)?.id) === String(localTour.id);
              
              // 2. แปลงวันที่จาก Database ให้เป็น YYYY-MM-DD เพื่อเอามาเทียบให้ตรงกันเป๊ะๆ
              const bDateObj = new Date(b.travelDate || b.date || '');
              const bDateStr = !isNaN(bDateObj.getTime()) 
                ? `${bDateObj.getFullYear()}-${String(bDateObj.getMonth() + 1).padStart(2, '0')}-${String(bDateObj.getDate()).padStart(2, '0')}`
                : '';
              const isSameDate = bDateStr === selectedDate;

              // 3. เอาเฉพาะสถานะที่ไม่ได้ถูกยกเลิก (ยังจองอยู่)
              const isNotCancelled = !['REJECTED', 'CANCELLED', 'FAILED'].includes(b.status?.toUpperCase());

              return isSameTour && isSameDate && isNotCancelled;
            })
            // รวมจำนวนคนที่จองไปแล้วทั้งหมดในวันนั้น
            .reduce((sum: number, b: any) => sum + Number(b.travelers || 0), 0);

          // 4. คำนวณที่นั่งคงเหลือ
          const remain = max - bookedCount;
          setAvailableSeats(remain > 0 ? remain : 0);
          setIsFull(remain <= 0);

          // 5. ปรับตัวเลขคนจองอัตโนมัติ ไม่ให้เกินที่นั่งว่าง
          if (travelers > remain && remain > 0) {
            setTravelers(remain); // ถ้ากรอกไว้เกิน ให้หดลงมาเท่าที่ว่าง
          } else if (remain <= 0) {
            setTravelers(0); // ถ้าเต็มแล้ว บังคับเป็น 0
          } else if (travelers <= 0 && remain > 0) {
            setTravelers(1); // ถ้าว่างอยู่ ให้ตั้งต้นที่ 1 คนเสมอ
          }
          
        } catch (error) {
          console.error("Error calculating seats:", error);
          setAvailableSeats(localTour?.maxCapacity || 10);
        }
      };
      
      fetchSeats();
    }, [localTour, selectedDate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setContactInfo((prev: typeof contactInfo) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
      if (!selectedDate) {
        showToast(language === "th" ? "กรุณาเลือกวันที่เดินทาง" : "Please select a travel date.", "warning");
        return false;
      }
      if (travelers <= 0) {
        showToast(language === "th" ? "กรุณาเลือกจำนวนผู้เดินทาง" : "Please select the number of travelers.", "warning");
        return false;
      }
      if (isFull) {
        showToast(language === "th" ? "ขออภัย ทัวร์รอบนี้เต็มแล้ว" : "Sorry, this tour is fully booked for this date.", "error");
        return false;
      }
      if (!contactInfo.fullName || !contactInfo.email || !contactInfo.phone) {
        showToast(language === "th" ? "กรุณากรอกข้อมูลผู้ติดต่อให้ครบถ้วน" : "Please fill in all contact information", "warning");
        return false;
      }
      return true;
    };

    const handleAddToCart = () => {
      if (isFull || !validateForm()) return;

      // ✅ safeguard ชื่อทัวร์ — ป้องกันกรณี field ไม่ตรง
      const tourToAdd = {
        ...localTour,
        name: localTour?.name || localTour?.name_th || "ทัวร์",
        name_th: localTour?.name_th || localTour?.name || "ทัวร์",
      };

      addToCart({
        tour: tourToAdd,
        date: selectedDate,
        travelers,
        totalPrice,
        contactInfo,
      });

      showToast(
        language === "th"
          ? `เพิ่มลงตะกร้าสำเร็จ! · ${travelers} ท่าน · ฿${totalPrice.toLocaleString()}`
          : `Added to cart! · ${travelers} pax · ฿${totalPrice.toLocaleString()}`,
        "success"
      );
    };

    const handleContinue = () => {
      if (isFull || !validateForm()) return;
      onNavigate("payment", { tour: localTour, date: selectedDate, travelers, totalPrice, contactInfo });
    };

    const handleDateClick = (dateStr: string) => {
      if (!localTour) return;
      const tripDays = localTour.tripDays || 1;
      const start = new Date(dateStr);
      const end = new Date(start);
      end.setDate(end.getDate() + tripDays - 1);
      setDatePopup({ isOpen: true, startDate: dateStr, endDate: end.toISOString().split('T')[0] });
    };

    const confirmDateSelection = () => {
      setSelectedDate(datePopup.startDate);
      setDatePopup(prev => ({ ...prev, isOpen: false }));
    };

    const weekDays = language === "th" ? ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const monthNames = language === "th"
      ? ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]
      : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

    const isDateInSelectedRange = (dateStr: string) => {
      if (!selectedDate || !localTour?.tripDays || localTour.tripDays <= 1) return selectedDate === dateStr;
      const start = new Date(selectedDate);
      const end = new Date(selectedDate);
      end.setDate(start.getDate() + localTour.tripDays - 1);
      const current = new Date(dateStr);
      return current >= start && current <= end;
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!localTour) return <div className="min-h-screen flex items-center justify-center">{language === 'th' ? 'ไม่พบข้อมูลทัวร์' : 'Tour not found'}</div>;

    return (
      <div className="min-h-screen bg-[#F7F9FA] pb-28 font-sans">
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        {/* ── Header ── */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Main row */}
            <div className="flex items-center justify-between gap-4 py-4">

              {/* LEFT: back + title */}
              <div className="flex items-center gap-4 min-w-0">
                {/* back */}
                <button
                  onClick={() => onNavigate("tour-detail", localTour)}
                  className="flex items-center gap-2 text-gray-400 hover:text-[#00A699] transition-all group flex-shrink-0"
                >
                  <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-[#00A699]/10 border border-gray-200 group-hover:border-[#00A699]/30 flex items-center justify-center transition-all">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  </div>
                  <span className="text-sm font-semibold hidden sm:block">{language === 'th' ? 'ย้อนกลับ' : 'Back'}</span>
                </button>

                {/* divider */}
                <div className="w-px h-8 bg-gray-200 flex-shrink-0 mx-2" />

                {/* title block */}
                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">{t.title}</h1>
                  <p className="text-sm text-gray-400 font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-md mt-0.5">
                    {language === "th" && localTour.name_th ? localTour.name_th : localTour.name}
                  </p>
                </div>
              </div>

              {/* RIGHT: badge + price */}
              <div className="flex-shrink-0 text-right">
                <span className="inline-flex items-center gap-1.5 bg-[#00A699]/10 text-[#00A699] px-3 py-1.5 rounded-xl text-xs font-bold border border-[#00A699]/20">
                  {localTour.tripType === 'multiple-days'
                    ? (language === 'th' ? `🗓 ทริป ${localTour.tripDays || 1} วัน` : `🗓 ${localTour.tripDays || 1}-Day Trip`)
                    : (language === 'th' ? '☀️ ไปเช้าเย็นกลับ' : '☀️ Day Trip')}
                </span>
                {localTour.price && (
                  <p className="text-xs text-gray-400 mt-1">
                    {language === 'th' ? 'ราคาเริ่มต้น ' : 'From '}
                    <span className="text-[#00A699] font-bold">฿{Number(localTour.price).toLocaleString()}</span>
                    {language === 'th' ? '/ท่าน' : '/pax'}
                  </p>
                )}
              </div>
            </div>

            {/* Step indicator */}
            <div className="border-t border-gray-100">
              {(() => {
                const hasDate     = !!selectedDate;
                const hasTraveler = travelers > 0;
                const hasContact  = !!(contactInfo.fullName && contactInfo.email && contactInfo.phone);
                const steps = [
                  { num: 1, label: language === 'th' ? 'เลือกวันที่'   : 'Select Date', done: hasDate,                     active: !hasDate },
                  { num: 2, label: language === 'th' ? 'ผู้เดินทาง'    : 'Travelers',   done: hasDate && hasTraveler,       active: hasDate && !hasContact },
                  { num: 3, label: language === 'th' ? 'ข้อมูลติดต่อ' : 'Contact',     done: hasContact,                   active: hasDate && hasTraveler && !hasContact },
                ];
                return (
                  <div className="flex">
                    {steps.map((step, i) => (
                      <div key={step.num} className="flex-1 relative flex items-center justify-center py-3">
                        {/* active underline */}
                        <div className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-t-sm transition-all duration-300 ${
                          step.done ? 'bg-[#00A699]' : step.active ? 'bg-[#00A699]/30' : 'bg-transparent'
                        }`} />
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all ${
                            step.done ? 'bg-[#00A699] text-white' : step.active ? 'bg-[#00A699]/15 text-[#00A699] border-2 border-[#00A699]/40' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {step.done ? '✓' : step.num}
                          </div>
                          <span className={`text-xs font-semibold transition-colors ${
                            step.done ? 'text-[#00A699]' : step.active ? 'text-gray-800' : 'text-gray-400'
                          }`}>{step.label}</span>
                        </div>
                        {i < 2 && <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-gray-100" />}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">

              {/* Calendar */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-50 text-[#00A699] rounded-2xl flex items-center justify-center">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{t.selectDate}</h2>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-xl border border-gray-100 w-fit">
                    <button onClick={prevMonth} className="p-2 hover:bg-white rounded-lg transition shadow-sm text-gray-600"><ChevronLeft className="w-5 h-5" /></button>
                    <div className="font-bold text-gray-900 min-w-[100px] text-center">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</div>
                    <button onClick={nextMonth} className="p-2 hover:bg-white rounded-lg transition shadow-sm text-gray-600"><ChevronRight className="w-5 h-5" /></button>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-2xl p-4 md:p-6 bg-gray-50/30">
                  <div className="grid grid-cols-7 gap-2 text-center mb-4">
                    {weekDays.map((day) => <div key={day} className="text-sm font-bold text-gray-400 py-2">{day}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-y-2 text-center">
                    {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const isStart = selectedDate === dateStr;
                      const inRange = isDateInSelectedRange(dateStr);
                      const hasRule = localTour.availableDates && localTour.availableDates.length > 0;
                      const isAvailableStart = hasRule ? localTour.availableDates!.includes(dateStr) : true;

                      let bgClass = "bg-white hover:bg-teal-50 text-gray-700 border border-transparent";
                      if (!isAvailableStart && !inRange) bgClass = "opacity-40 bg-gray-50 cursor-not-allowed text-gray-400";
                      if (isStart) bgClass = "bg-[#00A699] text-white shadow-lg shadow-teal-200 z-10 scale-105 rounded-2xl";
                      else if (inRange) bgClass = "bg-teal-50 text-[#00A699] font-bold border-y border-teal-100 scale-100 rounded-none";

                      return (
                        <div key={i} className={`relative flex items-center justify-center h-full w-full ${inRange && !isStart ? 'bg-teal-50' : ''}`}>
                          <button
                            onClick={() => { if (isAvailableStart) handleDateClick(dateStr); }}
                            disabled={!isAvailableStart}
                            className={`aspect-square w-full flex flex-col items-center justify-center text-sm font-semibold transition-all duration-200 relative ${bgClass}`}
                          >
                            {day}
                            {isAvailableStart && !inRange && <span className="w-1.5 h-1.5 rounded-full bg-[#00A699] absolute bottom-2 opacity-50"></span>}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Travelers */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-[#007AFF] rounded-2xl flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{t.travelers}</h2>
                      {localTour.vehicleType && <p className="text-sm text-gray-500">เดินทางโดย: {localTour.vehicleType}</p>}
                    </div>
                  </div>
                  <div className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold text-gray-600">
                    รับได้สูงสุด {localTour.maxCapacity || 10} ท่าน/รอบ
                  </div>
                </div>

                {isFull && selectedDate && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center justify-center gap-2 mb-4 animate-in fade-in">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-bold">{language === 'th' ? 'ขออภัย ทัวร์สำหรับวันที่เลือกรอบเต็มแล้ว' : 'Sorry, this date is fully booked.'}</span>
                  </div>
                )}

                <div className={`flex items-center justify-between p-4 md:p-6 border rounded-2xl ${isFull || !selectedDate ? 'border-gray-200 bg-gray-50 opacity-70' : 'border-gray-100'}`}>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{language === "th" ? "ผู้เดินทาง" : "Travelers"}</div>
                    <div className="text-sm font-medium mt-1 text-[#00A699]">
                      {selectedDate
                        ? (language === "th" ? `(เหลือที่ว่าง ${availableSeats} ที่)` : `(${availableSeats} seats left)`)
                        : (language === "th" ? "กรุณาเลือกวันที่ก่อน" : "Select a date first")}
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <button onClick={() => setTravelers(Math.max(1, travelers - 1))} disabled={travelers <= 1 || isFull} className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200">
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-xl font-bold w-6 text-center text-gray-900">{travelers}</span>
                    <button onClick={() => setTravelers(Math.min(availableSeats, travelers + 1))} disabled={travelers >= availableSeats || isFull} className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className={`bg-white rounded-3xl p-6 md:p-8 shadow-sm border transition-shadow ${autofillFlash ? 'border-[#00A699] ring-2 ring-[#00A699]/20' : 'border-gray-100'} ${isFull ? 'opacity-60 pointer-events-none' : 'hover:shadow-md'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">{t.personalInfo}</h2>
                  {/* ✅ ปุ่ม Autofill จากโปรไฟล์ */}
                  {user && (
                    <button
                      onClick={handleAutofill}
                      disabled={autofillLoading || isFull}
                      className="flex items-center gap-2 px-4 py-2 bg-[#00A699]/10 hover:bg-[#00A699]/20 text-[#00A699] rounded-xl text-sm font-bold transition-all active:scale-95 border border-[#00A699]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles className={`w-4 h-4 ${autofillLoading ? 'animate-spin' : ''}`} />
                      {autofillLoading
                        ? (language === "th" ? "กำลังโหลด..." : "Loading...")
                        : (language === "th" ? "กรอกจากโปรไฟล์" : "Fill from Profile")}
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <input name="fullName" type="text" placeholder={t.fullName} value={contactInfo.fullName} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#00A699]/20 focus:border-[#00A699] transition-all" required disabled={isFull} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="email" type="email" placeholder={t.email} value={contactInfo.email} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#00A699]/20 focus:border-[#00A699] transition-all" required disabled={isFull} />
                    <input name="phone" type="tel" placeholder={t.phone} value={contactInfo.phone} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#00A699]/20 focus:border-[#00A699] transition-all" required disabled={isFull} />
                  </div>
                  <textarea name="specialRequests" placeholder={language === "th" ? "คำขอพิเศษ (ไม่บังคับ)" : "Special Requests (Optional)"} value={contactInfo.specialRequests} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#00A699]/20 focus:border-[#00A699] transition-all resize-none" rows={3} disabled={isFull} />
                </div>
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-32 bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{language === "th" ? "สรุปการจอง" : "Booking Summary"}</h2>
                <div className="rounded-2xl overflow-hidden mb-5 relative">
                  <img src={localTour.image} alt={localTour.name} className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500" />
                  {isFull && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-white font-bold text-xl tracking-widest bg-red-600 px-4 py-1 rounded-lg">FULL</span></div>}
                </div>
                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500">{language === "th" ? "วันที่เดินทาง:" : "Date:"}</span>
                    <div className="font-bold text-gray-900 text-right">
                      {selectedDate ? (
                        localTour.tripDays && localTour.tripDays > 1
                          ? <>{selectedDate}<br /><span className="text-xs text-[#00A699]">ถึง {new Date(new Date(selectedDate).getTime() + (localTour.tripDays - 1) * 86400000).toISOString().split('T')[0]}</span></>
                          : selectedDate
                      ) : "-"}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{language === "th" ? "จำนวนผู้เดินทาง:" : "Travelers:"}</span>
                    <span className="font-bold text-gray-900">{travelers} ท่าน</span>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                    <span className="text-gray-500 font-medium">{t.totalPrice}</span>
                    <span className="text-2xl font-black text-[#00A699]">฿{selectedDate ? totalPrice.toLocaleString() : 0}</span>
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
              <span className="text-xl md:text-2xl font-black text-[#00A699]">฿{selectedDate ? totalPrice.toLocaleString() : 0}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isFull}
                className={`px-5 py-3 md:py-4 rounded-2xl border-2 font-bold flex items-center gap-2 transition-colors ${
                  isFull ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed' : 'border-teal-50 bg-teal-50 text-[#00A699] hover:bg-teal-100'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="hidden sm:inline">Add to Cart</span>
              </button>
              <button
                onClick={handleContinue}
                disabled={isFull}
                className={`px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold flex items-center gap-2 transition-all ${
                  isFull
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-[#FF6B4A] hover:bg-[#F25A38] text-white shadow-lg shadow-orange-200/50 active:scale-95'
                }`}
              >
                <span>{isFull ? (language === 'th' ? 'ทัวร์เต็มแล้ว' : 'Fully Booked') : t.proceedToPayment}</span>
                {!isFull && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Date Popup */}
        {datePopup.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200 border border-gray-100">
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-sm border-4 bg-[#00A699]/10 border-[#00A699]/20 text-[#00A699]">
                <Clock className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">{language === 'th' ? 'ยืนยันรอบเดินทาง' : 'Confirm Travel Dates'}</h3>
              <p className="text-gray-500 mb-6 text-sm">ทัวร์: {language === 'th' && localTour.name_th ? localTour.name_th : localTour.name}</p>
              <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100 text-left">
                <div className="flex justify-between mb-3 border-b border-gray-200 pb-3">
                  <span className="text-gray-500 font-medium text-sm">{language === 'th' ? 'วันไป:' : 'Start:'}</span>
                  <span className="font-bold text-gray-900">{datePopup.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium text-sm">{language === 'th' ? 'วันกลับ:' : 'End:'}</span>
                  <span className="font-bold text-gray-900">{datePopup.endDate}</span>
                </div>
                {(localTour.tripDays || 1) > 1 && (
                  <div className="mt-3 text-center bg-teal-50 text-[#00A699] py-1.5 rounded-lg text-xs font-bold">
                    รวมระยะเวลา {localTour.tripDays} วัน
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDatePopup({ isOpen: false, startDate: "", endDate: "" })} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-2xl font-bold active:scale-95 transition">
                  {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button onClick={confirmDateSelection} className="flex-1 text-white bg-[#00A699] hover:bg-[#008c81] shadow-lg shadow-[#00A699]/30 py-3.5 rounded-2xl font-bold active:scale-95 transition">
                  {language === 'th' ? 'ตกลงเลือกวันนี้' : 'Confirm Date'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }