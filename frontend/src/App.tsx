import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminRoute from './components/AdminRoute';
import ChatWidget from './components/ChatWidget';
import AdminChatPage from './pages/AdminChatPage';

// นำเข้า Component
import HomePage from './components/home-page'; 
import { Navigation } from './components/navigation';

const Login = () => <div className="p-10 text-center"><h1>หน้า Login</h1></div>;

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  
  // ✅ 1. ย้าย State ภาษามาไว้ที่ App (จุดสูงสุด) เพื่อคุมทั้งแอป
  const [language, setLanguage] = useState<'th' | 'en'>('th');

  return (
    <BrowserRouter>
      <Navigation 
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        userName={user?.fullName || "Guest"}
        onShowTutorial={() => console.log("Show Tutorial")}
        cartCount={0} 
        // ✅ 2. ส่งค่าและฟังก์ชันเปลี่ยนภาษาให้ Navigation
        language={language}
        onToggleLanguage={() => setLanguage(prev => prev === 'th' ? 'en' : 'th')}
      />

      <Routes>
        {/* ✅ 3. ส่ง language prop ไปให้ HomePage */}
        <Route path="/" element={<HomePage language={language} />} />
        
        <Route path="/login" element={<Login />} />
        
        <Route element={<AdminRoute />}>
          <Route path="/admin/chat" element={<AdminChatPage />} />
          {/* คุณสามารถเพิ่มหน้า Admin อื่นๆ เช่น Dashboard ตรงนี้ได้ */}
        </Route>
      </Routes>
      
      {/* สามารถส่ง language ให้ ChatWidget ได้ด้วยถ้าต้องการให้แชทเปลี่ยนภาษาตาม */}
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