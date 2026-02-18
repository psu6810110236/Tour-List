import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, DollarSign, Package, CheckCircle, 
  XCircle, Clock,  LogOut, Search,  
  Plus, Edit, Trash2, Eye, MessageCircle
} from 'lucide-react';

import { mockBookings, tours, getLang } from '../data/mockData';
import { translations } from "../data/translations";
import type { Language } from "../data/translations";
export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const language: Language = 'th';
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'payments' | 'tours'>('overview');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const t = translations[language].admin;
  const common = translations[language].booking;

  const LOGO_URL = "https://raw.githubusercontent.com/psu6810110318/-/main/611177844_1219279366819683_4920076292858051338_n-removebg-preview.png";

  const stats = {
    totalBookings: mockBookings.length,
    pendingVerification: mockBookings.filter(b => b.status === 'pending').length,
    approvedBookings: mockBookings.filter(b => b.status === 'approved').length,
    totalRevenue: mockBookings.filter(b => b.status === 'approved').reduce((sum, b) => sum + b.totalPrice, 0)
  };

  const handleApproveBooking = (bookingId: string) => {
    alert(`อนุมัติการจอง ${bookingId} แล้ว!`);
    setSelectedBooking(null);
  };

  const handleRejectBooking = (bookingId: string) => {
    alert(`ปฏิเสธการจอง ${bookingId} แล้ว!`);
    setSelectedBooking(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 overflow-hidden">
                 <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{t.title}</h1>
                <p className="text-white/70 text-xs md:text-sm">{t.subtitle}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/admin/chat')}
                className="flex items-center gap-2 bg-[#00A699] hover:bg-[#008c81] px-4 py-2 rounded-lg transition shadow-md"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="hidden md:inline">ตอบแชทลูกค้า</span>
              </button>

              <button onClick={() => navigate('/')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition">
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline">{t.exit}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', icon: LayoutDashboard, label: t.tabs.overview },
              { id: 'bookings', icon: Calendar, label: t.tabs.bookings, count: stats.pendingVerification },
              { id: 'payments', icon: DollarSign, label: t.tabs.payments },
              { id: 'tours', icon: Package, label: t.tabs.tours },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-4 font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id ? 'border-[#00A699] text-[#00A699]' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
                {tab.count ? (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">{tab.count}</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* === Tab: Overview === */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-gray-500 text-sm mb-1">{t.stats.totalBookings}</div>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalBookings}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-gray-500 text-sm mb-1">{t.stats.pending}</div>
                  <div className="text-3xl font-bold text-yellow-600">{stats.pendingVerification}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-gray-500 text-sm mb-1">{t.stats.approved}</div>
                  <div className="text-3xl font-bold text-green-600">{stats.approvedBookings}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-gray-500 text-sm mb-1">{t.stats.revenue}</div>
                  <div className="text-3xl font-bold text-[#00A699]">฿{stats.totalRevenue.toLocaleString()}</div>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t.recent}</h2>
              <div className="space-y-3">
                {mockBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        booking.status === 'pending' ? 'bg-yellow-100' :
                        booking.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {booking.status === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
                        {booking.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {booking.status === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{getLang(booking, 'tourName', language)}</div>
                        <div className="text-sm text-gray-600">{booking.id} • {getLang(booking, 'province', language)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">฿{booking.totalPrice.toLocaleString()}</div>
                      <div className={`text-sm font-medium ${
                        booking.status === 'pending' ? 'text-yellow-600' :
                        booking.status === 'approved' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {booking.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === Tab: Bookings === */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{t.tabs.bookings}</h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder={t.table.search} className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A699]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.table.id}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.table.tour}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.table.date}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.table.amount}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.table.status}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.table.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{booking.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{getLang(booking, 'tourName', language)}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{new Date(booking.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">฿{booking.totalPrice.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold ${
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => setSelectedBooking(booking)} className="text-[#00A699] hover:text-[#008c81] font-medium text-sm transition">
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* === Tab: Payments === */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{t.payment.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockBookings.filter(b => b.status === 'pending').map((booking) => (
                <div key={booking.id} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="font-semibold text-gray-900">Booking #{booking.id}</div>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg text-xs font-semibold">Pending</span>
                  </div>
                  <div className="mb-4">
                    <div className="font-medium text-gray-900 mb-1">{getLang(booking, 'tourName', language)}</div>
                    <div className="text-3xl font-bold text-[#00A699]">฿{booking.totalPrice.toLocaleString()}</div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => handleApproveBooking(booking.id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl font-semibold transition flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" /> {t.payment.approve}
                    </button>
                    <button onClick={() => handleRejectBooking(booking.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-semibold transition flex items-center justify-center gap-2">
                      <XCircle className="w-5 h-5" /> {t.payment.reject}
                    </button>
                  </div>
                </div>
              ))}
              {mockBookings.filter(b => b.status === 'pending').length === 0 && (
                <div className="col-span-2 bg-white rounded-3xl p-12 text-center shadow-lg">
                  <div className="text-6xl mb-4">✓</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.payment.caughtUp}</h3>
                  <p className="text-gray-600">{t.payment.noPending}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === Tab: Tours === */}
        {activeTab === 'tours' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{t.tours.title}</h2>
              <button className="flex items-center gap-2 bg-[#00A699] hover:bg-[#008c81] text-white px-6 py-3 rounded-xl font-semibold transition">
                <Plus className="w-5 h-5" /> {t.quickActions.addTour}
              </button>
            </div>
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.tours.name}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.tours.province}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.tours.price}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.table.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tours.map((tour) => (
                    <tr key={tour.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{getLang(tour, 'name', language)}</td>
                      <td className="px-6 py-4 text-gray-600">{getLang(tour, 'province', language)}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">฿{tour.price.toLocaleString()}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <button className="text-[#00A699]"><Edit className="w-5 h-5" /></button>
                        <button className="text-red-500"><Trash2 className="w-5 h-5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{t.modal.title}</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600 transition">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">{t.table.id}</div>
                  <div className="font-medium text-gray-900">{selectedBooking.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">{t.table.status}</div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold ${
                    selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>{selectedBooking.status.toUpperCase()}</span>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-600 mb-1">{t.tours.name}</div>
                  <div className="font-medium text-gray-900">{getLang(selectedBooking, 'tourName', language)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">{common.travelers}</div>
                  <div className="font-medium text-gray-900">{selectedBooking.travelers} คน</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">{common.totalPrice}</div>
                  <div className="text-xl font-bold text-[#00A699]">฿{selectedBooking.totalPrice.toLocaleString()}</div>
                </div>
              </div>
            </div>
            {selectedBooking.status === 'pending' && (
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button onClick={() => handleApproveBooking(selectedBooking.id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition">
                  {t.modal.approveBtn}
                </button>
                <button onClick={() => handleRejectBooking(selectedBooking.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition">
                  {t.modal.rejectBtn}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}