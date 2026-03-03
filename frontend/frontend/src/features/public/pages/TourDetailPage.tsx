// src/pages/TourDetailPage.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, Star, Play, Check, X, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

// ✅ ใช้ Path ที่ถูกต้องสำหรับโครงสร้างโปรเจกต์ของคุณ
import { tourService } from '../../../services/api';
import { getLang } from '../../../data/mockData';
import type { Language } from "../../../data/translations";
import { translations } from "../../../data/translations";

// ✅ 1. สร้าง Interface สำหรับแผนการเดินทาง (Itinerary)
interface ItineraryDay {
  day: number;
  title?: string;
  title_th?: string;
  activities?: string[];
  activities_th?: string[];
  [key: string]: unknown; 
}

// ✅ 2. สร้าง Interface สำหรับข้อมูลทัวร์ (Tour) ให้ตรงกับ Database
interface TourDetail {
  id: string | number;
  name?: string;
  name_th?: string;
  province?: string | { name?: string; name_th?: string; [key: string]: unknown };
  duration?: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
  description_th?: string;
  image?: string;
  price?: number;
  maxGroupSize?: string | number;
  highlights?: string[];
  highlights_th?: string[];
  included?: string[];
  included_th?: string[];
  notIncluded?: string[];
  notIncluded_th?: string[];
  itinerary?: ItineraryDay[];
  [key: string]: unknown;
}

interface TourDetailPageProps {
  language?: Language;
}

export default function TourDetailPage({ language = 'th' }: TourDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // ✅ 3. เปลี่ยนจาก useState<any> เป็น useState<TourDetail | null>
  const [tour, setTour] = useState<TourDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [showVideo, setShowVideo] = useState(false);
  
  const t = translations[language].tourDetail;
  const tBook = translations[language].booking;

  // 🟢 ฟังก์ชันดึงข้อมูลทัวร์จาก Database
  useEffect(() => {
    if (!id) return;

    const fetchTourDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        // ยิง API ไปที่ Backend NestJS ของเรา
        const response = await fetch(`http://localhost:3000/api/tours/${id}`);
        
        if (!response.ok) {
           throw new Error('ไม่พบข้อมูลทัวร์นี้ หรือเซิร์ฟเวอร์มีปัญหา');
        }

        const data: TourDetail = await response.json();
        setTour(data);
      } catch (err: unknown) { 
        console.error("Error fetching tour details:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("ไม่สามารถโหลดข้อมูลทัวร์ได้");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTourDetail();
  }, [id]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A699]"></div>
      </div>
    );
  }

  // Error State
  if (error || !tour) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">ขออภัย</h2>
        <p className="text-gray-600">{error || "ไม่พบข้อมูลทัวร์ที่คุณค้นหา"}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#00A699] text-white rounded-xl hover:bg-[#008c81] transition">ย้อนกลับ</button>
      </div>
    );
  }

  // 🟢 จัดการข้อมูลให้ปลอดภัย
  const provinceName = typeof tour.province === 'object' && tour.province !== null
    ? getLang(tour.province, 'name', language) 
    : getLang(tour, 'province', language);

  const currentHighlights = language === 'th' && tour.highlights_th && tour.highlights_th.length > 0 ? tour.highlights_th : (tour.highlights || []);
  const currentItinerary = tour.itinerary || [];
  const currentIncluded = language === 'th' && tour.included_th && tour.included_th.length > 0 ? tour.included_th : (tour.included || []);
  const currentNotIncluded = language === 'th' && tour.notIncluded_th && tour.notIncluded_th.length > 0 ? tour.notIncluded_th : (tour.notIncluded || []);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* --- Hero Section (Video Banner) --- */}
      <div className="relative h-[500px] overflow-hidden tour-card-tutorial">
        <div className="relative w-full h-full bg-gray-900">
          <img 
            src={tour.image || 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800'} 
            alt={getLang(tour, 'name', language)} 
            className="w-full h-full object-cover opacity-80 bg-gray-800" 
          />
           <button onClick={() => setShowVideo(true)} className="absolute inset-0 flex items-center justify-center group">
             <div className="w-24 h-24 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
                 <Play className="w-10 h-10 text-[#FF6B4A] ml-1" fill="currentColor" />
               </div>
             </div>
           </button>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
        
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-8 left-8 md:top-8 md:left-8 flex items-center gap-2 text-white hover:text-white/80 transition bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl pointer-events-auto z-10"
        >
          <ArrowLeft className="w-5 h-5" /> <span>{tBook.back}</span>
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-8 pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 text-white/90 mb-3">
              <MapPin className="w-5 h-5" />
              <span>{provinceName}</span>
              <span className="text-white/60">•</span>
              <Clock className="w-5 h-5" />
              <span>{getLang(tour, 'duration', language) || '-'}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">{getLang(tour, 'name', language)}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-white font-semibold">{tour.rating || 0}</span>
                <span className="text-white/80">({tour.reviewCount || 0} {language === 'th' ? 'รีวิว' : 'reviews'})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          
          {/* --- Left Column: Content (2/3) --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-[#00A699] pl-4">{t.description}</h2>
              <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{getLang(tour, 'description', language)}</p>
            </div>

            {/* Highlights */}
            {currentHighlights.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-l-4 border-[#00A699] pl-4">{t.highlights}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentHighlights.map((highlight: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-6 h-6 bg-[#00A699] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Itinerary */}
            {currentItinerary.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-l-4 border-[#00A699] pl-4">{t.itinerary}</h2>
                <div className="space-y-4">
                  {currentItinerary.map((day: ItineraryDay) => (
                    <div key={day.day} className="border border-gray-200 rounded-2xl overflow-hidden transition-all hover:shadow-md">
                      <button 
                        onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)} 
                        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition bg-white"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#00A699] text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
                            {day.day}
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-gray-900 text-lg">
                              {language === 'th' ? `วันที่ ${day.day}` : `Day ${day.day}`}
                            </div>
                            <div className="text-sm text-gray-500 font-medium">{getLang(day, 'title', language)}</div>
                          </div>
                        </div>
                        {expandedDay === day.day ? <ChevronUp className="w-6 h-6 text-[#00A699]" /> : <ChevronDown className="w-6 h-6 text-gray-400" />}
                      </button>
                      {expandedDay === day.day && (
                        <div className="px-5 pb-6 pt-2 bg-gray-50/80 border-t border-gray-100">
                          <div className="space-y-3 pl-4 border-l-2 border-gray-200 ml-6 mt-2">
                            {((language === 'th' && day.activities_th && day.activities_th.length > 0) ? day.activities_th : (day.activities || [])).map((activity: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-3 relative">
                                <div className="w-3 h-3 bg-[#00A699] rounded-full mt-1.5 absolute -left-[23px] ring-4 ring-white" />
                                <span className="text-gray-700 leading-relaxed">{activity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Included/Not Included */}
            {(currentIncluded.length > 0 || currentNotIncluded.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full">
                  <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2 bg-green-50 w-fit px-4 py-2 rounded-lg">
                    <Check className="w-5 h-5" /> {t.included}
                  </h3>
                  <div className="space-y-3">
                    {currentIncluded.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 text-gray-700">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full">
                  <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2 bg-red-50 w-fit px-4 py-2 rounded-lg">
                    <X className="w-5 h-5" /> {t.notIncluded}
                  </h3>
                  <div className="space-y-3">
                    {currentNotIncluded.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 text-gray-700">
                        <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* --- Right Column: Sidebar (1/3) --- */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              
              {/* Booking Card */}
              <div className="book-button-tutorial bg-white rounded-3xl p-6 shadow-xl border border-gray-100 ring-4 ring-[#00A699]/5 overflow-hidden relative">
                <div className="text-center mb-6 relative z-10">
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-1">{t.startingFrom}</p>
                  <div className="flex items-center justify-center gap-1">
                     <span className="text-4xl font-black text-[#00A699]">฿{Number(tour.price || 0).toLocaleString()}</span>
                     <span className="text-gray-400 text-sm font-normal self-end mb-2">{t.perPerson}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6 relative z-10">
                   {/* Duration */}
                   <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#00A699]">
                         <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Duration</p>
                         <p className="font-bold text-gray-900 text-sm">{getLang(tour, 'duration', language) || '-'}</p>
                      </div>
                   </div>

                   {/* Group Size */}
                   <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#00A699]">
                         <Users className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Group Size</p>
                         <p className="font-bold text-gray-900 text-sm">{tour.maxGroupSize || "Small Groups"}</p>
                      </div>
                   </div>

                   {/* Location */}
                   <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#00A699]">
                         <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Location</p>
                         <p className="font-bold text-gray-900 text-sm">{provinceName}</p>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => navigate(`/booking/${tour.id}`)} 
                  className="w-full bg-[#FF6B4A] hover:bg-[#ff5232] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 transition-all active:scale-[0.98] relative z-10"
                >
                  {t.bookNow}
                </button>
                
                <p className="text-center text-xs text-gray-400 mt-4">
                    Free cancellation up to 24 hours before start
                </p>
              </div>

              {/* Need Help Card */}
              <div className="bg-[#E6F6F5] rounded-3xl p-6 border border-[#00A699]/20">
                 <div className="flex items-start gap-4">
                    <div className="text-2xl">💬</div>
                    <div>
                       <h4 className="font-bold text-[#007A71] mb-1">Need Help?</h4>
                       <p className="text-xs text-[#007A71]/80 leading-relaxed">
                          Contact our support team for custom itineraries or group discounts.
                       </p>
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
           <div className="relative w-full max-w-5xl">
            <button 
              onClick={() => setShowVideo(false)} 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl ring-1 ring-white/10">
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <Play className="w-20 h-20 mx-auto mb-4 opacity-50 text-white" />
                  <p className="text-xl font-medium text-white/80">{language === 'th' ? 'ตัวอย่างวิดีโอ' : 'Video Preview Placeholder'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}