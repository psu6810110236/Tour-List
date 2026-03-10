import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, MapPin, Users, CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";
import { bookingService } from "../../../services/api";
import { useAuth } from "../../auth/context/AuthContext";
import type { Language } from "../../../data/translations";

interface Booking {
  id: string;
  bookingDate: string;
  travelDate: string;
  travelers: number;
  totalPrice: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  paymentSlip?: string;
  tourNameSnapshot: string;
  tourNameSnapshot_th?: string;
  tour?: {
    id: string;
    name: string;
    name_th: string;
    image: string;
  };
}

interface BookingsHistoryProps {
  language: Language;
  onNavigate: (page: string, data?: any) => void;
}

export function BookingsHistory({ language, onNavigate }: BookingsHistoryProps) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const translations = {
  th: {
    title: 'ประวัติการจอง',
    noBookings: 'ไม่มีประวัติการจอง',
    loading: 'กำลังโหลด...',
    bookingId: 'รหัสการจอง',
    tourName: 'ชื่อทัวร์',
    travelDate: 'วันที่เดินทาง',
    travelers: 'จำนวนผู้เดินทาง',
    totalPrice: 'ราคารวม',
    status: 'สถานะ',
    paymentStatus: 'สถานะการชำระเงิน',
    pending: 'รอดำเนินการ',
    approved: 'อนุมัติแล้ว',
    rejected: 'ปฏิเสธ',
    cancelled: 'ยกเลิก',
    completed: 'ชำระเงินแล้ว',
    failed: 'ชำระเงินล้มเหลว',
    back: 'กลับ',
    viewDetails: 'ดูรายละเอียด'
  },
  en: {
    title: 'Booking History',
    noBookings: 'No bookings found',
    loading: 'Loading...',
    bookingId: 'Booking ID',
    tourName: 'Tour Name',
    travelDate: 'Travel Date',
    travelers: 'Travelers',
    totalPrice: 'Total Price',
    status: 'Status',
    paymentStatus: 'Payment Status',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    completed: 'Completed',
    failed: 'Failed',
    back: 'Back',
    viewDetails: 'View Details'
  }
};

const t = translations[language];

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getAllBookings();
      // Filter bookings for current user (if user is logged in)
      const userBookings = user 
        ? response.data.filter((booking: any) => booking.userId === user.id)
        : response.data;
      const normalizedBookings = userBookings.map((booking: any) => ({
        ...booking,
        status: booking.status.toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED',
        paymentStatus: booking.paymentStatus.toUpperCase() as 'PENDING' | 'COMPLETED' | 'FAILED'
      }));
      setBookings(normalizedBookings as Booking[]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(language === 'th' ? 'ไม่สามารถดึงข้อมูลการจองได้' : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return t.pending;
      case 'APPROVED':
        return t.approved;
      case 'REJECTED':
        return t.rejected;
      case 'CANCELLED':
        return t.cancelled;
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return t.pending;
      case 'COMPLETED':
        return t.completed;
      case 'FAILED':
        return t.failed;
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A699] mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-800 mb-4">{error}</p>
            <button 
              onClick={fetchBookings}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              {language === 'th' ? 'ลองใหม่' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 text-gray-500 hover:text-[#00A699] transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t.back}</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.noBookings}</h3>
              <p className="text-gray-600 mb-6">
                {language === 'th' 
                  ? 'คุณยังไม่มีการจองทัวร์ใดๆ ไปยังหน้าหลักเพื่อเริ่มท่องเที่ยว'
                  : 'You haven\'t made any bookings yet. Go to the homepage to start exploring tours.'
                }
              </p>
              <button
                onClick={() => onNavigate("home")}
                className="bg-[#00A699] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#008c81] transition"
              >
                {language === 'th' ? 'ไปหน้าหลัก' : 'Go to Homepage'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Booking Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gray-500">{t.bookingId}:</span>
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{booking.id}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {language === 'th' ? booking.tourNameSnapshot_th || booking.tourNameSnapshot : booking.tourNameSnapshot}
                      </h3>
                      {booking.tour && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {language === 'th' ? booking.tour.name_th : booking.tour.name}
                        </div>
                      )}
                    </div>
                    
                    {booking.tour && (
                      <img 
                        src={booking.tour.image} 
                        alt={booking.tour.name}
                        className="w-24 h-24 rounded-xl object-cover ml-4"
                      />
                    )}
                  </div>

                  {/* Booking Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-[#00A699]" />
                      <div>
                        <p className="text-sm text-gray-500">{t.travelDate}</p>
                        <p className="font-medium">{formatDate(booking.travelDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-[#00A699]" />
                      <div>
                        <p className="text-sm text-gray-500">{t.travelers}</p>
                        <p className="font-medium">{booking.travelers} {language === 'th' ? 'ท่าน' : 'people'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-[#00A699]" />
                      <div>
                        <p className="text-sm text-gray-500">{t.totalPrice}</p>
                        <p className="font-bold text-lg text-[#00A699]">฿{booking.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="text-sm font-medium">{t.status}: {getStatusText(booking.status)}</span>
                    </div>
                    
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm font-medium">{t.paymentStatus}: {getPaymentStatusText(booking.paymentStatus)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      {language === 'th' ? 'จองเมื่อ' : 'Booked on'} {formatDate(booking.bookingDate)}
                    </p>
                    
                    <button
                      onClick={() => onNavigate("tour", booking.tour)}
                      className="text-[#00A699] hover:text-[#008c81] font-medium text-sm flex items-center gap-1"
                    >
                      {t.viewDetails}
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
