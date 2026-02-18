<<<<<<< HEAD
import ChatWidget from './components/ChatWidget';
import AdminChatPage from './pages/AdminChatPage';

function App() {
  // 👇 ตรวจสอบ URL ว่าถ้าลงท้ายด้วย /admin ให้แสดงหน้าแอดมิน
  const isAdminPage = window.location.pathname === '/admin';

  if (isAdminPage) {
    return <AdminChatPage />;
  }

  // ถ้าไม่ใช่หน้าแอดมิน ให้แสดงหน้า Landing Page ปกติ
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 relative">
      <header className="bg-white p-4 shadow-sm flex justify-between items-center px-10">
        <h1 className="text-2xl font-bold text-blue-600">RoamHub Tour</h1>
        <nav className="space-x-4 text-gray-600">
          <a href="#" className="hover:text-blue-600">หน้าแรก</a>
          <a href="#" className="hover:text-blue-600">แพ็คเกจทัวร์</a>
        </nav>
      </header>

      <main className="container mx-auto mt-20 text-center px-4">
        <h2 className="text-5xl font-extrabold text-gray-800 mb-6 drop-shadow-sm">
          ค้นพบความมหัศจรรย์ของ<span className="text-blue-600">ประเทศไทย</span>
        </h2>
        <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
          สัมผัสความงามของวัฒนธรรม ธรรมชาติ และการผจญภัยที่เราคัดสรรมาเพื่อคุณโดยเฉพาะ
        </p>
        <button className="bg-orange-500 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-orange-600 transition">
          จองเลยตอนนี้
        </button>
      </main>

      {/* Chat Widget สำหรับลูกค้า */}
      <ChatWidget />
    </div>
=======
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminRoute from './components/AdminRoute';

// ตัวอย่าง Component หน้าต่างๆ
const Home = () => <div>Home Page</div>;
const Login = () => <div>Login Page (ต้องทำ Form)</div>;
const AdminDashboard = () => <div>Welcome Admin! Secret Data Here.</div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* ✅ ส่วนที่ป้องกันหน้า Admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            {/* เพิ่มหน้า Admin อื่นๆ ตรงนี้ได้เลย */}
          </Route>
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
>>>>>>> f5a12176374a0cea49b7c8c7dfcca5fa9d40e7e5
  );
}

export default App;