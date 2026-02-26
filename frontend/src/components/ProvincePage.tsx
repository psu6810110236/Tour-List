// src/components/ProvincePage.tsx

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Filter,
  DollarSign,
  Star,
  TrendingUp,
  X
} from "lucide-react";

import { getLang } from "../data/mockData";
import type { Province } from "../data/mockData";
import type { Language } from "../data/translations";
import { translations } from "../data/translations";

// ✅ 1. สร้าง Interface สำหรับ Tour เพื่อลบ Type 'any' ออก
interface Tour {
  id: string | number;
  name?: string;
  name_th?: string;
  description?: string;
  description_th?: string;
  price: number | string;
  image?: string;
  rating?: number;
  reviewCount?: number;
  duration?: string;
  duration_th?: string;
  [key: string]: unknown;
}

interface ProvincePageProps {
  province: Province;
  onNavigate: (page: string, data?: unknown) => void;
  language: Language;
}

export function ProvincePage({ province, onNavigate, language }: ProvincePageProps) {
  // ✅ 2. เปลี่ยนจาก any[] เป็น Tour[]
  const [tours, setTours] = useState<Tour[]>([]); 
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    minPrice: "", maxPrice: "", sortBy: "popular",
  });

  const t = translations[language].provinceDetail;
  const tHome = translations[language].home;
  const tBooking = translations[language].booking;

  // 🟢 3. อัปเดตฟังก์ชันดึงข้อมูลให้ส่ง Filter ไปให้ Backend API ประมวลผล
  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        // ใช้ URLSearchParams เพื่อจัดกลุ่มตัวกรองส่งไปหา Backend
        const params = new URLSearchParams();
        
        // ส่ง ID จังหวัด (หรืออาจจะเปลี่ยนเป็น province.name แล้วแต่ Backend ออกแบบ)
        params.append('provinceId', province.id);
        
        // ถ้ามีการกรอกราคา ให้แนบไปด้วย
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        
        // แนบการจัดเรียง (price_asc, price_desc, popular)
        if (filters.sortBy) params.append('sortBy', filters.sortBy);

        // ยิง API ไปที่ Search Endpoint ของ Backend 
        // (เช่น http://localhost:3000/api/tours/search?provinceId=1&minPrice=1000...)
        const response = await fetch(`http://localhost:3000/api/tours/search?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const fetchedTours: Tour[] = await response.json();
        
        // ไม่ต้อง Filter หรือ Sort ฝั่ง Frontend แล้ว (Backend จัดการให้เสร็จ)
        setTours(fetchedTours);
      } catch (error) {
        console.error("Failed to fetch tours", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [province.id, filters]); // เมื่อ filters เปลี่ยน API จะถูกเรียกใหม่ทันที

  const toggleFilter = (name: string) => {
    setActiveFilter(activeFilter === name ? null : name);
  };

  const applyPriceFilter = (min: string, max: string) => {
    setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }));
    setActiveFilter(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HERO SECTION ===== */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={province.image || 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800'}
          alt={getLang(province, "name", language)}
          className="w-full h-full object-cover bg-gray-200"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <button
          onClick={() => onNavigate("home")}
          className="absolute top-8 left-8 flex items-center gap-2 text-white hover:text-white/80 transition bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl z-10"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{tBooking.back}</span>
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 text-white/90 mb-3">
              <MapPin className="w-6 h-6" />
              <span className="text-lg">
                {language === "th" ? "ประเทศไทย" : "Thailand"}
              </span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              {getLang(province, "name", language)}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mb-4 leading-relaxed">
              {getLang(province, "description", language)}
            </p>
            <div className="flex items-center gap-4 text-white">
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                {tours.length} {tHome.toursAvailable}
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                4.8{" "}
                {language === "th" ? "คะแนนเฉลี่ย" : "Average Rating"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FILTERS BAR ===== */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl font-medium text-gray-700">
              <Filter className="w-4 h-4" />
              {language === "th" ? "ตัวกรอง:" : "Filters:"}
            </div>

            <div className="relative">
              <button
                onClick={() => toggleFilter('price')}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition flex items-center gap-2 border ${activeFilter === 'price' || filters.minPrice || filters.maxPrice
                    ? "bg-[#00A699]/10 text-[#00A699] border-[#00A699]"
                    : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                  }`}
              >
                <DollarSign className="w-4 h-4" />
                {language === "th" ? "ช่วงราคา" : "Price Range"}
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-[#00A699]" />
                )}
              </button>

              {activeFilter === 'price' && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-40 animate-in fade-in zoom-in-95 duration-200">
                  <h4 className="font-bold text-gray-900 mb-3">{language === 'th' ? 'กำหนดช่วงราคา (บาท)' : 'Set Price Range (THB)'}</h4>
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="number"
                      placeholder="Min"
                      id="minPriceInput"
                      defaultValue={filters.minPrice}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A699]"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      id="maxPriceInput"
                      defaultValue={filters.maxPrice}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A699]"
                    />
                  </div>
                  <div className="flex justify-between gap-2">
                    <button
                      onClick={() => {
                        setFilters(prev => ({ ...prev, minPrice: "", maxPrice: "" }));
                        setActiveFilter(null);
                      }}
                      className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
                    >
                      {language === 'th' ? 'ล้างค่า' : 'Reset'}
                    </button>
                    <button
                      onClick={() => {
                        const min = (document.getElementById('minPriceInput') as HTMLInputElement).value;
                        const max = (document.getElementById('maxPriceInput') as HTMLInputElement).value;
                        applyPriceFilter(min, max);
                      }}
                      className="px-4 py-2 bg-[#00A699] text-white rounded-lg text-sm font-bold hover:bg-[#008c81]"
                    >
                      {language === 'th' ? 'นำไปใช้' : 'Apply'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setFilters(prev => ({
                ...prev,
                sortBy: prev.sortBy === 'price_asc' ? 'price_desc' : 'price_asc'
              }))}
              className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl font-medium text-gray-700 whitespace-nowrap transition flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              {filters.sortBy === 'price_asc'
                ? (language === "th" ? "ราคา: ต่ำ -> สูง" : "Price: Low to High")
                : filters.sortBy === 'price_desc'
                  ? (language === "th" ? "ราคา: สูง -> ต่ำ" : "Price: High to Low")
                  : (language === "th" ? "ยอดนิยม" : "Most Popular")
              }
            </button>
          </div>

          {(filters.minPrice || filters.maxPrice) && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 animate-in slide-in-from-top-2">
              <span>Active: </span>
              <span className="bg-[#00A699]/10 text-[#00A699] px-2 py-1 rounded-md flex items-center gap-1">
                Price: {filters.minPrice || '0'} - {filters.maxPrice || '∞'}
                <button onClick={() => applyPriceFilter("", "")}><X className="w-3 h-3" /></button>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ===== TOURS LIST ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t.toursIn} {getLang(province, "name", language)}
          </h2>
          <p className="text-gray-600">
            {loading ? "..." : tours.length}{" "}
            {language === "th"
              ? "ประสบการณ์สุดพิเศษรอคุณอยู่"
              : "amazing experiences waiting for you"}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-3xl h-64 animate-pulse bg-gray-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tours.map((tour) => (
              <button
                key={tour.id}
                onClick={() => onNavigate("tour-detail", tour)}
                className="tour-card group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left"
              >
                <div className="flex flex-col md:flex-row h-full">
                  <div className="relative md:w-64 h-56 md:h-auto overflow-hidden flex-shrink-0">
                    <img
                      src={tour.image || 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800'}
                      alt={getLang(tour, "name", language)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 bg-gray-200"
                    />
                    <div className="absolute top-4 left-4 bg-[#FF6B4A] text-white px-3 py-1 rounded-xl text-sm font-semibold shadow-sm">
                      {getLang(tour, "duration", language) || '1 Day'}
                    </div>
                  </div>

                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#00A699] transition line-clamp-2">
                          {getLang(tour, "name", language)}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{getLang(province, "name", language)}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {getLang(tour, "description", language)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-gray-900">{tour.rating || 0}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          ({tour.reviewCount || 0} {language === "th" ? "รีวิว" : "reviews"})
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">{t.startingFrom}</div>
                        <div className="text-2xl font-bold text-[#00A699]">
                          ฿{Number(tour.price || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && tours.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm mt-8">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {language === "th" ? "ไม่พบทัวร์ตามเงื่อนไข" : "No tours found"}
            </h3>
            <button
              onClick={() => applyPriceFilter("", "")}
              className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition"
            >
              {language === "th" ? "ล้างตัวกรอง" : "Clear Filters"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}