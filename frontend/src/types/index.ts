
export interface Province {
  id: string;
  name: string;      
  name_th: string;   
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
  
  vehicleType?: string;
  maxCapacity?: number;

  // 🌟 [เพิ่มใหม่]
  tripType?: string;
  availableDates?: string[];

  image: string; // URL รูปภาพหลัก
  rating?: number;
  reviewCount?: number;
  
  provinceId: string;
  province?: Province | string; 
  
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
  tourId: number;
  bookingDate: string; 
  travelDate: string;
  travelers: number;
  totalPrice: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentSlip?: string; 
  
  tourNameSnapshot: string;
  tourNameSnapshot_th?: string;
  
  tour?: Tour;
  user?: any;
  province?: any;
}