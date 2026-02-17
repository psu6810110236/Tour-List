import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // ถ้าไม่ได้ Login หรือ Role ไม่ใช่ ADMIN ให้เด้งไปหน้า Login หรือ Home
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  // ถ้าเป็น Admin จริง ให้เข้าถึงหน้าข้างในได้ (Outlet)
  return <Outlet />;
};

export default AdminRoute;