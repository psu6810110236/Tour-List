// src/App.tsx
import { useState } from "react";
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminRoute from './components/AdminRoute';
import ChatWidget from './components/ChatWidget';
import AdminChatPage from './pages/AdminChatPage';

// นำเข้า Component
import HomePage from './components/home-page'; 
import { Navigation } from './components/navigation';
import { ProvincePage } from './components/ProvincePage'; // ✅ นำเข้าหน้า ProvincePage
import { provinces } from './data/mockData'; // ✅ นำเข้าข้อมูลจังหวัด

const Login = () => <div className="p-10 text-center"><h1>หน้า Login</h1></div>;

// ✅ Component ตัวช่วยสำหรับดึงข้อมูลจังหวัดตาม ID จาก URL
const ProvinceRouteWrapper = ({ language }: { language: any }) => {
  const { id } = useParams(); // อ่านค่า id จาก URL (เช่น phuket)
  const navigate = useNavigate();
  
  // หาข้อมูลจังหวัดที่ตรงกับ id
  const provinceData = provinces.find(p => p.id === id);

  // ถ้าไม่เจอจังหวัด ให้แสดงข้อความแจ้งเตือน (หรือ Redirect ไปหน้าแรก)
  if (!provinceData) {
    return <div className="p-20 text-center">ไม่พบข้อมูลจังหวัดที่คุณค้นหา</div>;
  }

  // ส่งข้อมูลเข้า ProvincePage พร้อมฟังก์ชันเปลี่ยนหน้า
  return (
    <ProvincePage 
      province={provinceData}
      language={language}
      onNavigate={(page, data) => {
        if (page === 'home') navigate('/');
        else if (page === 'tour-detail' && data) navigate(`/tour/${data.id}`); // ลิ้งค์ไปหน้าทัวร์ (ถ้ามี)
        else console.log('Navigate to', page);
      }}
    />
  );
};

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [language, setLanguage] = useState<'th' | 'en'>('th');

  return (
    <BrowserRouter>
      <Navigation 
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        userName={user?.fullName || "Guest"}
        onShowTutorial={() => console.log("Show Tutorial")}
        cartCount={0} 
        language={language}
        onToggleLanguage={() => setLanguage(prev => prev === 'th' ? 'en' : 'th')}
      />

      <Routes>
        <Route path="/" element={<HomePage language={language} />} />
        
        {/* ✅ เพิ่ม Route สำหรับหน้าจังหวัด */}
        <Route path="/province/:id" element={<ProvinceRouteWrapper language={language} />} />
        
        {/* Route สำหรับหน้าทัวร์ (เผื่อทำต่อในอนาคต) */}
        <Route path="/tour/:id" element={<div className="p-20 text-center">หน้ารายละเอียดทัวร์ (กำลังพัฒนา)</div>} />

        <Route path="/login" element={<Login />} />
        
        <Route element={<AdminRoute />}>
          <Route path="/admin/chat" element={<AdminChatPage />} />
        </Route>
      </Routes>
      
      <ChatWidget />
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;