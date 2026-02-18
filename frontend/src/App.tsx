// src/App.tsx
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminRoute from './components/AdminRoute';
import ChatWidget from './components/ChatWidget';

// นำเข้า Component
import HomePage from './components/home-page'; 
import { Navigation } from './components/navigation';
import { ProvincePage } from './components/ProvincePage';
import TourDetailPage from './pages/TourDetailPage'; 
import AdminChatPage from './pages/AdminChatPage';
import AdminDashboardPage from './pages/AdminDashboardPage'; // ตรวจสอบชื่อไฟล์ให้ตรงกัน

// นำเข้า Service และ Type
import { tourService } from './services/api';
import type { Province } from './data/mockData'; 

// หน้า Login ชั่วคราว (คุณสามารถเปลี่ยนเป็น Component Login จริงของคุณได้)
const Login = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="p-10 bg-white rounded-3xl shadow-xl text-center">
      <h1 className="text-2xl font-bold mb-4">เข้าสู่ระบบ</h1>
      <p className="text-gray-500">กรุณาเข้าสู่ระบบเพื่อใช้งานส่วนแอดมิน</p>
    </div>
  </div>
);

// ✅ Component ตัวช่วยสำหรับดึงข้อมูลจังหวัดจาก API (สำหรับหน้า /province/:id)
const ProvinceRouteWrapper = ({ language }: { language: 'th' | 'en' }) => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [provinceData, setProvinceData] = useState<Province | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvince = async () => {
      try {
        const response = await tourService.getProvinces();
        // ค้นหาจังหวัดที่ตรงกับ ID ใน URL
        const found = response.data.find((p: any) => p.id === id);
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
        else if (page === 'tour-detail' && data) navigate(`/tour/${data.id}`);
      }}
    />
  );
};

function AppContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'th' | 'en'>('th');

  // ✅ ฟังก์ชันกลางสำหรับการเปลี่ยนหน้า (Handle Navigation)
  const handleNavigate = (page: string) => {
    if (page === 'home') {
      navigate('/');
    } else if (page.startsWith('admin/')) {
      navigate(`/${page}`); // รองรับ admin/dashboard, admin/chat
    } else {
      navigate(`/${page}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation 
        currentPage="" // ปล่อยว่างไว้หรือใช้ location.pathname
        onNavigate={handleNavigate}
        userName={user?.fullName || "Guest User"}
        onShowTutorial={() => alert("Tutorial Coming Soon!")}
        cartCount={0} 
        language={language}
        onToggleLanguage={() => setLanguage(prev => prev === 'th' ? 'en' : 'th')}
      />

      <Routes>
        {/* ----- Public Routes ----- */}
        <Route path="/" element={<HomePage language={language} />} />
        <Route path="/province/:id" element={<ProvinceRouteWrapper language={language} />} />
        <Route path="/tour/:id" element={<TourDetailPage />} />
        <Route path="/login" element={<Login />} />
        
        {/* ----- Protected Admin Routes ----- */}
        <Route element={<AdminRoute />}>
          <Route 
            path="/admin/dashboard" 
            element={<AdminDashboardPage onNavigate={handleNavigate} language={language} />} 
          />
          <Route path="/admin/chat" element={<AdminChatPage />} />
        </Route>

        {/* ----- 404 Fallback ----- */}
        <Route path="*" element={
          <div className="p-20 text-center">
            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">404</h1>
            <p className="text-gray-500 mb-8">ไม่พบหน้านี้ในระบบ</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-[#00A699] text-white px-8 py-3 rounded-2xl font-bold"
            >
              กลับหน้าแรก
            </button>
          </div>
        } />
      </Routes>

      {/* Widget แชทที่แสดงทุกหน้า */}
      <ChatWidget />
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