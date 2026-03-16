import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Search,
  FileText,
  XCircle,
  Building,
  CreditCard,
  Wallet,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import type { Language } from "../data/translations";
import { translations } from "../data/translations";
import { bookingService } from "../services/api";
import { useScrollLock } from "../hooks/useScrollLock";
interface BookingsPageProps {
  onNavigate: (page: string) => void;
  language: Language;
}

export function MyBookingsPage({
  onNavigate,
  language,
}: BookingsPageProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"all" | "to_pay" | "Pending" | "completed" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  // 🟢 State สำหรับ Popup ยกเลิกการจอง
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'alert', title: '', message: '' });

  const safeLanguage = (language as Language) || "th";
  const t = translations[safeLanguage]?.myBookings || {
    title: "My Bookings",
    id: "ID",
    date: "Date",
    travelers: "Travelers",
    total: "Total",
    noBookings: "No bookings",
    startExploring: "Explore",
    status: "Status"
  };
  useScrollLock(!!selectedBooking || popup.isOpen || !!previewImage);
  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await bookingService.getMyBookings();
        const sortedBookings = (response.data || []).sort(
          (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
        );
        setBookings(sortedBookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, []);

  // 🟢 ฟังก์ชันช่วยเหลือสำหรับ Popup
  const showAlert = (title: string, message: string) => { setPopup({ isOpen: true, type: 'alert', title, message }); };
  const showConfirm = (title: string, message: string, onConfirm: () => void) => { setPopup({ isOpen: true, type: 'confirm', title, message, onConfirm }); };
  const closePopup = () => setPopup(prev => ({ ...prev, isOpen: false }));

  // 🟢 เปลี่ยนจาก alert/confirm เป็น Custom Popup
  const handleCancelBookingClick = (bookingId: string) => {
    showConfirm(
      safeLanguage === "th" ? "ยืนยันการยกเลิก" : "Confirm Cancellation",
      safeLanguage === "th"
        ? "คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
        : "Are you sure you want to cancel this booking? This action cannot be undone.",
      async () => {
        // ปิด confirm popup ก่อน
        closePopup();

        try {
          const reason = safeLanguage === 'th' ? 'ยกเลิกโดยผู้ใช้ (Cancelled by user)' : 'Cancelled by user';

          await Promise.all([
            bookingService.updateBookingStatus(bookingId, 'CANCELLED', reason),
            bookingService.updatePaymentStatus(bookingId, 'FAILED', reason)
          ]);

          // อัปเดต state ใน list ให้แสดง CANCELLED ทันที (ไม่ลบออก)
          setBookings(prevBookings => prevBookings.map(b =>
            b.id === bookingId
              ? { ...b, status: 'CANCELLED', paymentStatus: 'FAILED', rejectReason: reason }
              : b
          ));

          // อัปเดต selectedBooking ด้วยถ้ากำลังเปิด modal อยู่
          if (selectedBooking?.id === bookingId) {
            setSelectedBooking((prev: any) => prev
              ? { ...prev, status: 'CANCELLED', paymentStatus: 'FAILED', rejectReason: reason }
              : null
            );
          }

          // แจ้งเตือนสำเร็จ (ใช้ setTimeout เพื่อให้ popup ก่อนหน้าปิดสนิทก่อน)
          setTimeout(() => {
            showAlert(
              safeLanguage === "th" ? "สำเร็จ" : "Success",
              safeLanguage === "th" ? "ยกเลิกการจองเรียบร้อยแล้ว" : "Booking has been cancelled successfully."
            );
          }, 150);

        } catch (err) {
          console.error("Error cancelling booking:", err);
          setTimeout(() => {
            showAlert(
              safeLanguage === "th" ? "ข้อผิดพลาด" : "Error",
              safeLanguage === "th" ? "ไม่สามารถยกเลิกการจองได้ กรุณาลองใหม่อีกครั้ง" : "Could not cancel booking. Please try again."
            );
          }, 150);
        }
      }
    );
  };

  const getStatusBadge = (booking: any) => {
    const statusLower = booking.status?.toLowerCase() || '';
    const paymentLower = booking.paymentStatus?.toLowerCase() || '';

    const isFullyApproved = statusLower === 'approved' && paymentLower === 'completed';
    const isRejected = statusLower === 'rejected' || paymentLower === 'failed' || statusLower === 'cancelled';
    const isToPay = paymentLower === 'pending' && !isRejected;
    const isProcessing = !isFullyApproved && !isRejected && !isToPay;

    if (isFullyApproved) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
          <CheckCircle className="w-4 h-4" /> {safeLanguage === "th" ? "ที่เสร็จสมบูรณ์" : "Completed"}
        </span>
      );
    }
    if (isRejected) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-semibold bg-red-100 text-red-800 border border-red-200">
          <XCircle className="w-4 h-4" /> {safeLanguage === "th" ? "ยกเลิก/ปฏิเสธ" : "Cancelled"}
        </span>
      );
    }
    if (isToPay) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
          <Wallet className="w-4 h-4" /> {safeLanguage === "th" ? "ที่ต้องชำระ" : "To Pay"}
        </span>
      );
    }
    if (isProcessing) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-semibold bg-teal-50 text-[#00A699] border border-teal-200">
          <Clock className="w-4 h-4" /> {safeLanguage === "th" ? "รอดำเนินการ" : "Pending"}
        </span>
      );
    }

    return null;
  };

  const formatDateSafe = (dateStr: string | Date, options?: Intl.DateTimeFormatOptions) => {
    try {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleDateString(safeLanguage === "en" ? "en-US" : "th-TH", options);
    } catch {
      return "-";
    }
  };

  // 🟢 แก้ไขส่วน filteredBookings (ประมาณบรรทัดที่ 130 เป็นต้นไป)

  const filteredBookings = bookings.filter((booking) => {
    const statusLower = (booking.status || '').toLowerCase();
    const paymentLower = (booking.paymentStatus || '').toLowerCase();

    // ... ส่วนเช็คสถานะเดิม ...
    const isFullyApproved = statusLower === 'approved' && paymentLower === 'completed';
    const isRejected = statusLower === 'rejected' || paymentLower === 'failed' || statusLower === 'cancelled';
    const isToPay = paymentLower === 'pending' && !isRejected;
    const isProcessing = !isFullyApproved && !isRejected && !isToPay;

    let statusMatch = true;
    if (activeTab === "to_pay") statusMatch = isToPay;
    if (activeTab === "Pending") statusMatch = isProcessing;
    if (activeTab === "completed") statusMatch = isFullyApproved;
    if (activeTab === "cancelled") statusMatch = isRejected;

    // 🟢 แก้ไขตรงนี้: ใช้ String() ครอบ ID เพื่อป้องกันแอปพังถ้า ID เป็นตัวเลข
    const bookingId = String(booking.id || "").toLowerCase();
    const tourName = String(booking.tourNameSnapshot || "").toLowerCase();
    const tourNameTh = String(booking.tourNameSnapshot_th || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    const searchMatch =
      bookingId.includes(query) ||
      tourName.includes(query) ||
      tourNameTh.includes(query);

    return statusMatch && searchMatch;
  });

  const countToPay = bookings.filter(b => {
    const s = b.status?.toLowerCase() || '';
    const p = b.paymentStatus?.toLowerCase() || '';
    return p === 'pending' && s !== 'rejected' && s !== 'cancelled';
  }).length;

  const countProcessing = bookings.filter(b => {
    const s = b.status?.toLowerCase() || '';
    const p = b.paymentStatus?.toLowerCase() || '';
    const isFullyApproved = s === 'approved' && p === 'completed';
    const isRejected = s === 'rejected' || p === 'failed' || s === 'cancelled';
    const isToPay = p === 'pending' && !isRejected;
    return !isFullyApproved && !isRejected && !isToPay;
  }).length;

  const countCompleted = bookings.filter(b => b.status?.toLowerCase() === 'approved' && b.paymentStatus?.toLowerCase() === 'completed').length;

  const countCancelled = bookings.filter(b => {
    const s = b.status?.toLowerCase() || '';
    const p = b.paymentStatus?.toLowerCase() || '';
    return s === 'rejected' || p === 'failed' || s === 'cancelled';
  }).length;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-[#00A699]">กำลังโหลดข้อมูลการจอง...</div>;
  }


  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{safeLanguage === "th" ? "กลับไปหน้าแดชบอร์ด" : "Back to Dashboard"}</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600">
            {safeLanguage === "th"
              ? "ดูและจัดการรายการจองทัวร์ทั้งหมดของคุณ"
              : "View and manage all your tour bookings"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={safeLanguage === "th" ? "ค้นหาทัวร์, หรือรหัสการจอง..." : "Search by tour name, or booking ID..."}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A699] focus:border-transparent transition"
              />
            </div>
          </div>
        </div>

        {/* แถบ Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-2.5 rounded-xl font-medium whitespace-nowrap transition ${activeTab === "all" ? "bg-gray-400 text-white shadow-md" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"}`}
          >
            {safeLanguage === "th" ? "ทั้งหมด" : "All"} ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("to_pay")}
            className={`px-6 py-2.5 rounded-xl font-medium whitespace-nowrap transition ${activeTab === "to_pay" ? "bg-yellow-500 text-white shadow-md" : "bg-white hover:bg-yellow-50 text-gray-700 border border-gray-200"}`}
          >
            {safeLanguage === "th" ? "ที่ต้องชำระ" : "To Pay"} {countToPay > 0 && `(${countToPay})`}
          </button>
          <button
            onClick={() => setActiveTab("Pending")}
            className={`px-6 py-2.5 rounded-xl font-medium whitespace-nowrap transition ${activeTab === "Pending" ? "bg-[#00A699] text-white shadow-md" : "bg-white hover:bg-teal-50 text-gray-700 border border-gray-200"}`}
          >
            {safeLanguage === "th" ? "รอดำเนินการ" : "Pending"} {countProcessing > 0 && `(${countProcessing})`}
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-2.5 rounded-xl font-medium whitespace-nowrap transition ${activeTab === "completed" ? "bg-green-600 text-white shadow-md" : "bg-white hover:bg-green-50 text-gray-700 border border-gray-200"}`}
          >
            {safeLanguage === "th" ? "ที่เสร็จสมบูรณ์" : "Completed"} {countCompleted > 0 && `(${countCompleted})`}
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-6 py-2.5 rounded-xl font-medium whitespace-nowrap transition ${activeTab === "cancelled" ? "bg-red-500 text-white shadow-md" : "bg-white hover:bg-red-50 text-gray-700 border border-gray-200"}`}
          >
            {safeLanguage === "th" ? "ยกเลิกแล้ว" : "Cancelled"} {countCancelled > 0 && `(${countCancelled})`}
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const statusLower = booking.status?.toLowerCase() || '';
            const paymentLower = booking.paymentStatus?.toLowerCase() || '';

            const isFullyApproved = statusLower === 'approved' && paymentLower === 'completed';
            const isRejected = statusLower === 'rejected' || paymentLower === 'failed' || statusLower === 'cancelled';
            const isToPay = paymentLower === 'pending' && !isRejected;
            const isProcessing = !isFullyApproved && !isRejected && !isToPay;

            let borderColor = "border-[#005a87]/20";
            if (isRejected) borderColor = "border-red-400";
            if (isFullyApproved) borderColor = "border-green-400";
            if (isToPay) borderColor = "border-yellow-400";

            return (
              <div key={booking.id} className={`bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition border-t-4 ${borderColor}`}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {safeLanguage === "th" && booking.tourNameSnapshot_th
                            ? booking.tourNameSnapshot_th
                            : booking.tourNameSnapshot || "Tour Package"}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {booking.tour?.province?.name_th ||
                              booking.tour?.province?.name ||
                              (safeLanguage === "th" ? "ประเทศไทย" : "Thailand")}
                          </span>
                        </div>
                      </div>
                      {/* ป้ายสถานะ */}
                      {getStatusBadge(booking)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">{t.id}</div>
                        <div className="font-medium text-gray-900 text-sm">{booking.id}</div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {t.date}
                        </div>
                        <div className="font-medium text-gray-900">
                          {formatDateSafe(booking.travelDate, { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {t.travelers}
                        </div>
                        <div className="font-medium text-gray-900">
                          {booking.travelers || 0} {safeLanguage === "th" ? "ท่าน" : "person(s)"}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-600 mb-1">{t.total}</div>
                        <div className="text-xl font-bold text-[#00A699]">
                          ฿{(booking.totalPrice || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Booking Date */}
                    <div className="text-sm text-gray-500">
                      {safeLanguage === "th" ? "จองเมื่อ" : "Booked on"}{" "}
                      {formatDateSafe(booking.bookingDate, { month: "long", day: "numeric", year: "numeric" })}
                    </div>
                  </div>

                  {/* Actions Button */}
                  <div className="flex lg:flex-col gap-3">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="flex-1 lg:w-44 bg-[#00A699] hover:bg-[#008c81] text-white px-4 py-3 rounded-xl font-semibold transition text-sm"
                    >
                      {safeLanguage === "th" ? "ดูรายละเอียด" : "View Details"}
                    </button>

                    {/* ปุ่มยกเลิกการจอง แสดงเฉพาะตอน รอดำเนินการ หรือ รอชำระเงิน */}
                    {(isToPay || isProcessing) && (
                      <button
                        onClick={() => handleCancelBookingClick(booking.id)}
                        className="flex-1 lg:w-44 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 border hover:border-red-200 px-4 py-3 rounded-xl font-semibold transition text-sm flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        {safeLanguage === "th" ? "ยกเลิกการจอง" : "Cancel Booking"}
                      </button>
                    )}

                    {/* ปุ่มดาวน์โหลดตั๋ว จะขึ้นก็ต่อเมื่อเสร็จสมบูรณ์ */}
                    {isFullyApproved && (
                      <button className="flex-1 lg:w-44 bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl font-semibold transition border border-gray-200 text-sm flex items-center justify-center gap-2 shadow-sm">
                        <FileText className="w-4 h-4" />
                        {safeLanguage === "th" ? "ดาวน์โหลดตั๋ว" : "Download Ticket"}
                      </button>
                    )}
                  </div>
                </div>

                {/* 🟢 Status Messages Box */}
                {isRejected && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">❌</span>
                      <div>
                        <div className="font-semibold text-red-900 mb-1">
                          {safeLanguage === "th" ? "การจองถูกยกเลิก/ปฏิเสธ" : "Booking Cancelled/Rejected"}
                        </div>
                        <p className="text-sm text-red-800 bg-white p-3 rounded-lg border border-red-100 mt-2">
                          <span className="font-bold">{safeLanguage === "th" ? "เหตุผล: " : "Reason: "}</span>
                          {booking.rejectReason || (safeLanguage === "th" ? "ไม่ระบุเหตุผล" : "No reason provided")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isToPay && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💳</span>
                      <div>
                        <div className="font-semibold text-yellow-900 mb-1">
                          {safeLanguage === "th" ? "รอการชำระเงิน" : "Awaiting Payment"}
                        </div>
                        <p className="text-sm text-yellow-800">
                          {safeLanguage === "th"
                            ? "คุณยังไม่ได้แนบหลักฐานการโอนเงิน หรือ หลักฐานเดิมมีปัญหา กรุณาติดต่อแอดมินหรือทำการจองใหม่หากต้องการ"
                            : "Payment slip is required. Please upload your payment slip or contact admin."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⏳</span>
                      <div>
                        <div className="font-semibold text-teal-900 mb-1">
                          {safeLanguage === "th" ? "รอดำเนินการจากแอดมิน" : "Pending"}
                        </div>
                        <p className="text-sm text-teal-800">
                          {safeLanguage === "th"
                            ? "ได้รับข้อมูลแล้ว! กำลังอยู่ระหว่างการตรวจสอบความถูกต้องของที่นั่งและยอดเงิน กรุณารอสักครู่ครับ"
                            : "We received your data! Our admin is verifying the seats and payment."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 && !loading && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg mt-6">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              {bookings.length === 0 ? t.noBookings : (safeLanguage === "th" ? "ไม่พบรายการจากการค้นหา" : "No bookings match your search")}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {bookings.length === 0
                ? (safeLanguage === "th" ? "เริ่มการผจญภัยในประเทศไทยของคุณโดยการค้นหาทัวร์และประสบการณ์ที่น่าตื่นเต้น" : "Start your Thailand adventure by browsing our amazing tours and experiences")
                : (safeLanguage === "th" ? "ลองเปลี่ยนคำค้นหาหรือเลือกแท็บสถานะอื่นดูนะครับ" : "Try changing your search terms or selecting a different status tab.")
              }
            </p>
            {bookings.length === 0 && (
              <button
                onClick={() => onNavigate("home")}
                className="bg-[#00A699] hover:bg-[#008c81] text-white px-8 py-4 rounded-2xl font-semibold transition inline-flex items-center gap-2"
              >
                {t.startExploring}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 🟢 MODAL ดูรายละเอียดการจอง (Booking Details Modal) */}
      {/* ======================================================== */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {safeLanguage === "th" ? "รายละเอียดการจอง" : "Booking Details"}
                </h2>
                <div className="text-sm text-gray-500 mt-1">
                  {safeLanguage === "th" ? "รหัสอ้างอิง:" : "Ref ID:"} {selectedBooking.id}
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {/* สถานะรวม */}
              <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="font-semibold text-gray-700">
                  {safeLanguage === "th" ? "สถานะการจองรวม" : "Overall Status"}
                </span>
                {getStatusBadge(selectedBooking)}
              </div>

              {/* แสดงสถานะย่อยให้ผู้ใช้เห็นว่าติดตรงไหน */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border border-gray-200 p-3 rounded-xl text-center bg-white shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">{safeLanguage === "th" ? "สถานะที่นั่ง (Booking)" : "Booking Status"}</div>
                  <div className={`font-bold ${selectedBooking.status?.toLowerCase() === 'approved' ? 'text-green-600' : selectedBooking.status?.toLowerCase() === 'rejected' ? 'text-red-500' : selectedBooking.status?.toLowerCase() === 'cancelled' ? 'text-gray-500' : 'text-blue-500'}`}>
                    {selectedBooking.status?.toUpperCase()}
                  </div>
                </div>
                <div className="border border-gray-200 p-3 rounded-xl text-center bg-white shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">{safeLanguage === "th" ? "สถานะชำระเงิน (Payment)" : "Payment Status"}</div>
                  <div className={`font-bold ${selectedBooking.paymentStatus?.toLowerCase() === 'completed' ? 'text-green-600' : selectedBooking.paymentStatus?.toLowerCase() === 'failed' ? 'text-red-500' : selectedBooking.paymentStatus?.toLowerCase() === 'verifying' ? 'text-blue-500' : 'text-orange-500'}`}>
                    {selectedBooking.paymentStatus?.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* หากโดนปฏิเสธ ให้โชว์กล่องเหตุผลใน Modal */}
              {(selectedBooking.status?.toLowerCase() === 'rejected' || selectedBooking.paymentStatus?.toLowerCase() === 'failed' || selectedBooking.status?.toLowerCase() === 'cancelled') && (
                <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-2xl">
                  <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    {safeLanguage === "th" ? "รายละเอียดการยกเลิก" : "Cancellation Details"}
                  </h3>
                  <p className="text-sm text-red-800 bg-white p-3 rounded-lg border border-red-100">
                    {selectedBooking.rejectReason || (safeLanguage === "th" ? "ไม่ระบุเหตุผล" : "No reason provided")}
                  </p>
                </div>
              )}

              {/* ข้อมูลแพ็กเกจ */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#00A699]" />
                  {safeLanguage === "th" ? "ข้อมูลแพ็กเกจ" : "Package Info"}
                </h3>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">{safeLanguage === "th" ? "ชื่อทัวร์" : "Tour Name"}</div>
                    <div className="font-medium text-gray-900">
                      {safeLanguage === "th" && selectedBooking.tourNameSnapshot_th
                        ? selectedBooking.tourNameSnapshot_th
                        : selectedBooking.tourNameSnapshot}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{safeLanguage === "th" ? "สถานที่" : "Location"}</div>
                    <div className="font-medium text-gray-900">
                      {selectedBooking.tour?.name || selectedBooking.tourNameSnapshot?.province?.name || (safeLanguage === "th" ? "ประเทศไทย" : "Thailand")}
                    </div>
                  </div>
                </div>
              </div>

              {/* ข้อมูลการเดินทาง */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#00A699]" />
                  {safeLanguage === "th" ? "ข้อมูลการเดินทาง" : "Travel Info"}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-2xl p-4">
                    <div className="text-sm text-gray-500 mb-1">{safeLanguage === "th" ? "วันที่เดินทาง" : "Travel Date"}</div>
                    <div className="font-semibold text-gray-900">
                      {formatDateSafe(selectedBooking.travelDate, { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-4">
                    <div className="text-sm text-gray-500 mb-1">{safeLanguage === "th" ? "จำนวนผู้เดินทาง" : "Travelers"}</div>
                    <div className="font-semibold text-gray-900">
                      {selectedBooking.travelers} {safeLanguage === "th" ? "ท่าน" : "Pax"}
                    </div>
                  </div>
                </div>
              </div>

              {/* ข้อมูลผู้ติดต่อ (ข้อมูลที่กรอกตอนจอง) */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#00A699]" />
                  {safeLanguage === "th" ? "ข้อมูลผู้ติดต่อ" : "Contact Information"}
                </h3>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">{safeLanguage === "th" ? "ชื่อ-นามสกุล" : "Full Name"}</div>
                      <div className="font-medium text-gray-900">
                        {/* ดึงชื่อที่กรอก หรือถ้าไม่มีให้ดึงจาก User แทน */}
                        {selectedBooking.contactName || selectedBooking.user?.fullName || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">{safeLanguage === "th" ? "เบอร์โทรศัพท์" : "Phone Number"}</div>
                      <div className="font-medium text-gray-900">
                        {selectedBooking.phone || "-"}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-500 mb-1">{safeLanguage === "th" ? "อีเมล" : "Email"}</div>
                      <div className="font-medium text-gray-900">
                        {selectedBooking.email || selectedBooking.user?.email || "-"}
                      </div>
                    </div>
                  </div>

                  {/* แสดงคำขอพิเศษ (ถ้ามีผู้ใช้กรอกมา) */}
                  {(selectedBooking.specialRequest || selectedBooking.specialRequests) && (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-500 mb-2">{safeLanguage === "th" ? "คำขอพิเศษ" : "Special Requests"}</div>
                      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        {selectedBooking.specialRequest || selectedBooking.specialRequests}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ยอดชำระเงิน */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#00A699]" />
                  {safeLanguage === "th" ? "ข้อมูลการชำระเงิน" : "Payment Info"}
                </h3>
                <div className="bg-[#00A699]/5 border border-[#00A699]/20 rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-2 text-gray-600">
                    <span>{safeLanguage === "th" ? "ยอดรวม" : "Subtotal"}</span>
                    <span>฿{(selectedBooking.totalPrice || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-[#00A699]/20 mt-3">
                    <span className="font-bold text-gray-900">{safeLanguage === "th" ? "ยอดชำระสุทธิ" : "Net Total"}</span>
                    <span className="text-xl font-bold text-[#00A699]">฿{(selectedBooking.totalPrice || 0).toLocaleString()}</span>
                  </div>

                  {/* แสดงรูปสลิปให้ผู้ใช้ดู */}
                  {selectedBooking.paymentSlip && (
                    <div className="mt-6 pt-5 border-t border-[#00A699]/20">
                      <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
                        <span>{safeLanguage === "th" ? "หลักฐานการชำระเงิน" : "Payment Slip"}</span>
                        <button
                          onClick={() => setPreviewImage(selectedBooking.paymentSlip)}
                          className="text-xs text-[#00A699] hover:underline"
                        >
                          {safeLanguage === "th" ? "ขยายรูปภาพ" : "Enlarge Image"}
                        </button>
                      </div>
                      <div
                        className="rounded-xl overflow-hidden border border-gray-200 bg-white cursor-pointer hover:border-[#00A699] transition-colors group relative"
                        onClick={() => setPreviewImage(selectedBooking.paymentSlip)}
                      >
                        <img src={selectedBooking.paymentSlip} alt="Payment Slip" className="w-full h-auto max-h-48 object-contain bg-gray-50" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                          <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                            {safeLanguage === "th" ? "คลิกเพื่อขยาย" : "Click to enlarge"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-semibold transition-colors"
              >
                {safeLanguage === "th" ? "ปิด" : "Close"}
              </button>

              {/* ปุ่มยกเลิกใน Modal */}
              {!(selectedBooking.status?.toLowerCase() === 'approved' && selectedBooking.paymentStatus?.toLowerCase() === 'completed') &&
                !(selectedBooking.status?.toLowerCase() === 'rejected' || selectedBooking.paymentStatus?.toLowerCase() === 'failed' || selectedBooking.status?.toLowerCase() === 'cancelled') && (
                  <button
                    onClick={() => handleCancelBookingClick(selectedBooking.id)}
                    className="flex-1 bg-white border border-red-200 text-red-500 hover:bg-red-50 py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    {safeLanguage === "th" ? "ยกเลิกการจอง" : "Cancel Booking"}
                  </button>
                )}

              {selectedBooking.status?.toLowerCase() === "approved" && selectedBooking.paymentStatus?.toLowerCase() === "completed" && (
                <button className="flex-1 bg-[#00A699] hover:bg-[#008c81] text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg">
                  <FileText className="w-5 h-5" />
                  {safeLanguage === "th" ? "ดาวน์โหลดตั๋ว" : "Download Ticket"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🟢 Custom Popup Modal (Alert / Confirm) แทน Alert เดิม */}
      {/* ======================================================== */}
      {popup.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-sm border-4 ${popup.type === 'confirm' || popup.title === 'ข้อผิดพลาด' ? 'bg-red-50 border-red-100 text-red-500' : 'bg-[#00A699]/10 border-[#00A699]/20 text-[#00A699]'}`}>
              {popup.type === 'confirm' || popup.title === 'ข้อผิดพลาด' ? <AlertCircle className="w-10 h-10" /> : <CheckCircle className="w-10 h-10" />}
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">{popup.title}</h3>
            <p className="text-gray-500 mb-8 leading-relaxed text-sm">{popup.message}</p>
            <div className="flex gap-3">
              {popup.type === 'confirm' && (
                <button onClick={closePopup} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-2xl font-bold active:scale-95 transition">
                  {safeLanguage === 'th' ? 'ไม่ยกเลิก' : 'Cancel'}
                </button>
              )}
              <button
                onClick={() => {
                  if (popup.type === 'confirm' && popup.onConfirm) {
                    popup.onConfirm();
                  } else {
                    closePopup();
                  }
                }}
                className={`flex-1 text-white py-3.5 rounded-2xl font-bold active:scale-95 transition shadow-lg ${popup.type === 'confirm' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-[#00A699] hover:bg-[#008c81] shadow-[#00A699]/30'}`}
              >
                {popup.type === 'confirm' ? (safeLanguage === 'th' ? 'ยืนยันยกเลิก' : 'Confirm') : (safeLanguage === 'th' ? 'ตกลง' : 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 ป๊อปอัปขยายรูปภาพ (Image Preview Modal) */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full"
            onClick={() => setPreviewImage(null)}
          >
            <XCircle className="w-8 h-8" />
          </button>

          <div className="relative max-w-5xl w-full h-full flex items-center justify-center animate-in zoom-in-95 duration-200">
            <img
              src={previewImage}
              alt="Enlarged Preview"
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              onClick={(e) => e.stopPropagation()} // ป้องกันการกดที่รูปแล้วปิด
            />
          </div>
        </div>
      )}

    </div>
  );
}