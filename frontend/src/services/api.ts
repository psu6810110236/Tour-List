import axios from 'axios';

// URL ของ Backend (NestJS รันที่ Port 3000 หรือ Port อื่นที่คุณตั้งไว้)
const API_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tourService = {
  // ค้นหาทัวร์ตาม Filter
  search: (params: { provinceId?: string; minPrice?: string; maxPrice?: string; sort?: string }) => 
    api.get('/tours/search', { params }),

  // ดึงจังหวัดทั้งหมด
  getProvinces: () => api.get('/tours/provinces'),

  // ดึงรายละเอียดทัวร์ตาม ID
  getById: (id: string) => api.get(`/tours/${id}`),
};