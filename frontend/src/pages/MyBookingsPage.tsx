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
        const token = localStorage.getItem('access_token');
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

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || 'pending';
    
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };

    const labels = {
      pending: safeLanguage === "th" ? "รอการตรวจสอบ" : "Pending",
      approved: safeLanguage === "th" ? "อนุมัติแล้ว" : "Approved",
      rejected: safeLanguage === "th" ? "ถูกปฏิเสธ" : "Rejected",
    };

    const icons = {
      pending: "⏳",
      approved: "✓",
      rejected: "✗",
    };

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-semibold border ${styles[normalizedStatus as keyof typeof styles] || styles.pending}`}>
        <span>{icons[normalizedStatus as keyof typeof icons] || "•"}</span>
        {labels[normalizedStatus as keyof typeof labels] || status}
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
    const statusMatch = activeTab === "all" || (booking.status?.toLowerCase() === activeTab);
    
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
    <div className="min-h-screen bg-gray-50">
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
            {safeLanguage === "th" ? "รอตรวจสอบ" : "Pending"} ({bookings.filter((b) => b.status?.toLowerCase() === "pending").length})
          </button>
          <button 
            onClick={() => setActiveTab("approved")}
            className={`px-6 py-2 rounded-xl font-medium whitespace-nowrap transition ${activeTab === "approved" ? "bg-[#00A699] text-white" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"}`}
          >
            {safeLanguage === "th" ? "อนุมัติแล้ว" : "Approved"} ({bookings.filter((b) => b.status?.toLowerCase() === "approved").length})
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                
                {/* Booking Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      {/* ใช้ค่าจาก Database ชัวร์ 100% */}
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {safeLanguage === "th" && booking.tourNameSnapshot_th 
                          ? booking.tourNameSnapshot_th 
                          : booking.tourNameSnapshot || "Tour Package"}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.tour?.name || booking.tourNameSnapshot.province?.name || (safeLanguage === "th" ? "ประเทศไทย" : "Thailand")}</span>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
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
                        {/* 🟢 ใช้ travelDate จาก Database */}
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
                  <button className="flex-1 lg:w-44 bg-[#00A699] hover:bg-[#008c81] text-white px-4 py-3 rounded-xl font-semibold transition text-sm">
                    {safeLanguage === "th" ? "ดูรายละเอียด" : "View Details"}
                  </button>

                  {booking.status?.toLowerCase() === "pending" && (
                    <button className="flex-1 lg:w-44 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold transition text-sm flex items-center justify-center gap-2">
                      <XCircle className="w-4 h-4" />
                      {safeLanguage === "th" ? "ยกเลิกการจอง" : "Cancel Booking"}
                    </button>
                  )}

                  {booking.status?.toLowerCase() === "approved" && (
                    <button className="flex-1 lg:w-44 bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl font-semibold transition border border-gray-200 text-sm flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" />
                      {safeLanguage === "th" ? "ดาวน์โหลดใบเสร็จ" : "Download Receipt"}
                    </button>
                  )}
                </div>
              </div>

              {/* Status Messages Box */}
              {booking.status?.toLowerCase() === "pending" && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⏳</span>
                    <div>
                      <div className="font-semibold text-yellow-900 mb-1">
                        {safeLanguage === "th" ? "กำลังตรวจสอบการชำระเงิน" : "Payment Under Verification"}
                      </div>
                      <p className="text-sm text-yellow-800">
                        {safeLanguage === "th"
                          ? "ทีมงานกำลังตรวจสอบหลักฐานการโอนเงินของคุณ โดยปกติจะใช้เวลาประมาณ 2-4 ชั่วโมง"
                          : "Our admin team is reviewing your payment. You'll receive a confirmation email once approved (usually within 2-4 hours)."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {booking.status?.toLowerCase() === "approved" && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <div className="font-semibold text-green-900 mb-1">
                        {safeLanguage === "th" ? "การจองยืนยันแล้ว" : "Booking Confirmed"}
                      </div>
                      <p className="text-sm text-green-800">
                        {safeLanguage === "th"
                          ? "การจองของคุณได้รับการยืนยันแล้ว! กรุณาตรวจสอบอีเมลเพื่อรับเวาเชอร์และรายละเอียดจุดนัดพบ"
                          : "Your booking has been confirmed! Check your email for the tour voucher and meeting point details."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
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
    </div>
  );
}