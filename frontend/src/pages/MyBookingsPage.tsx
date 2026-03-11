import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Filter,
  Search,
  FileText,
  XCircle,
  Building,
  CreditCard
} from "lucide-react";
import type { Language } from "../data/translations";
import { translations } from "../data/translations";
import { bookingService } from "../services/api";

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

  // 🟢 State สำหรับ Tabs และค้นหา
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // 🟢 State สำหรับ Modal ดูรายละเอียด
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

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

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await bookingService.getMyBookings();
        // จัดเรียงให้รายการล่าสุดขึ้นก่อน
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

  // 🟢 ฟังก์ชัน Badge ตรวจสอบทั้ง 2 เงื่อนไข
  const getStatusBadge = (booking: any) => {
    const isBookingApproved = booking.status?.toLowerCase() === 'approved';
    const isPaymentCompleted = booking.paymentStatus?.toLowerCase() === 'completed';
    const isPaymentVerifying = booking.paymentStatus?.toLowerCase() === 'verifying';

    // 1. ถ้าผ่านทั้งคู่ = จองสมบูรณ์
    if (isBookingApproved && isPaymentCompleted) {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-semibold border bg-green-100 text-green-800 border-green-200">
          <span>✓</span> {safeLanguage === "th" ? "จองสมบูรณ์" : "Confirmed"}
        </span>
      );
    }
    // 2. ถ้าถูกปฏิเสธอย่างใดอย่างหนึ่ง
    if (booking.status?.toLowerCase() === 'rejected' || booking.paymentStatus?.toLowerCase() === 'failed') {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-semibold border bg-red-100 text-red-800 border-red-200">
          <span>✗</span> {safeLanguage === "th" ? "มีปัญหา/ยกเลิก" : "Issue/Cancelled"}
        </span>
      );
    }
    // 3. ถ้าได้ที่นั่งแล้ว แต่รอตรวจสลิป
    if (isBookingApproved && isPaymentVerifying) {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-semibold border bg-blue-100 text-blue-800 border-blue-200">
          <span>⏳</span> {safeLanguage === "th" ? "รอตรวจสลิป" : "Checking Payment"}
        </span>
      );
    }
    // 4. ถ้าตรวจสลิปผ่านแล้ว แต่รออนุมัติที่นั่ง
    if (!isBookingApproved && isPaymentCompleted) {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-semibold border bg-orange-100 text-orange-800 border-orange-200">
          <span>⏳</span> {safeLanguage === "th" ? "รออนุมัติที่นั่ง" : "Waiting Seat"}
        </span>
      );
    }

    // ค่าเริ่มต้น
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-semibold border bg-yellow-100 text-yellow-800 border-yellow-200">
        <span>⏳</span> {safeLanguage === "th" ? "รอดำเนินการ" : "Pending"}
      </span>
    );
  };

  // ฟังก์ชันป้องกันวันที่พัง
  const formatDateSafe = (dateStr: string | Date, options?: Intl.DateTimeFormatOptions) => {
    try {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleDateString(safeLanguage === "en" ? "en-US" : "th-TH", options);
    } catch {
      return "-";
    }
  };

  // 🟢 กรองข้อมูลตาม Tab และ Search
  const filteredBookings = bookings.filter((booking) => {
    const isFullyApproved = booking.status?.toLowerCase() === 'approved' && booking.paymentStatus?.toLowerCase() === 'completed';
    const isRejected = booking.status?.toLowerCase() === 'rejected' || booking.paymentStatus?.toLowerCase() === 'failed';
    const isPending = !isFullyApproved && !isRejected;

    let statusMatch = true;
    if (activeTab === "approved") statusMatch = isFullyApproved;
    if (activeTab === "pending") statusMatch = isPending; // ไม่นับรายการที่โดนปฏิเสธ

    const tourName = booking.tourNameSnapshot || "";
    const tourNameTh = booking.tourNameSnapshot_th || "";
    const searchMatch =
      booking.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tourName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tourNameTh.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && searchMatch;
  });

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
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition whitespace-nowrap">
              <Filter className="w-5 h-5" />
              <span>{safeLanguage === "th" ? "ตัวกรอง" : "Filters"}</span>
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-2 rounded-xl font-medium whitespace-nowrap transition ${activeTab === "all" ? "bg-[#00A699] text-white" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"}`}
          >
            {safeLanguage === "th" ? "ทั้งหมด" : "All"} ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-2 rounded-xl font-medium whitespace-nowrap transition ${activeTab === "pending" ? "bg-[#00A699] text-white" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"}`}
          >
            {safeLanguage === "th" ? "รอดำเนินการ" : "Pending"} ({bookings.filter(b => !(b.status?.toLowerCase() === 'approved' && b.paymentStatus?.toLowerCase() === 'completed') && !(b.status?.toLowerCase() === 'rejected' || b.paymentStatus?.toLowerCase() === 'failed')).length})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-6 py-2 rounded-xl font-medium whitespace-nowrap transition ${activeTab === "approved" ? "bg-[#00A699] text-white" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"}`}
          >
            {safeLanguage === "th" ? "จองสำเร็จ" : "Completed"} ({bookings.filter(b => b.status?.toLowerCase() === 'approved' && b.paymentStatus?.toLowerCase() === 'completed').length})
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            // คำนวณสถานะของแต่ละรายการ
            const isFullyApproved = booking.status?.toLowerCase() === 'approved' && booking.paymentStatus?.toLowerCase() === 'completed';
            const isRejected = booking.status?.toLowerCase() === 'rejected' || booking.paymentStatus?.toLowerCase() === 'failed';
            const isPending = !isFullyApproved && !isRejected;

            return (
              <div key={booking.id} className={`bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition border-t-4 ${isRejected ? 'border-red-400' : isFullyApproved ? 'border-green-400' : 'border-yellow-400'}`}>
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
                          <span>{booking.tour?.name || booking.tourNameSnapshot?.province?.name || (safeLanguage === "th" ? "ประเทศไทย" : "Thailand")}</span>
                        </div>
                      </div>
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

                    {/* ซ่อนปุ่มยกเลิกถ้ารายการถูกปฏิเสธ หรือ สำเร็จไปแล้ว */}
                    {isPending && (
                      <button className="flex-1 lg:w-44 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold transition text-sm flex items-center justify-center gap-2">
                        <XCircle className="w-4 h-4" />
                        {safeLanguage === "th" ? "ยกเลิกการจอง" : "Cancel Booking"}
                      </button>
                    )}

                    {isFullyApproved && (
                      <button className="flex-1 lg:w-44 bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl font-semibold transition border border-gray-200 text-sm flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4" />
                        {safeLanguage === "th" ? "ดาวน์โหลดตั๋ว" : "Download Ticket"}
                      </button>
                    )}
                  </div>
                </div>

                {/* 🟢 Status Messages Box */}
                {isRejected ? (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">❌</span>
                      <div>
                        <div className="font-semibold text-red-900 mb-1">
                          {safeLanguage === "th" ? "การจอง/การชำระเงิน ถูกปฏิเสธและยกเลิกแล้ว" : "Booking/Payment Rejected"}
                        </div>
                        <p className="text-sm text-red-800 bg-white p-3 rounded-lg border border-red-100 mt-2">
                          <span className="font-bold">{safeLanguage === "th" ? "เหตุผลจากแอดมิน: " : "Reason: "}</span> 
                          {booking.rejectReason || (safeLanguage === "th" ? "ไม่ระบุเหตุผล กรุณาติดต่อแอดมิน" : "No reason provided")}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : isPending ? (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⏳</span>
                      <div>
                        <div className="font-semibold text-yellow-900 mb-1">
                          {safeLanguage === "th" ? "รอดำเนินการจากระบบ" : "Processing"}
                        </div>
                        <p className="text-sm text-yellow-800">
                          {safeLanguage === "th"
                            ? "การจองของคุณกำลังอยู่ระหว่างดำเนินการ (กำลังตรวจสอบที่นั่งว่าง หรือ ตรวจสอบสลิปเงิน) แอดมินจะทำการตรวจสอบโดยเร็วที่สุด"
                            : "Your booking is currently processing. Please wait while our admin team verifies your details."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">✓</span>
                      <div>
                        <div className="font-semibold text-green-900 mb-1">
                          {safeLanguage === "th" ? "การจองเสร็จสมบูรณ์" : "Booking Complete"}
                        </div>
                        <p className="text-sm text-green-800">
                          {safeLanguage === "th"
                            ? "คุณสามารถกดปุ่ม 'ดาวน์โหลดตั๋ว' เพื่อใช้เป็นหลักฐานในวันเดินทางได้เลย ขอให้สนุกกับทริปนี้นะครับ!"
                            : "Your booking is 100% complete! You can download your ticket now. Have a great trip!"}
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
                className="bg-[#FF6B4A] hover:bg-[#ff5232] text-white px-8 py-4 rounded-2xl font-semibold transition inline-flex items-center gap-2"
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
              <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-2xl">
                <span className="font-semibold text-gray-700">
                  {safeLanguage === "th" ? "สถานะรวมทั้งหมด" : "Overall Status"}
                </span>
                {getStatusBadge(selectedBooking)}
              </div>

              {/* 🟢 หากโดนปฏิเสธ ให้โชว์กล่องเหตุผลใน Modal ด้วย */}
              {(selectedBooking.status?.toLowerCase() === 'rejected' || selectedBooking.paymentStatus?.toLowerCase() === 'failed') && (
                <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-2xl">
                  <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    {safeLanguage === "th" ? "สาเหตุที่ถูกยกเลิก/ปฏิเสธ" : "Reason for Rejection"}
                  </h3>
                  <p className="text-sm text-red-800 bg-white p-3 rounded-lg border border-red-100">
                    {selectedBooking.rejectReason || (safeLanguage === "th" ? "ไม่ระบุเหตุผล กรุณาติดต่อแอดมิน" : "No reason provided")}
                  </p>
                </div>
              )}

              {/* แสดงสถานะย่อยให้ผู้ใช้เห็นว่าติดตรงไหน */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border border-gray-200 p-3 rounded-xl text-center">
                  <div className="text-xs text-gray-500 mb-1">{safeLanguage === "th" ? "สถานะที่นั่ง (Booking)" : "Booking Status"}</div>
                  <div className={`font-bold ${selectedBooking.status?.toLowerCase() === 'approved' ? 'text-green-600' : selectedBooking.status?.toLowerCase() === 'rejected' ? 'text-red-500' : 'text-orange-500'}`}>
                    {selectedBooking.status?.toUpperCase()}
                  </div>
                </div>
                <div className="border border-gray-200 p-3 rounded-xl text-center">
                  <div className="text-xs text-gray-500 mb-1">{safeLanguage === "th" ? "สถานะชำระเงิน (Payment)" : "Payment Status"}</div>
                  <div className={`font-bold ${selectedBooking.paymentStatus?.toLowerCase() === 'completed' ? 'text-green-600' : selectedBooking.paymentStatus?.toLowerCase() === 'failed' ? 'text-red-500' : 'text-blue-500'}`}>
                    {selectedBooking.paymentStatus?.toUpperCase()}
                  </div>
                </div>
              </div>

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
                        <button onClick={() => window.open(selectedBooking.paymentSlip, '_blank')} className="text-xs text-[#00A699] hover:underline">
                          {safeLanguage === "th" ? "ดูรูปเต็ม" : "View Full"}
                        </button>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-gray-200 bg-white cursor-pointer" onClick={() => window.open(selectedBooking.paymentSlip, '_blank')}>
                        <img src={selectedBooking.paymentSlip} alt="Payment Slip" className="w-full h-auto max-h-48 object-contain bg-gray-50" />
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
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
              >
                {safeLanguage === "th" ? "ปิด" : "Close"}
              </button>
              {selectedBooking.status?.toLowerCase() === "approved" && selectedBooking.paymentStatus?.toLowerCase() === "completed" && (
                <button className="flex-1 bg-[#00A699] hover:bg-[#008c81] text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  {safeLanguage === "th" ? "ดาวน์โหลดตั๋วเดินทาง" : "Download Ticket"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}