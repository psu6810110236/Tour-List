import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// --- Import Pages & Components ที่มีอยู่จริง ---
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './components/home-page';
import { Navigation } from './components/navigation';
import ChatWidget from './components/ChatWidget';
import AdminRoute from './components/AdminRoute';

// Admin Pages (ถ้ายังไม่มีไฟล์ ให้ใช้ Mock ด้านล่างแทนได้)
import AdminChatPage from './pages/AdminChatPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// --- Mock Pages (หน้าปลอมๆ ใส่ไว้กัน Error เดี๋ยวค่อยสร้างไฟล์จริงทีหลัง) ---
const ProvincesPage = () => <div className="p-10 pt-24 text-center"><h1>🌴 หน้าจังหวัดทั้งหมด (Provinces)</h1><p>รวมที่เที่ยวแยกตามจังหวัด</p></div>;
const BookingPage = () => <div className="p-10 pt-24 text-center"><h1>📅 หน้าจองทัวร์ (Booking)</h1><p>ระบบจองจะอยู่ที่นี่</p></div>;
const BookingsHistoryPage = () => <div className="p-10 pt-24 text-center"><h1>ticket ประวัติการจอง (My Bookings)</h1><p>รายการที่จองแล้วจะขึ้นหน้านี้</p></div>;
const UserProfile = () => <div className="p-10 pt-24 text-center"><h1>👤 โปรไฟล์ผู้ใช้ (Profile)</h1><p>แก้ไขข้อมูลส่วนตัว</p></div>;

// Component สำหรับป้องกัน Route ที่ต้อง Login
const PrivateRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State ภาษา (คุมทั้งแอป)
  const [language, setLanguage] = useState<'th' | 'en'>('th');

  // Logic: แปลง URL ปัจจุบัน เป็นชื่อ Tab เพื่อให้ Navbar แสดงสีถูกต้อง
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/' || path.startsWith('/tour')) return 'home';
    if (path.startsWith('/province')) return 'provinces';
    if (path.startsWith('/booking') || path.startsWith('/my-bookings')) return 'bookings';
    return '';
  };

  // Logic: รับคำสั่งจาก Navbar แล้วเปลี่ยนหน้า
  const handleNavigate = (pageId: string) => {
    switch (pageId) {
        case 'home': navigate('/'); break;
        case 'provinces': navigate('/provinces'); break;
        case 'bookings': navigate('/my-bookings'); break;
        case 'dashboard': navigate('/profile'); break;
        default: navigate('/');
    }
  };

  // ซ่อน Navbar และ Chat ในหน้า Login/Register/Admin
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  const showNavAndChat = !isAuthPage && !isAdminPage;

  return (
    <>
      {showNavAndChat && (
        <Navigation
          currentPage={getCurrentPage()}
          onNavigate={handleNavigate}
          userName={user?.fullName || "Guest"}
          onShowTutorial={() => console.log("Tutorial Clicked")}
          cartCount={0}
          onOpenCart={() => console.log("Open Cart")}
          language={language}
          onToggleLanguage={() => setLanguage(prev => prev === 'th' ? 'en' : 'th')}
        />
      )}

      <Routes>
        {/* === Public Routes === */}
        <Route path="/" element={<HomePage language={language} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/provinces" element={<ProvincesPage />} />

        {/* === Private Routes (ต้อง Login) === */}
        <Route element={<PrivateRoute />}>
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/my-bookings" element={<BookingsHistoryPage />} />
          <Route path="/profile" element={<UserProfile />} />
        </Route>

        {/* === Admin Routes === */}
        <Route element={<AdminRoute />}>
           <Route path="/admin" element={<AdminDashboardPage />} />
           <Route path="/admin/chat" element={<AdminChatPage />} />
        </Route>

        {/* Route กันหลง */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showNavAndChat && <ChatWidget />}
    </>
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