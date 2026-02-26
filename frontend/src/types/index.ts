// src/types/index.ts

// ข้อมูลจังหวัด
export interface Province {
  id: string;
  name: string;      // ชื่อภาษาอังกฤษ
  name_th: string;   // ชื่อภาษาไทย
  tourCount: number;
  image: string;
  description: string;
  description_th: string;
}

// กิจกรรมในแต่ละวัน (Itinerary)
export interface ItineraryItem {
  day: number;
  title: string;
  title_th: string;
  activities: string[];
  activities_th: string[];
}

// ข้อมูลทัวร์ (ตรงกับ Backend Tour Entity)
export interface Tour {
  id: string;
  name: string;
  name_th: string;
  description: string;
  description_th: string;
  price: number;
  duration: string;
  duration_th: string;
  image: string; // URL รูปภาพหลัก
  rating?: number;
  reviewCount?: number;
  
  // Relations (บางครั้ง backend ส่งมาแค่ ID หรือส่งมาทั้ง Object)
  provinceId: string;
  province?: Province | string; // ยืดหยุ่นรองรับทั้ง 2 แบบ
  
  highlights: string[];
  highlights_th: string[];
  included: string[];
  included_th: string[];
  notIncluded: string[];
  notIncluded_th: string[];
  
  itinerary: ItineraryItem[];
}

// ข้อมูลการจอง (Booking)
export interface Booking {
  id: string;
  userId: string;
  tourId: string;
  bookingDate: string; // ISO Date String
  travelDate: string;
  travelers: number;
  totalPrice: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentSlip?: string; // URL สลิป (ถ้ามี)
  
  // Snapshot ข้อมูลตอนจอง (เผื่อทัวร์เปลี่ยนราคา)
  tourNameSnapshot: string;
  tourNameSnapshot_th?: string;
  
  // Optional relations
  tour?: Tour;
  user?: any; // ถ้ายังไม่ได้ทำ Interface User ใช้ any ไปก่อนชั่วคราว
}