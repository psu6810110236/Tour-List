// src/services/api.ts
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tourService = {
  search: (params: { provinceId?: string; minPrice?: string; maxPrice?: string; sort?: string }) => 
    api.get('/tours/search', { params }),
  getProvinces: () => api.get('/tours/provinces'),
  getById: (id: string) => api.get(`/tours/${id}`),
  createProvince: (data: any) => api.post('/tours/provinces', data),
  createTour: (data: any) => api.post('/tours', data),
  updateTour: (id: string, data: any) => api.put(`/tours/${id}`, data),
  deleteTour: (id: string) => api.delete(`/tours/${id}`),
};

export const bookingService = {
  getAllBookings: () => api.get('/bookings'),
  updateBookingStatus: (id: string, status: string) => api.patch(`/bookings/${id}/status`, { status }),
};