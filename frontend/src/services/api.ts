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
  // 🟢 แก้จาก access_token เป็น token ให้ตรงกับ AuthContext
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const tourService = {
  search: (params: { provinceId?: string; minPrice?: string; maxPrice?: string; startDate?: string; sort?: string }) =>
    api.get<Tour[]>('/tours/search', { params }),

  getProvinces: () => api.get<Province[]>('/tours/provinces'),
  getById: (id: string) => api.get<Tour>(`/tours/${id}`),
  createProvince: (data: Partial<Province>) => api.post('/tours/provinces', data),
  createTour: (data: Partial<Tour>) => api.post('/tours', data),
  updateTour: (id: string, data: Partial<Tour>) => api.put(`/tours/${id}`, data),
  deleteTour: (id: string) => api.delete(`/tours/${id}`),
};

export const bookingService = {
  getAllBookings: () => api.get<Booking[]>('/bookings'),
  getMyBookings: () => api.get<Booking[]>('/bookings/my'),
  createBooking: (data: any) => api.post('/bookings', data),
  
  // 🟢 เพิ่มการรับ data (reason) เข้าไป
  updateBookingStatus: (id: string, status: string, reason?: string) => api.patch(`/bookings/${id}/status`, { status, reason }),
  updatePaymentStatus: (id: string, paymentStatus: string, reason?: string) => api.patch(`/bookings/${id}/payment-status`, { paymentStatus, reason }),
  
  deleteBooking: (id: string) => api.delete(`/bookings/${id}`),
  deleteProvince: (id: string) => axios.delete(`http://localhost:3000/provinces/${id}`),
};

// 🟢 เพิ่มส่วนจัดการ Review
export const reviewService = {
  // ดึงรีวิวทั้งหมดของทัวร์นั้นๆ
  getReviewsByTourId: async (tourId: string | number) => {
    const response = await fetch(`${API_URL}/reviews/tour/${tourId}`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
  },

  // ส่งรีวิวใหม่ไปบันทึก
  createReview: async (reviewData: { tourId: string | number; userName: string; rating: number; comment: string }) => {
    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    if (!response.ok) throw new Error('Failed to create review');
    return response.json();
  }
};