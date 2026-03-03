// src/components/home-page.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ เพิ่ม axios สำหรับดึงข้อมูลทัวร์
import {
  Search,
  MapPin,
  ArrowRight,
  TrendingUp
} from "lucide-react";

// ✅ ใช้ Path นี้เพื่อให้ตรงกับโครงสร้างโฟลเดอร์ปัจจุบันของคุณ
import { tourService } from "../../../services/api";
import type { Language } from "../../../data/translations";
import { translations } from "../../../data/translations";

// ✅ 1. Interface สำหรับจังหวัด
interface Province {
  id: string;
  name: string;
  name_th: string;
  tourCount: number;
  image: string;
  description: string;
  description_th: string;
}

// ✅ 2. Interface สำหรับทัวร์
interface Tour {
  id: string | number;
  name: string;
  province: string;
  price: number;
  date?: string;
  description?: string;
}

interface HomePageProps {
  language: Language;
}

export default function HomePage({ language }: HomePageProps) { 
  const navigate = useNavigate();

  // ✅ State สำหรับเก็บข้อมูลจาก API
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [tours, setTours] = useState<Tour[]>([]); 
  
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingTours, setLoadingTours] = useState(true); 

  // 🟢 State สำหรับเก็บคำค้นหา
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ ดึงข้อมูลจาก Backend เมื่อเปิดหน้าเว็บ
  useEffect(() => {
    // 1. ดึงข้อมูลจังหวัด
    const fetchProvinces = async () => {
      try {
        const response = await tourService.getProvinces();
        setProvinces(response.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      } finally {
        setLoadingProvinces(false);
      }
    };

    // 2. ดึงข้อมูลทัวร์ เก็บหน้าแยก
    const fetchTours = async () => {
      try {
        const response = await axios.get('http://localhost:3000/tours'); 
        setTours(response.data.slice(0, 3)); 
      } catch (error) {
        console.error("Error fetching tours:", error);
      } finally {
        setLoadingTours(false);
      }
    };

    fetchProvinces();
    fetchTours();
  }, []);

  const onNavigate = (page: string, data?: Province) => {
    if (page === "provinces") {
      navigate("/provinces");
    } else if (page === "province" && data) {
      navigate(`/province/${data.id}`);
    } else {
      console.log("Navigate to:", page);
    }
  };

  // 🟢 ฟังก์ชันจัดการเมื่อผู้ใช้กดปุ่มค้นหาหรือกด Enter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันหน้าเว็บรีเฟรช

    const trimmedQuery = searchQuery.trim().toLowerCase();

    // ถ้าไม่ได้พิมพ์อะไรเลย ให้ไปหน้ารวมจังหวัด
    if (!trimmedQuery) {
      navigate('/provinces');
      return;
    }

    // ค้นหาว่าคำที่พิมพ์ ตรงกับชื่อจังหวัดที่มีในระบบหรือไม่ (ทั้งภาษาไทยและอังกฤษ)
    const matchedProvince = provinces.find(p => 
      p.name.toLowerCase().includes(trimmedQuery) || 
      p.name_th.toLowerCase().includes(trimmedQuery)
    );

    if (matchedProvince) {
      // ถ้าเจอจังหวัดที่ตรงกัน ให้เด้งไปหน้ารายละเอียดของจังหวัดนั้น
      navigate(`/province/${matchedProvince.id}`);
    } else {
      // ถ้าไม่มีข้อมูลตรงกับที่พิมพ์เลย ให้ไปหน้ารวมจังหวัด
      navigate('/provinces');
    }
  };

  const t = translations[language].hero;
  const h = translations[language].home;
  
  const HERO_BG = "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2639&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden relative">
      
      {/* ===== HERO SECTION ===== */}
      <div className="relative min-h-[550px] md:h-[600px] flex items-center justify-center text-white overflow-hidden py-12 md:py-0">
        <div className="absolute inset-0 z-0">
          <img 
            src={HERO_BG} 
            alt="Amazing Thailand" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto animate-in fade-in zoom-in duration-700 slide-in-from-bottom-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs md:text-sm font-medium mb-6 text-white/90">
              <span>✈️</span>
              <span>{language === 'th' ? 'พร้อมสำหรับการเดินทางหรือยัง?' : 'Ready for your next journey?'}</span>
            </div>
            
            <h1 className="text-3xl md:text-7xl font-bold mb-6 tracking-tight drop-shadow-lg leading-tight">
              {language === 'th' ? (
                <>ค้นพบความมหัศจรรย์ <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A699] to-[#4de4d8]">ประเทศไทย</span></>
              ) : (
                <>Discover Amazing <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A699] to-[#4de4d8]">Thailand</span></>
              )}
            </h1>
            
            <p className="text-base md:text-xl text-white/90 mb-10 leading-relaxed drop-shadow-md px-2">
              {t.subtitle}
            </p>

            <form onSubmit={handleSearch} className="search-bar max-w-2xl mx-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-2 md:p-2.5 flex flex-col md:flex-row items-center gap-2 md:gap-3 transform transition-all hover:scale-[1.01]">
              <div className="flex items-center w-full px-2">
                <Search className="w-5 h-5 md:w-6 md:h-6 text-[#00A699] ml-2 md:ml-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="flex-1 py-3 md:py-4 px-2 text-gray-900 placeholder:text-gray-400 outline-none bg-transparent text-base md:text-lg"
                />
              </div>
              <button 
                type="submit"
                className="w-full md:w-auto bg-[#FF6B4A] hover:bg-[#ff5232] text-white px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition shadow-lg shadow-orange-200"
              >
                {t.searchBtn}
              </button>
            </form>

          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-16 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border border-gray-100">
          <div className="text-center group transition duration-300">
            <div className="text-4xl md:text-5xl font-bold text-[#00A699] mb-1">83+</div>
            <p className="text-gray-500 font-medium text-sm md:text-base">{language === 'th' ? 'ทัวร์ยอดนิยม' : 'Amazing Tours'}</p>
          </div>
          <div className="text-center md:border-l md:border-r border-gray-100 group transition duration-300 py-4 md:py-0">
            <div className="text-4xl md:text-5xl font-bold text-[#007AFF] mb-1">77</div>
            <p className="text-gray-500 font-medium text-sm md:text-base">{language === 'th' ? 'จังหวัดทั่วไทย' : 'Provinces'}</p>
          </div>
          <div className="text-center group transition duration-300">
            <div className="text-4xl md:text-5xl font-bold text-[#FF6B4A] mb-1">4.8★</div>
            <p className="text-gray-500 font-medium text-sm md:text-base">{language === 'th' ? 'คะแนนรีวิวเฉลี่ย' : 'Average Rating'}</p>
          </div>
        </div>
      </div>

      {/* Province Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {h.exploreByProvince}
            </h2>
            <p className="text-gray-600 text-base md:text-lg">
              {language === 'th' ? 'เลือกจังหวัดที่คุณสนใจเพื่อค้นหาทัวร์และประสบการณ์สุดพิเศษ' : 'Select a province to discover its unique tours and experiences'}
            </p>
          </div>
          <button 
            onClick={() => onNavigate("provinces")}
            className="flex items-center self-start md:self-auto gap-2 text-[#00A699] font-bold hover:text-[#008c81] transition px-4 py-2 hover:bg-[#00A699]/5 rounded-xl border border-[#00A699]/10"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm md:text-base">{language === 'th' ? 'ดูจุดหมายทั้งหมด' : 'View All Destinations'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loadingProvinces ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A699]"></div>
          </div>
        ) : (
          <div className="province-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {provinces.map((province) => (
              <button
                key={province.id}
                onClick={() => onNavigate("province", province)}
                className="group bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 text-left"
              >
                <div className="relative h-56 md:h-64 overflow-hidden">
                  <img
                    src={province.image}
                    alt={province.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 text-white mb-2">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold tracking-wide">
                        {language === 'th' ? province.name_th : province.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/90 text-xs md:text-sm font-medium bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                        {province.tourCount} {h.toursAvailable}
                      </span>
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-5 md:p-6">
                  <p className="text-gray-600 text-xs md:text-sm line-clamp-2 leading-relaxed">
                    {language === 'th' ? province.description_th : province.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== RECOMMENDED TOURS SECTION ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            {language === 'th' ? 'ทัวร์แนะนำสำหรับคุณ' : 'Recommended Tours'}
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            {language === 'th' ? 'แพ็กเกจทัวร์ยอดฮิตที่เปิดจองในขณะนี้' : 'Popular tour packages available right now'}
          </p>
        </div>

        {loadingTours ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF6B4A]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {tours.map((tour) => (
              <div key={tour.id} className="bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">{tour.name}</h3>
                  <p className="text-gray-500 mb-4 flex items-center gap-2 font-medium">
                    <MapPin className="w-4 h-4 text-[#00A699]" />
                    {tour.province}
                  </p>
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <p className="text-gray-500 text-sm mb-1">{language === 'th' ? 'ราคาเริ่มต้น' : 'Starting from'}</p>
                    <p className="text-[#FF6B4A] font-bold text-2xl mb-4">฿{tour.price.toLocaleString()}</p>
                    <button
                      onClick={() => navigate(`/tour/${tour.id}`)}
                      className="w-full bg-[#00A699] hover:bg-[#008c81] text-white py-3 rounded-xl font-bold transition flex justify-center items-center gap-2"
                    >
                      {language === 'th' ? 'ดูรายละเอียดทัวร์' : 'View Tour Details'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-white py-12 md:py-24 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-[#00A699] font-bold tracking-wider uppercase text-xs md:text-sm mb-2 block">
              {language === 'th' ? 'คำสัญญาของเรา' : 'Our Promise'}
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === 'th' ? 'ทำไมต้องเลือก RoamHub Tour?' : 'Why Choose RoamHub Tour?'}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {[
              { icon: "🏆", title: language === 'th' ? "ทัวร์ดีที่สุด" : "Best Tours", desc: language === 'th' ? "คัดสรรประสบการณ์ทั่วไทย" : "Handpicked experiences", color: "bg-[#00A699]" },
              { icon: "💳", title: language === 'th' ? "จองง่าย" : "Easy Booking", desc: language === 'th' ? "ขั้นตอนการชำระเงินที่ปลอดภัย" : "Simple and secure process", color: "bg-[#007AFF]" },
              { icon: "🎯", title: language === 'th' ? "ไกด์ท้องถิ่น" : "Local Guides", desc: language === 'th' ? "เชี่ยวชาญและบริการเป็นกันเอง" : "Expert knowledge", color: "bg-[#FF6B4A]" },
              { icon: "⭐", title: language === 'th' ? "ยอดนิยม" : "Top Rated", desc: language === 'th' ? "ได้รับความไว้วางใจจากนักท่องเที่ยว" : "Trusted by thousands", color: "bg-[#10b981]" },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className={`w-14 h-14 md:w-20 md:h-20 ${item.color}/10 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6`}>
                  <span className="text-2xl md:text-4xl">{item.icon}</span>
                </div>
                <h3 className="text-base md:text-xl font-bold text-gray-900 mb-2 md:mb-3">{item.title}</h3>
                <p className="hidden md:block text-gray-600 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-16 md:py-24 overflow-hidden px-4">
        <div className="absolute inset-0 z-0">
           <img src="https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?q=80&w=2670&auto=format&fit=crop" alt="CTA" className="w-full h-full object-cover"/>
           <div className="absolute inset-0 bg-[#00A699]/90 mix-blend-multiply" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center text-white">
          <h2 className="text-2xl md:text-5xl font-bold mb-6">
            {language === 'th' ? 'พร้อมที่จะเริ่มการผจญภัยหรือยัง?' : 'Ready to Start Your Adventure?'}
          </h2>
          <button
            onClick={() => onNavigate("provinces")}
            className="bg-white text-[#00A699] px-8 py-4 md:px-10 md:py-5 rounded-2xl font-bold text-base md:text-lg hover:bg-gray-100 transition shadow-2xl inline-flex items-center gap-3"
          >
            {language === 'th' ? 'ดูจังหวัดทั้งหมด' : 'Explore All Provinces'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-[#0f172a] text-white pt-20 pb-10 overflow-hidden">
  {/* 💡 เอฟเฟกต์แสงฟุ้งด้านหลัง (Glow Effect) */}
  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00A699]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
  
  <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-16">
      
      {/* 🏛️ Column 1: Brand Identity (4 Units) */}
      <div className="lg:col-span-4 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-xl shadow-[#00A699]/20 flex items-center justify-center p-2 transform hover:rotate-6 transition-transform">
      
          </div>
          <div>
            <h2 className="text-2xl-[#00A699] ">
              RoamHub <span className="text-[#00A699]">Tour</span>
            </h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#00A699] font-bold">Premium Travel Experience</p>
          </div>
        </div>
        
        <p className="text-gray-400 leading-relaxed text-sm max-w-sm">
          {language === 'th' 
            ? 'ยกระดับการเดินทางของคุณด้วยบริการทัวร์ระดับพรีเมียม คัดสรรสถานที่ที่ดีที่สุดเพื่อสร้างความทรงจำที่ไม่รู้ลืม' 
            : 'Elevate your journey with premium tour services, handpicking the best locations to create unforgettable memories.'}
        </p>

        {/* Social Icons with Glass effect */}
        <div className="flex gap-4">
          {['Facebook', 'Instagram', 'Youtube'].map((social) => (
            <div key={social} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#00A699] hover:border-[#00A699] transition-all cursor-pointer group">
              <span className="text-[10px] font-bold group-hover:scale-110 transition-transform">{social[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 🔗 Column 2 & 3: Navigation (4 Units) */}
      <div className="lg:col-span-4 grid grid-cols-2 gap-8">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-8 border-l-2 border-[#00A699] pl-4">
            {language === 'th' ? 'สำรวจ' : 'Explore'}
          </h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            {['Destinations', 'Popular Tours', 'Private Trips', 'Activities'].map(item => (
              <li key={item} className="hover:text-[#00A699] hover:translate-x-2 transition-all cursor-pointer flex items-center gap-2 group">
                <span className="w-0 h-[1px] bg-[#00A699] group-hover:w-3 transition-all"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-8 border-l-2 border-[#00A699] pl-4">
            {language === 'th' ? 'บริการ' : 'Services'}
          </h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            {['Booking Policy', 'Partner with Us', 'Help Center', 'Terms'].map(item => (
              <li key={item} className="hover:text-[#00A699] hover:translate-x-2 transition-all cursor-pointer flex items-center gap-2 group">
                <span className="w-0 h-[1px] bg-[#00A699] group-hover:w-3 transition-all"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ✉️ Column 4: Premium Newsletter (4 Units) */}
      <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
        <h4 className="text-lg font-bold mb-2">{language === 'th' ? 'รับสิทธิพิเศษก่อนใคร' : 'Exclusive Offers'}</h4>
        <p className="text-gray-400 text-xs mb-6">
          {language === 'th' ? 'สมัครสมาชิกเพื่อรับโปรโมชั่นลับเฉพาะคุณ' : 'Join our club for members-only deals and travel tips.'}
        </p>
        <form className="relative">
          <input 
            type="email" 
            placeholder="your@email.com" 
            className="w-full bg-[#1e293b] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A699] transition-all"
          />
          <button className="absolute right-2 top-2 bottom-2 bg-[#00A699] hover:bg-[#008c81] px-6 rounded-xl font-bold text-sm shadow-lg shadow-[#00A699]/20 transition-all active:scale-95">
            {language === 'th' ? 'สมัคร' : 'Join'}
          </button>
        </form>
      </div>
    </div>

    {/* 📋 Footer Bottom */}
    <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="text-gray-500 text-[11px] font-medium tracking-wide">
        © 2026 <span className="text-gray-300">ROAMHUB TOUR</span>. UNIVERSITY FIGMA ASSIGNMENT PROJECT
      </div>
      <div className="flex items-center gap-8">
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" className="h-4 opacity-30 grayscale hover:grayscale-0 transition-all cursor-pointer" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 opacity-30 grayscale hover:grayscale-0 transition-all cursor-pointer" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 opacity-30 grayscale hover:grayscale-0 transition-all cursor-pointer" />
      </div>
    </div>
  </div>
</footer>
    </div>
  );
}