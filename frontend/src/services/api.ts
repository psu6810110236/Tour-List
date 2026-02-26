// src/services/api.ts
import axios from 'axios';
// ✅ Import Type มาใช้
import type { Tour, Province, Booking } from '../types'; 

const API_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tourService = {
  // ใส่ Type ให้ params
  search: (params: { provinceId?: string; minPrice?: string; maxPrice?: string; sort?: string }) => 
    api.get<Tour[]>('/tours/search', { params }), // บอกว่า return เป็น Array ของ Tour
    
  getProvinces: () => api.get<Province[]>('/tours/provinces'),
  
  getById: (id: string) => api.get<Tour>(`/tours/${id}`),
  
  createProvince: (data: Partial<Province>) => api.post('/tours/provinces', data),
  
  // ✅ เปลี่ยนจาก data: any เป็น data: Partial<Tour> (Partial แปลว่าส่งข้อมูลมาไม่ครบทุก field ก็ได้)
  createTour: (data: Partial<Tour>) => api.post('/tours', data),
  
  updateTour: (id: string, data: Partial<Tour>) => api.put(`/tours/${id}`, data),
  
  deleteTour: (id: string) => api.delete(`/tours/${id}`),
};

export const bookingService = {
  getAllBookings: () => api.get<Booking[]>('/bookings'), // ✅ return Booking[]
  updateBookingStatus: (id: string, status: string) => api.patch(`/bookings/${id}/status`, { status }),
  deleteBooking: (id: string) => api.delete(`/bookings/${id}`),
};