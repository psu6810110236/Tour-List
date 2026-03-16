import axios from 'axios';
import type { Tour, Province, Booking } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// เพิ่ม Interceptor สำหรับดักจับ Token Expired (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const tourService = {
  search: (params: { provinceId?: string; minPrice?: string; maxPrice?: string; startDate?: string; sort?: string; tripDays?: string }) =>
    api.get<Tour[]>('/tours/search', { params }),

  getProvinces: () => api.get<Province[]>('/tours/provinces'),
  getById: (id: string) => api.get<Tour>(`/tours/${id}`),
  createProvince: (data: Partial<Province>) => api.post('/tours/provinces', data),
  // ✅ แก้เป็น api.patch และใช้ path ที่ถูกต้อง
  updateProvince: (id: string, data: any) => api.patch(`/tours/provinces/${id}`, data),
  createTour: (data: Partial<Tour>) => api.post('/tours', data),
  updateTour: (id: string, data: Partial<Tour>) => api.put(`/tours/${id}`, data),
  deleteTour: (id: string) => api.delete(`/tours/${id}`),
};

export const bookingService = {
  getAllBookings: () => api.get<Booking[]>('/bookings'),
  getMyBookings: () => api.get<Booking[]>('/bookings/my'),
  createBooking: (data: any) => api.post('/bookings', data),
  updateBookingStatus: (id: string, status: string, reason?: string) =>
    api.patch(`/bookings/${id}/status`, { status, reason }),
  updatePaymentStatus: (id: string, paymentStatus: string, reason?: string) =>
    api.patch(`/bookings/${id}/payment-status`, { paymentStatus, reason }),
  deleteBooking: (id: string) => api.delete(`/bookings/${id}`),
  // ✅ แก้เป็น api.delete และลบ http://localhost:3000 ออก
  deleteProvince: (id: string) => api.delete(`/tours/provinces/${id}`),
};

export interface AddToCartPayload {
  tourId: string;
  selectedDate: string;
  pax: number;
  totalPrice: number;
}

export const addToCartAPI = async (payload: AddToCartPayload) => {
  const response = await api.post('/cart/add', payload);
  return response.data;
};

export const userService = {
  // ✅ แก้จาก /auth/me → /users/me (endpoint จริงใน backend)
  getProfile: () => api.get('/users/me'),

  // PATCH /users/me — แก้ชื่อ + เบอร์
  updateProfile: (data: { fullName?: string; phone?: string; profileImage?: string }) =>
    api.patch('/users/me', data),

  // PATCH /users/me/password — เปลี่ยนรหัสผ่าน
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.patch('/users/me/password', data),
};

