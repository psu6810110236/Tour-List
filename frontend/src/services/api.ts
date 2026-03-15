// src/services/api.ts
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

export const tourService = {
  search: (params: { provinceId?: string; minPrice?: string; maxPrice?: string; startDate?: string; sort?: string; tripDays?: string }) =>
    api.get<Tour[]>('/tours/search', { params }),

  getProvinces: () => api.get<Province[]>('/tours/provinces'),
  getById: (id: string) => api.get<Tour>(`/tours/${id}`),
  createProvince: (data: Partial<Province>) => api.post('/tours/provinces', data),
  updateProvince: (id: string, data: any) => axios.patch(`${API_URL}/provinces/${id}`, data),
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
  deleteProvince: (id: string) => axios.delete(`http://localhost:3000/provinces/${id}`),
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
  updateProfile: (data: { fullName?: string; phone?: string }) =>
    api.patch('/users/me', data),

  // PATCH /users/me/password — เปลี่ยนรหัสผ่าน
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.patch('/users/me/password', data),
};