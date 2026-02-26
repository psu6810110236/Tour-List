// src/App.tsx
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, Outlet, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import AdminRoute from './features/admin/AdminRoute';
import ChatWidget from './layouts/ChatWidget';

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

// Service & Types
import { tourService } from './services/api';
import type { Province } from './data/mockData';

// --- Mock Pages ---
const BookingPage = () => <div className="p-10 pt-24 text-center"><h1>📅 หน้าจองทัวร์ (Booking)</h1><p>ระบบจองจะอยู่ที่นี่</p></div>;
const BookingsHistoryPage = () => <div className="p-10 pt-24 text-center"><h1>🎫 ประวัติการจอง (My Bookings)</h1><p>รายการที่จองแล้วจะขึ้นหน้านี้</p></div>;
const UserProfile = () => <div className="p-10 pt-24 text-center"><h1>👤 โปรไฟล์ผู้ใช้ (Profile)</h1><p>แก้ไขข้อมูลส่วนตัว</p></div>;

// --- Helper Components ---

// 1. PrivateRoute: สำหรับ User ที่ Login แล้วเท่านั้น
const PrivateRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-20 text-center font-bold text-[#00A699]">กำลังตรวจสอบสิทธิ์...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// 2. ProvinceRouteWrapper: โหลดข้อมูลจังหวัดก่อนแสดงผล
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

  if (loading) return <div className="p-20 text-center font-bold text-[#00A699]">กำลังโหลดข้อมูลจังหวัด...</div>;
  if (!provinceData) return <div className="p-20 text-center font-bold text-red-500">ไม่พบข้อมูลจังหวัดที่คุณค้นหา</div>;

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

// --- Main App Content ---

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'th' | 'en'>('th');

  // Logic: การแสดงผล Navbar และ ChatWidget
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isAdminRoute = location.pathname.startsWith('/admin');

  // ✅ Navbar: แสดงทุกหน้า ยกเว้นหน้า Login/Register และหน้า Admin Dashboard
  const showNavbar = !isAuthPage && !isAdminRoute;

  // ✅ ChatWidget: แสดงเฉพาะ User ทั่วไป (ซ่อนในหน้า Login/Register, หน้า Admin และซ่อนถ้า User เป็น ADMIN)
  const showChatWidget = !isAuthPage && !isAdminRoute && user?.role !== 'ADMIN';

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/' || path.startsWith('/tour')) return 'home';
    if (path.startsWith('/province') || path === '/provinces') return 'provinces';
    if (path.startsWith('/booking') || path.startsWith('/my-bookings')) return 'bookings';
    return '';
  };

  const handleNavigate = (pageId: string) => {
    switch (pageId) {
      case 'home': navigate('/'); break;
      case 'provinces': navigate('/provinces'); break;
      case 'bookings': navigate('/my-bookings'); break;
      case 'dashboard': navigate('/profile'); break;
      case 'admin/dashboard': navigate('/admin/dashboard'); break;
      case 'admin/chat': navigate('/admin/chat'); break;
      default: navigate(`/${pageId}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Navbar (User) */}
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

      {/* 2. Routes */}
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage language={language} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/provinces" element={<AllProvincesPage language={language} />} />
        <Route path="/province/:id" element={<ProvinceRouteWrapper language={language} />} />
        <Route path="/tour/:id" element={<TourDetailPage language={language} />} />

        {/* Private (User) */}
        <Route element={<PrivateRoute />}>
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/my-bookings" element={<BookingsHistoryPage />} />
          <Route path="/profile" element={<UserProfile />} />
        </Route>

        {/* Admin Only */}
        <Route element={<AdminRoute />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashboardPage onNavigate={handleNavigate} language={language} />}
          />
          <Route path="/admin/chat" element={<AdminChatPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={
          <div className="p-20 text-center">
            <h1 className="text-4xl font-black text-gray-900 mb-4">404</h1>
            <p className="text-gray-500 mb-8">ไม่พบหน้านี้</p>
            <button onClick={() => navigate('/')} className="bg-[#00A699] text-white px-8 py-3 rounded-2xl font-bold">กลับหน้าแรก</button>
          </div>
        } />
      </Routes>

      {/* 3. ChatWidget (User Only) */}
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