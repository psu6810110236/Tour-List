// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';       // Import Component ที่สร้างใหม่
import Register from './pages/Register'; // Import Component ที่สร้างใหม่
import AdminRoute from './components/AdminRoute';

// Mock Component
const Home = () => (
    <div className="p-10">
        <h1 className="text-2xl">หน้าแรก (ทัวร์ทั้งหมด)</h1>
        <p>ทุกคนเข้าหน้านี้ได้</p>
        <a href="/booking" className="text-blue-500 underline mt-4 block">ทดลองกดจอง (ต้อง Login)</a>
    </div>
);

const BookingPage = () => <div>หน้าจองทัวร์ (สำหรับสมาชิกเท่านั้น)</div>;
const AdminDashboard = () => <div>Welcome Admin!</div>;

// ✅ Component ช่วยป้องกัน Route
const PrivateRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  // ถ้าไม่มี user ให้เด้งไปหน้า login
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ✅ Route สาธารณะ (ไม่ต้อง Login) */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* ✅ Route ที่ต้อง Login ก่อน (เช่น การจอง) */}
          <Route element={<PrivateRoute />}>
             <Route path="/booking" element={<BookingPage />} />
             <Route path="/profile" element={<div>User Profile</div>} />
          </Route>

          {/* ✅ Route ของ Admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;