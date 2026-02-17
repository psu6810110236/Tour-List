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
  );
}

export default App;