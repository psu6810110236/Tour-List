import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import AdminRoute from './components/AdminRoute';
import ChatWidget from './components/ChatWidget';
import AdminChatPage from './pages/AdminChatPage';

// 👇 เปลี่ยนการนำเข้าตรงนี้!
// จากเดิม import HomePage from './pages/HomePage';
import HomePage from './components/home-page'; 

// Mock Login
const Login = () => <div className="p-10 text-center"><h1>หน้า Login</h1></div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ✅ เรียกใช้ HomePage ตัวใหม่ */}
          <Route path="/" element={<HomePage />} />
          
          <Route path="/login" element={<Login />} />
          
          <Route element={<AdminRoute />}>
            <Route path="/admin/chat" element={<AdminChatPage />} />
          </Route>
        </Routes>
        
        <ChatWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;