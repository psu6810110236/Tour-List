// src/pages/AdminDashboardPage.tsx

import { useState } from 'react';
import {
  LayoutDashboard, Calendar, DollarSign, Package, CheckCircle, 
  XCircle, Clock, LogOut, Search, 
  Plus, Edit, Trash2, Eye, TrendingUp, Filter
} from 'lucide-react';

import { mockBookings, tours, getLang } from '../data/mockData';
import { translations } from "../data/translations";
import type { Language } from "../data/translations";

// ✅ 1. เพิ่ม Interface สำหรับรับ Props
interface AdminDashboardProps {
  onNavigate: (page: string, data?: any) => void;
  language: Language;
}

export default function AdminDashboardPage({ onNavigate, language }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'payments' | 'tours'>('overview');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const t = translations[language].admin; 
  const common = translations[language].booking;

  const LOGO_URL = "https://github.com/psu6810110318/-/blob/main/611177844_1219279366819683_4920076292858051338_n-removebg-preview.png?raw=true";

  const stats = {
    totalBookings: mockBookings.length,
    pendingVerification: mockBookings.filter(b => b.status === 'pending').length,
    approvedBookings: mockBookings.filter(b => b.status === 'approved').length,
    totalRevenue: mockBookings
      .filter(b => b.status === 'approved')
      .reduce((sum, b) => sum + b.totalPrice, 0)
  };

  const handleApproveBooking = (bookingId: string) => {
    alert(language === 'th' ? `อนุมัติการจอง ${bookingId} แล้ว!` : `Booking ${bookingId} approved!`);
    setSelectedBooking(null);
  };

  const handleRejectBooking = (bookingId: string) => {
    alert(language === 'th' ? `ปฏิเสธการจอง ${bookingId} แล้ว!` : `Booking ${bookingId} rejected!`);
    setSelectedBooking(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-1 overflow-hidden">
                 <img 
                    src={LOGO_URL}
                    alt="RoamHub Tour Logo" 
                    className="w-full h-full object-contain"
                  />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t.title}</h1>
                <p className="text-white/80 text-sm">{t.subtitle}</p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-xl transition"
            >
              <LogOut className="w-5 h-5" />
              <span>{t.exit}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto no-scrollbar text-sm md:text-base">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === 'overview' ? 'border-[#00A699] text-[#00A699]' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              {t.tabs.overview}
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === 'bookings' ? 'border-[#00A699] text-[#00A699]' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-5 h-5" />
              {t.tabs.bookings}
              {stats.pendingVerification > 0 && (
                <span className="bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">
                  {stats.pendingVerification}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === 'payments' ? 'border-[#00A699] text-[#00A699]' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              {t.tabs.payments}
            </button>

            <button
              onClick={() => setActiveTab('tours')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === 'tours' ? 'border-[#00A699] text-[#00A699]' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package className="w-5 h-5" />
              {t.tabs.tours}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalBookings}</div>
                <div className="text-sm text-gray-600">{t.stats.totalBookings}</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingVerification}</div>
                <div className="text-sm text-gray-600">{t.stats.pending}</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.approvedBookings}</div>
                <div className="text-sm text-gray-600">{t.stats.approved}</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#00A699]/10 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-[#00A699]" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">฿{stats.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{t.stats.revenue}</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t.recent}</h2>
              <div className="space-y-3">
                {mockBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        booking.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {booking.status === 'pending' ? <Clock className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{getLang(booking, 'tourName', language)}</div>
                        <div className="text-xs text-gray-500">{booking.id} • {getLang(booking, 'province', language)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">฿{booking.totalPrice.toLocaleString()}</div>
                      <div className={`text-[10px] font-bold uppercase ${booking.status === 'approved' ? 'text-green-600' : 'text-yellow-600'}`}>{booking.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900">{t.tabs.bookings}</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder={t.table.search} className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00A699]" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50"><Filter className="w-4 h-4" /> {t.table.filter}</button>
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
                    <tr>
                      <th className="px-6 py-4 font-semibold">{t.table.id}</th>
                      <th className="px-6 py-4 font-semibold">{t.table.tour}</th>
                      <th className="px-6 py-4 font-semibold">{t.table.date}</th>
                      <th className="px-6 py-4 font-semibold">{t.table.amount}</th>
                      <th className="px-6 py-4 font-semibold">{t.table.status}</th>
                      <th className="px-6 py-4 font-semibold">{t.table.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {mockBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">{b.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{getLang(b, 'tourName', language)}</div>
                          <div className="text-xs text-gray-500">{getLang(b, 'province', language)}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{new Date(b.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">฿{b.totalPrice.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            b.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>{b.status}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => setSelectedBooking(b)} className="p-2 text-[#00A699] hover:bg-[#00A699]/10 rounded-lg transition"><Eye className="w-5 h-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t.payment.title}</h2>
              <p className="text-sm text-gray-500">{t.payment.desc}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockBookings.filter(b => b.status === 'pending').map(b => (
                <div key={b.id} className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-gray-400">ID: {b.id}</span>
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Pending</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-4 line-clamp-1">{getLang(b, 'tourName', language)}</h3>
                  <div className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200 mb-4">
                    <div className="text-center">
                      <div className="text-2xl mb-1">📄</div>
                      <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{t.payment.slipPreview}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-end gap-4">
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">{t.payment.amount}</div>
                      <div className="text-lg font-bold text-[#00A699]">฿{b.totalPrice.toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApproveBooking(b.id)} className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600"><CheckCircle className="w-5 h-5" /></button>
                      <button onClick={() => handleRejectBooking(b.id)} className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600"><XCircle className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {mockBookings.filter(b => b.status === 'pending').length === 0 && (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="text-4xl mb-2">🎉</div>
                <div className="font-bold text-gray-900">{t.payment.caughtUp}</div>
                <div className="text-sm text-gray-500">{t.payment.noPending}</div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TOUR MANAGEMENT */}
        {activeTab === 'tours' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{t.tours.title}</h2>
              <button className="flex items-center gap-2 bg-[#00A699] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#008c81] transition shadow-lg shadow-teal-100 text-sm">
                <Plus className="w-5 h-5" /> {t.quickActions.addTour}
              </button>
            </div>
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
                    <tr>
                      <th className="px-6 py-4 font-semibold">{t.tours.name}</th>
                      <th className="px-6 py-4 font-semibold">{t.tours.province}</th>
                      <th className="px-6 py-4 font-semibold">{t.tours.price}</th>
                      <th className="px-6 py-4 font-semibold">{t.tours.rating}</th>
                      <th className="px-6 py-4 font-semibold">{t.table.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tours.map((tour) => (
                      <tr key={tour.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{getLang(tour, 'name', language)}</div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-tighter">ID: {tour.id}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{getLang(tour, 'province', language)}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">฿{tour.price.toLocaleString()}</td>
                        <td className="px-6 py-4 font-medium text-yellow-600">★ {tour.rating}</td>
                        <td className="px-6 py-4 flex gap-2">
                          <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                          <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-8 relative animate-in zoom-in duration-200">
            <button onClick={() => setSelectedBooking(null)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition"><XCircle className="w-6 h-6" /></button>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{t.modal.title}</h3>
            
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">{t.table.id}</div>
                  <div className="text-sm font-mono font-bold text-gray-900">{selectedBooking.id}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">{t.table.status}</div>
                  <div className="text-sm font-bold text-[#00A699] uppercase tracking-wider">{selectedBooking.status}</div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">{t.table.tour}</div>
                <div className="text-base font-bold text-gray-900">{getLang(selectedBooking, 'tourName', language)}</div>
                <div className="text-xs text-gray-500">{getLang(selectedBooking, 'province', language)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                 <div>{common.selectDate}: <span className="text-gray-900">{selectedBooking.date}</span></div>
                 <div>{common.travelers}: <span className="text-gray-900">{selectedBooking.travelers}</span></div>
              </div>
            </div>

            <div className="flex gap-3">
              {selectedBooking.status === 'pending' ? (
                <>
                  <button onClick={() => handleApproveBooking(selectedBooking.id)} className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition shadow-lg shadow-green-100">{t.modal.approveBtn}</button>
                  <button onClick={() => handleRejectBooking(selectedBooking.id)} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition shadow-lg shadow-red-100">{t.modal.rejectBtn}</button>
                </>
              ) : (
                <button onClick={() => setSelectedBooking(null)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold transition">Close Details</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}