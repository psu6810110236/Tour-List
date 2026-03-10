// src/services/api.ts
import axios from 'axios';
import type { Tour, Province, Booking } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 1. สร้าง Instance ของ API
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. เพิ่ม Interceptor เพื่อส่ง Token ไปกับ "ทุก Request" โดยอัตโนมัติ
api.interceptors.request.use((config) => {
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

  // แก้ไขให้ใช้ api instance เพื่อให้ส่ง Token อัตโนมัติ
  getMyBookings: () => api.get<Booking[]>('/bookings/my'),

  createBooking: (data: Partial<Booking>) => api.post('/bookings', data),
  
  updateBookingStatus: (id: string, status: string) => api.patch(`/bookings/${id}/status`, { status }),
  
  deleteBooking: (id: string) => api.delete(`/bookings/${id}`),
};