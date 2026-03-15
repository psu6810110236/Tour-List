
export interface Province {
  id: string;
  name: string;      
  name_th: string;   
  tourCount: number;
  image: string;
  description: string;
  description_th: string;
}

export interface ItineraryItem {
  day: number;
  title: string;
  title_th: string;
  activities: string[];
  activities_th: string[];
}

export interface Tour {
  id: string;
  name: string;
  name_th: string;
  description: string;
  description_th: string;
  price: number;
  duration: string;
  duration_th: string;
  isHidden?: boolean;
  historicalBooked: number;
  vehicleType?: string;
  maxCapacity?: number;

  tripType?: string;
  tripDays?: number;
  availableDates?: string[];

  image: string; 
  rating?: number;
  reviewCount?: number;
  tourType?: 'oneday' | 'package'; 
  accommodation?: string;
  bookedSeats?: number;
  
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