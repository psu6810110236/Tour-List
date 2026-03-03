// src/App.tsx
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, Outlet, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import AdminRoute from './features/admin/AdminRoute';
import ChatWidget from './layouts/ChatWidget';

// --- Icons ---
import { Construction, Ticket, UserCircle } from 'lucide-react';

// --- Import Pages & Components ---
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import HomePage from './features/public/pages/home-page';
import { Navigation } from './layouts/navigation';
import { ProvincePage } from './features/public/pages/ProvincePage';
import TourDetailPage from './features/public/pages/TourDetailPage';
import AdminChatPage from './features/admin/AdminChatPage';
import { AdminDashboard as AdminDashboardPage } from './features/admin/AdminDashboardPage';
import AllProvincesPage from './pages/AllProvincesPage';
import { BookingPage } from './components/ui/booking-page';
import { PaymentPage } from './components/ui/payment-page';
import { PaymentConfirmation } from './components/ui/payment-confirmation';

// Service & Types
import { tourService } from './services/api';
import type { Province } from './data/mockData';

// --- UI Helper Components ---
const WorkInProgressTemplate = ({ title, desc, icon: Icon }: { title: string, desc: string, icon: any }) => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-gray-50/50">
    <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-xl shadow-gray-200/50 max-w-md w-full text-center border border-gray-100 relative overflow-hidden animate-in fade-in zoom-in duration-500">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#00A699]/10 to-orange-50 -z-10"></div>
      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-[#00A699]/10 relative z-10">
        <Icon className="w-12 h-12 text-[#00A699]" />
      </div>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">{title}</h2>
      <p className="text-gray-500 mb-10 leading-relaxed text-sm">{desc}</p>
    </div>
  </div>
);

const BookingsHistoryPage = ({ language }: { language: 'th' | 'en' }) => (
  <WorkInProgressTemplate 
    title={language === 'th' ? "ประวัติการจอง" : "My Bookings"} 
    desc={language === 'th' ? "หน้ารวมรายการทัวร์ที่คุณจองไว้กำลังก่อสร้าง" : "The page for your booked tours history is under construction."} 
    icon={Ticket} 
  />
);

const UserProfile = ({ language }: { language: 'th' | 'en' }) => (
  <WorkInProgressTemplate 
    title={language === 'th' ? "โปรไฟล์ผู้ใช้" : "User Profile"} 
    desc={language === 'th' ? "ระบบจัดการข้อมูลส่วนตัวกำลังเปิดให้ใช้งานเร็วๆ นี้" : "Personal information management will be available soon."} 
    icon={UserCircle} 
  />
);

// --- PrivateRoute Helper ---
const PrivateRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-[#00A699]">กำลังตรวจสอบสิทธิ์...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// --- Province Wrapper ---
const ProvinceRouteWrapper = ({ language }: { language: 'th' | 'en' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provinceData, setProvinceData] = useState<Province | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvince = async () => {
      try {
        const response = await tourService.getProvinces();
        const found = response.data.find((p: any) => String(p.id) === String(id));
        setProvinceData(found || null);
      } catch (error) {
        console.error("Error fetching province:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProvince();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-[#00A699]">กำลังโหลดข้อมูลจังหวัด...</div>;
  if (!provinceData) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">ไม่พบข้อมูลจังหวัดที่คุณค้นหา</div>;

  return (
    <ProvincePage
      province={provinceData}
      language={language}
      onNavigate={(page, data) => {
        if (page === 'home') navigate('/');
        else if (page === 'tour-detail' && data) navigate(`/tour/${(data as any).id}`);
      }}
    />
  );
};

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'th' | 'en'>('th');
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('bookingData');
      if (stored) setBookingData(JSON.parse(stored));
    } catch (e) {
      console.warn('Failed to parse bookingData from sessionStorage', e);
    }
  }, []);

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isAdminRoute = location.pathname.startsWith('/admin');
  const showNavbar = !isAuthPage && !isAdminRoute;
  const showChatWidget = !isAuthPage && !isAdminRoute && user?.role?.toUpperCase() !== 'ADMIN';

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/' || path.startsWith('/tour')) return 'home';
    if (path.startsWith('/province') || path === '/provinces') return 'provinces';
    if (path.startsWith('/booking') || path.startsWith('/my-bookings')) return 'bookings';
    return '';
  };

  const handleNavigate = (pageId: string, data?: any) => {
    if (pageId === 'payment') {
      setBookingData(data);
      try { sessionStorage.setItem('bookingData', JSON.stringify(data)); } catch {};
      navigate('/payment');
      return;
    }
    if (pageId === 'payment-confirmation') {
      setBookingData(data);
      try { sessionStorage.setItem('bookingData', JSON.stringify(data)); } catch {};
      navigate('/payment-confirmation');
      return;
    }
    if (pageId === 'home') {
      try { sessionStorage.removeItem('bookingData'); } catch {};
      setBookingData(null);
      navigate('/');
      return;
    }
    switch (pageId) {
      case 'provinces': navigate('/provinces'); break;
      case 'bookings': navigate('/my-bookings'); break;
      case 'dashboard': navigate('/profile'); break;
      case 'admin/dashboard': navigate('/admin/dashboard'); break;
      case 'admin/chat': navigate('/admin/chat'); break;
      default: navigate(`/${pageId}`);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {showNavbar && (
        <Navigation
          currentPage={getCurrentPage()}
          onNavigate={handleNavigate}
          userName={user?.fullName || "Guest User"}
          onShowTutorial={() => alert("Tutorial Coming Soon!")}
          cartCount={0}
          onOpenCart={() => console.log("Open Cart")}
          language={language}
          onToggleLanguage={() => setLanguage(prev => prev === 'th' ? 'en' : 'th')}
        />
      )}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage language={language} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/provinces" element={<AllProvincesPage language={language} />} />
          <Route path="/province/:id" element={<ProvinceRouteWrapper language={language} />} />
          <Route path="/tour/:id" element={<TourDetailPage language={language} />} />

          {/* Private (User) */}
          <Route element={<PrivateRoute />}>
            <Route path="/booking" element={<BookingPage tour={bookingData} onNavigate={handleNavigate} language={language} />} />
            <Route path="/booking/:id" element={<BookingPage tour={bookingData} onNavigate={handleNavigate} language={language} />} />
            <Route path="/my-bookings" element={<BookingsHistoryPage language={language} />} />
            <Route path="/profile" element={<UserProfile language={language} />} />
            <Route path="/payment" element={<PaymentPage bookingData={bookingData} onNavigate={handleNavigate} language={language} />} />
            <Route path="/payment-confirmation" element={<PaymentConfirmation bookingData={bookingData} onNavigate={handleNavigate} language={language} />} />
          </Route>

          {/* Admin Only */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage onNavigate={handleNavigate} language={language} />} />
            <Route path="/admin/chat" element={<AdminChatPage />} />
          </Route>

          {/* 404 Page */}
          <Route path="*" element={
            <WorkInProgressTemplate 
              title="404" 
              desc={language === 'th' ? 'ขออภัย ไม่พบหน้าที่คุณค้นหา หรือหน้านี้กำลังอยู่ระหว่างการปรับปรุง' : 'Sorry, the page you are looking for does not exist or is under construction.'} 
              icon={Construction} 
            />
          } />
        </Routes>
      </main>

      {showChatWidget && <ChatWidget />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;