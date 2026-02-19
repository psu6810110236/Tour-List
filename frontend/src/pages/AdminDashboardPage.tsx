// src/pages/AdminDashboardPage.tsx

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Package,
  LogOut,
  Eye,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  ListChecks
} from 'lucide-react';
import { mockBookings, getLang } from '../data/mockData';
import type { Tour, Province } from '../data/mockData';
import { translations } from "../data/translations";
import type { Language } from "../data/translations";

// ✅ นำเข้า API Service สำหรับเชื่อม Backend
import { tourService } from '../services/api';

interface AdminDashboardProps {
  onNavigate: (page: string, data?: any) => void;
  language: Language;
}

export function AdminDashboard({ onNavigate, language }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'payments' | 'tours'>('overview');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // 🟢 State สำหรับจัดการข้อมูลจริงจาก Backend
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [allProvinces, setAllProvinces] = useState<Province[]>([]);
  
  // 🟢 State สำหรับฟอร์มเพิ่ม/แก้ไขทัวร์
  const [isAddingTour, setIsAddingTour] = useState(false);
  const [editingTourId, setEditingTourId] = useState<string | null>(null); // ✅ ใช้จำว่ากำลังแก้ไขทัวร์ไหน
  const [formLang, setFormLang] = useState<Language>(language);
  const [createNewProvince, setCreateNewProvince] = useState(false);

  // ✅ สร้างแบบฟอร์มเริ่มต้นว่างๆ เพื่อความสะดวกในการรีเซ็ต
  const initialTourForm: Partial<Tour> = {
    id: '', name: '', name_th: '', description: '', description_th: '',
    provinceId: '', province: '', province_th: '', price: 0, duration: '', duration_th: '', image: '',
    highlights: [], highlights_th: [], itinerary: [{ day: 1, title: '', title_th: '', activities: [], activities_th: [] }],
    included: [], included_th: [], notIncluded: [], notIncluded_th: []
  };

  const [tourForm, setTourForm] = useState<Partial<Tour>>({ ...initialTourForm, id: `T-${Date.now()}` });

  const t = translations[language].admin;
  const common = translations[language].booking;
  const tourT = translations[language].tourDetail;

  const LOGO_URL = "https://github.com/psu6810110318/-/blob/main/611177844_1219279366819683_4920076292858051338_n-removebg-preview.png?raw=true";

  // 🟢 ฟังก์ชันดึงข้อมูลจาก Backend
  const fetchAdminData = async () => {
    try {
      const [toursRes, provRes] = await Promise.all([
        tourService.search({}), 
        tourService.getProvinces()
      ]);
      setAllTours(toursRes.data);
      setAllProvinces(provRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // 🟢 ฟังก์ชันเมื่อกดปุ่ม "แก้ไข" (ดึงข้อมูลเก่ามาใส่ฟอร์ม)
  const handleEditClick = (tour: Tour) => {
    setEditingTourId(tour.id);
    
    // จัดการ provinceId ในกรณีที่ Backend ส่งมาเป็น Object
    const currentProvinceId = typeof tour.province === 'object' && tour.province !== null 
      ? (tour.province as any).id 
      : tour.provinceId || tour.province;

    setTourForm({ 
      ...tour,
      provinceId: currentProvinceId 
    });
    
    setIsAddingTour(true);
    setCreateNewProvince(false);
  };

  // 🟢 ฟังก์ชันบันทึกทัวร์และจังหวัดลง Database (รองรับทั้ง สร้าง และ แก้ไข)
  const handleSaveTour = async () => {
    if (!tourForm.name || !tourForm.provinceId) return alert("กรุณากรอกชื่อทัวร์และเลือกจังหวัด");
    
    try {
      if (createNewProvince) {
          const newProv = {
              id: tourForm.provinceId!,
              name: tourForm.province!,
              name_th: tourForm.province_th || tourForm.province!,
              tourCount: 0,
              image: tourForm.image || '',
              description: '',
              description_th: '',
          };
          await tourService.createProvince(newProv);
      }

      // 🟢 ตรวจสอบว่ามี editingTourId ไหม ถ้ามี = แก้ไข ถ้าไม่มี = สร้างใหม่
      if (editingTourId) {
        await tourService.updateTour(editingTourId, tourForm);
        alert(language === 'th' ? "อัปเดตทัวร์สำเร็จ!" : "Tour Updated Successfully!");
      } else {
        const newTour = { ...tourForm, rating: 5.0, reviewCount: 0 };
        await tourService.createTour(newTour);
        alert(language === 'th' ? "สร้างทัวร์สำเร็จ!" : "Tour Created Successfully!");
      }
      
      setIsAddingTour(false);
      setEditingTourId(null);
      fetchAdminData(); // โหลดข้อมูลตารางใหม่

      setTourForm({ ...initialTourForm, id: `T-${Date.now()}` }); // รีเซ็ตฟอร์ม
      setCreateNewProvince(false);
    } catch (error) {
      console.error("Error saving tour:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล ลองตรวจสอบ Console");
    }
  };

  const handleSelectProvince = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = allProvinces.find(p => p.id === e.target.value);
    if (selected) {
      setTourForm({
        ...tourForm, provinceId: selected.id, province: selected.name, province_th: selected.name_th
      });
    }
  };

  const handleAddDay = () => {
    setTourForm(prev => ({
      ...prev,
      itinerary: [...(prev.itinerary || []), { day: (prev.itinerary?.length || 0) + 1, title: '', activities: [] }]
    }));
  };

  // Stats ข้อมูลจำลองสำหรับการจอง
  const stats = {
    totalBookings: mockBookings.length,
    pendingVerification: mockBookings.filter(b => b.status === 'pending').length,
    approvedBookings: mockBookings.filter(b => b.status === 'approved').length,
    totalRevenue: mockBookings.filter(b => b.status === 'approved').reduce((sum, b) => sum + b.totalPrice, 0)
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
              <div className="w-18 h-18 bg-white rounded-xl flex items-center justify-center p-1 overflow-hidden">
                 <img 
                    src={LOGO_URL}
                    alt="RoamHub Tour Logo" 
                    className="w-16 h-16 object-contain"
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
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {(['overview', 'bookings', 'payments', 'tours'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { 
                  setActiveTab(tab); 
                  setIsAddingTour(false); 
                  setEditingTourId(null); // รีเซ็ตสถานะเมื่อเปลี่ยน Tab
                }}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-[#00A699] text-[#00A699]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'overview' && <LayoutDashboard className="w-5 h-5" />}
                {tab === 'bookings' && <Calendar className="w-5 h-5" />}
                {tab === 'payments' && <DollarSign className="w-5 h-5" />}
                {tab === 'tours' && <Package className="w-5 h-5" />}
                {t.tabs[tab]}
                {tab === 'bookings' && stats.pendingVerification > 0 && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {stats.pendingVerification}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalBookings}</div>
                <div className="text-sm text-gray-600">{t.stats.totalBookings}</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">{t.stats.actionRequired}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingVerification}</div>
                <div className="text-sm text-gray-600">{t.stats.pending}</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.approvedBookings}</div>
                <div className="text-sm text-gray-600">{t.stats.approved}</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#00A699]/10 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-[#00A699]" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">฿{stats.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{t.stats.revenue}</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.recent}</h2>
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
                      }`}>{booking.status.toUpperCase()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= BOOKINGS TAB ================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><h2 className="text-2xl font-bold text-gray-900">{t.tabs.bookings}</h2></div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder={t.table.search} className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A699]" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition">
                  <Filter className="w-5 h-5" /> {t.table.filter}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.table.id}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.table.tour}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.table.customer}</th>
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
                          <div className="text-sm text-gray-600">{getLang(booking, 'province', language)}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">User #{booking.userId.slice(-3)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{new Date(booking.date).toLocaleDateString(language === 'en' ? 'en-US' : 'th-TH')}</td>
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

        {/* ================= PAYMENTS TAB ================= */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t.payment.title}</h2>
              <p className="text-gray-600 mt-1">{t.payment.desc}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockBookings.filter(b => b.status === 'pending').map((booking) => (
                <div key={booking.id} className="bg-white rounded-3xl p-6 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">{t.table.id}</div>
                      <div className="font-semibold text-gray-900">{booking.id}</div>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg text-xs font-semibold">Pending</span>
                  </div>
                  <div className="mb-4">
                    <div className="font-medium text-gray-900 mb-1">{getLang(booking, 'tourName', language)}</div>
                    <div className="text-sm text-gray-600">{getLang(booking, 'province', language)}</div>
                  </div>
                  <div className="bg-gray-100 rounded-2xl p-6 mb-4 text-center">
                    <div className="text-4xl mb-2">📄</div>
                    <div className="text-sm text-gray-600">{t.payment.slipPreview}</div>
                    <div className="text-xs text-gray-500 mt-1">{t.payment.clickToView}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <div className="text-gray-600 mb-1">{t.payment.amount}</div>
                      <div className="font-semibold text-gray-900">฿{booking.totalPrice.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">{t.payment.paymentDate}</div>
                      <div className="font-semibold text-gray-900">{new Date(booking.bookingDate).toLocaleDateString(language === 'en' ? 'en-US' : 'th-TH')}</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleApproveBooking(booking.id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" /> {t.payment.approve}
                    </button>
                    <button onClick={() => handleRejectBooking(booking.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
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

        {/* ================= TOURS TAB ================= */}
        {activeTab === 'tours' && (
          <div className="space-y-6">
            {!isAddingTour ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t.tours.title}</h2>
                    <p className="text-gray-600 mt-1">{t.tours.desc}</p>
                  </div>
                  <button 
                    onClick={() => { 
                      setIsAddingTour(true); 
                      setEditingTourId(null); 
                      setTourForm({ ...initialTourForm, id: `T-${Date.now()}` }); 
                    }} 
                    className="flex items-center gap-2 bg-[#00A699] hover:bg-[#008c81] text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    {t.quickActions.addTour}
                  </button>
                </div>

                <div className="bg-white rounded-3xl shadow-lg overflow-hidden border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.tours.name}</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.tours.province}</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.tours.duration}</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.tours.price}</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.tours.rating}</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.table.actions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {allTours.map((tour) => (
                          <tr key={tour.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{getLang(tour, 'name', language)}</div>
                              <div className="text-sm text-gray-600">{tour.id}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {typeof tour.province === 'object' && tour.province !== null 
                                ? getLang(tour.province, 'name', language) 
                                : getLang(tour, 'province', language)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {getLang(tour, 'duration', language) || '-'}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              ฿{Number(tour.price || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-900">{tour.rating || 0}</span>
                                <span className="text-yellow-400">★</span>
                                <span className="text-gray-500">({tour.reviewCount || 0})</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {/* 🟢 ปุ่ม Edit จะเรียกฟังก์ชันที่เตรียมไว้ให้เอาข้อมูลไปใส่ฟอร์ม */}
                                <button onClick={() => handleEditClick(tour)} className="text-[#00A699] hover:text-[#008c81] transition p-2">
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button className="text-red-500 hover:text-red-600 transition p-2">
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              /* ฟอร์มเพิ่ม/แก้ไขทัวร์ */
              <div className="bg-white rounded-3xl shadow-xl p-8 border animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                   <h2 className="text-2xl font-bold">
                     {editingTourId 
                       ? (language === 'th' ? 'แก้ไขข้อมูลทัวร์' : 'Edit Tour Info') 
                       : (language === 'th' ? 'ข้อมูลทัวร์และสถานที่ (สร้างใหม่)' : 'New Tour & Location Info')}
                   </h2>
                   <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                      <button onClick={() => setFormLang('en')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${formLang === 'en' ? 'bg-white text-[#00A699] shadow' : ''}`}>EN</button>
                      <button onClick={() => setFormLang('th')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${formLang === 'th' ? 'bg-white text-[#00A699] shadow' : ''}`}>TH</button>
                   </div>
                </div>

                <div className="space-y-10">
                  <div className="bg-[#00A699]/5 p-6 rounded-2xl border-2 border-dashed border-[#00A699]/20">
                     <div className="flex justify-between items-center mb-4">
                        <label className="font-bold flex items-center gap-2"><MapPin size={18}/> {language === 'th' ? 'ระบุจังหวัด' : 'Specify Province'}</label>
                        <button onClick={() => setCreateNewProvince(!createNewProvince)} className="text-xs font-bold text-[#00A699] hover:underline">
                           {createNewProvince ? (language === 'th' ? 'เลือกจังหวัดที่มีอยู่' : 'Back to Select') : (language === 'th' ? '+ สร้างจังหวัดใหม่' : '+ Add New Province')}
                        </button>
                     </div>

                     {!createNewProvince ? (
                        <select className="w-full p-4 bg-white border rounded-xl font-bold" value={tourForm.provinceId || ''} onChange={handleSelectProvince}>
                           <option value="">-- {language === 'th' ? 'กรุณาเลือกจังหวัด' : 'Select Province'} --</option>
                           {allProvinces.map(p => <option key={p.id} value={p.id}>{getLang(p, 'name', language)}</option>)}
                        </select>
                     ) : (
                        <div className="grid grid-cols-2 gap-4">
                           <input placeholder="Province ID (e.g., hat-yai)" className="p-4 border rounded-xl" onChange={e => setTourForm({...tourForm, provinceId: e.target.value})}/>
                           <input placeholder="Province Name (TH/EN)" className="p-4 border rounded-xl" onChange={e => setTourForm({...tourForm, province: e.target.value, province_th: e.target.value})}/>
                        </div>
                     )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <label className="block font-bold">รหัสทัวร์ (ID)</label>
                        <input className={`w-full p-4 border rounded-2xl ${editingTourId ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-50'}`} 
                          placeholder="เช่น cm-003" value={tourForm.id || ''} disabled={!!editingTourId}
                          onChange={e => setTourForm({...tourForm, id: e.target.value})}/>
                     
                        <label className="block font-bold">ชื่อทัวร์ ({formLang.toUpperCase()})</label>
                        <input className="w-full p-4 bg-gray-50 border rounded-2xl" value={formLang === 'en' ? (tourForm.name || '') : (tourForm.name_th || '')}
                          onChange={e => setTourForm({...tourForm, [formLang === 'en' ? 'name' : 'name_th']: e.target.value})}/>
                        
                        <label className="block font-bold">รายละเอียด (Description) ({formLang.toUpperCase()})</label>
                        <textarea className="w-full p-4 bg-gray-50 border rounded-2xl" value={formLang === 'en' ? (tourForm.description || '') : (tourForm.description_th || '')}
                          onChange={e => setTourForm({...tourForm, [formLang === 'en' ? 'description' : 'description_th']: e.target.value})}/>

                        <label className="block font-bold">ราคาพื้นฐาน</label>
                        <input type="number" className="w-full p-4 bg-gray-50 border rounded-2xl font-bold text-[#00A699]" placeholder="0" value={tourForm.price || ''}
                          onChange={e => setTourForm({...tourForm, price: Number(e.target.value)})}/>
                     </div>
                     <div className="space-y-4">
                        <label className="block font-bold">รูปภาพหลัก (URL)</label>
                        <input className="w-full p-4 bg-gray-50 border rounded-2xl" placeholder="https://..." value={tourForm.image || ''} 
                          onChange={e => setTourForm({...tourForm, image: e.target.value})}/>
                        
                        <label className="block font-bold">ระยะเวลา</label>
                        <input className="w-full p-4 bg-gray-50 border rounded-2xl" placeholder="1 Day" value={tourForm.duration || ''} 
                          onChange={e => setTourForm({...tourForm, duration_th: e.target.value, duration: e.target.value})}/>
                     </div>
                  </div>

                  <div className="border-t pt-8">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2"><ListChecks /> {tourT.itinerary}</h3>
                        <button onClick={handleAddDay} className="text-[#00A699] font-bold text-sm">+ เพิ่มวันเดินทาง</button>
                     </div>
                     <div className="space-y-4">
                        {tourForm.itinerary?.map((day, idx) => (
                           <div key={idx} className="p-6 bg-gray-50 rounded-2xl border relative">
                              <span className="absolute -top-3 left-4 bg-[#00A699] text-white px-3 py-1 rounded-lg text-xs font-bold uppercase">DAY {day.day}</span>
                              <input className="w-full p-3 bg-white border rounded-xl font-bold mb-3" placeholder="Day Title (TH/EN)" value={day.title || ''}
                                onChange={e => {
                                   const updated = [...(tourForm.itinerary || [])];
                                   updated[idx] = {...updated[idx], title: e.target.value, title_th: e.target.value};
                                   setTourForm({...tourForm, itinerary: updated});
                                }}/>
                              <textarea className="w-full p-3 bg-white border rounded-xl text-sm" placeholder="กิจกรรมรายวัน (ใช้เครื่องหมาย , แยกกิจกรรม)" value={day.activities?.join(',') || ''}
                                onChange={e => {
                                   const updated = [...(tourForm.itinerary || [])];
                                   updated[idx] = {...updated[idx], activities: e.target.value.split(','), activities_th: e.target.value.split(',')};
                                   setTourForm({...tourForm, itinerary: updated});
                                }}/>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="flex gap-4 pt-10 border-t">
                    <button onClick={handleSaveTour} className="flex-1 bg-[#00A699] hover:bg-[#008c81] text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition">
                      {editingTourId ? (language === 'th' ? 'บันทึกการแก้ไข' : 'Save Changes') : (language === 'th' ? 'บันทึกและเผยแพร่' : 'Save & Publish')}
                    </button>
                    <button onClick={() => { setIsAddingTour(false); setEditingTourId(null); }} className="px-10 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-200 transition">
                      {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
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
                    selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedBooking.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">{t.tours.name}</div>
                  <div className="font-medium text-gray-900">{getLang(selectedBooking, 'tourName', language)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">{t.tours.province}</div>
                  <div className="font-medium text-gray-900">{getLang(selectedBooking, 'province', language)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">{common.selectDate}</div>
                  <div className="font-medium text-gray-900">{new Date(selectedBooking.date).toLocaleDateString(language === 'en' ? 'en-US' : 'th-TH')}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">{common.travelers}</div>
                  <div className="font-medium text-gray-900">{selectedBooking.travelers}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">{common.totalPrice}</div>
                  <div className="text-xl font-bold text-[#00A699]">฿{selectedBooking.totalPrice.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">{t.modal.bookedOn}</div>
                  <div className="font-medium text-gray-900">{new Date(selectedBooking.bookingDate).toLocaleDateString(language === 'en' ? 'en-US' : 'th-TH')}</div>
                </div>
              </div>
            </div>
            {selectedBooking.status === 'pending' && (
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button onClick={() => handleApproveBooking(selectedBooking.id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" /> {t.modal.approveBtn}
                </button>
                <button onClick={() => handleRejectBooking(selectedBooking.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
                  <XCircle className="w-5 h-5" /> {t.modal.rejectBtn}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}