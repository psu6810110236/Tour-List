// src/components/home-page.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  ArrowRight,
  TrendingUp
} from "lucide-react";
// ✅ เปลี่ยนจาก mockData เป็น service ที่เชื่อม API
import { tourService } from "../../../services/api";
import type { Language } from "../../../data/translations";
import { translations } from "../../../data/translations";

// ✅ สร้าง Interface ให้ตรงกับข้อมูลที่จะได้รับจาก Backend
interface Province {
  id: string;
  name: string;
  name_th: string;
  tourCount: number;
  image: string;
  description: string;
  description_th: string;
}

interface HomePageProps {
  language: Language;
}

export default function HomePage({ language }: HomePageProps) { 
  const navigate = useNavigate();

  // ✅ สร้าง State สำหรับเก็บข้อมูลจริงจาก API
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ ดึงข้อมูลจังหวัดจาก Backend เมื่อเปิดหน้าเว็บ
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await tourService.getProvinces();
        setProvinces(response.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  const onNavigate = (page: string, data?: any) => {
    if (page === "provinces") {
      navigate("/provinces");
    } else if (page === "province" && data) {
      navigate(`/province/${data.id}`);
    } else {
      console.log("Navigate to:", page);
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

            <div className="search-bar max-w-2xl mx-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-2 md:p-2.5 flex flex-col md:flex-row items-center gap-2 md:gap-3 transform transition-all hover:scale-[1.01]">
              <div className="flex items-center w-full px-2">
                <Search className="w-5 h-5 md:w-6 md:h-6 text-[#00A699] ml-2 md:ml-4" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  className="flex-1 py-3 md:py-4 px-2 text-gray-900 placeholder:text-gray-400 outline-none bg-transparent text-base md:text-lg"
                />
              </div>
              <button className="w-full md:w-auto bg-[#FF6B4A] hover:bg-[#ff5232] text-white px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition shadow-lg shadow-orange-200">
                {t.searchBtn}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-16 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border border-gray-100">
          <div className="text-center group transition duration-300">
            <div className="text-4xl md:text-5xl font-bold text-[#00A699] mb-1">
              83+
            </div>
            <p className="text-gray-500 font-medium text-sm md:text-base">{language === 'th' ? 'ทัวร์ยอดนิยม' : 'Amazing Tours'}</p>
          </div>
          <div className="text-center md:border-l md:border-r border-gray-100 group transition duration-300 py-4 md:py-0">
            <div className="text-4xl md:text-5xl font-bold text-[#007AFF] mb-1">
              77
            </div>
            <p className="text-gray-500 font-medium text-sm md:text-base">{language === 'th' ? 'จังหวัดทั่วไทย' : 'Provinces'}</p>
          </div>
          <div className="text-center group transition duration-300">
            <div className="text-4xl md:text-5xl font-bold text-[#FF6B4A] mb-1">
              4.8★
            </div>
            <p className="text-gray-500 font-medium text-sm md:text-base">{language === 'th' ? 'คะแนนรีวิวเฉลี่ย' : 'Average Rating'}</p>
          </div>
        </div>
      </div>

      {/* Province Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
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

        {/* ✅ Loading State Check */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A699]"></div>
          </div>
        ) : (
          /* Province Cards Grid */
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

      {/* Why Choose Us Section */}
      <div className="bg-white py-12 md:py-24">
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
      <footer className="bg-gray-900 text-white py-10 md:py-12 border-t border-gray-800 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6 md:mb-8 opacity-50">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-lg flex items-center justify-center text-lg md:text-xl">🏝️</div>
             <span className="text-lg md:text-xl font-bold tracking-wider">RoamHub Tour</span>
          </div>
          <p className="text-gray-400 mb-4 font-light text-xs md:text-sm">
            {language === 'th' ? '🎓 นี่คือโปรโตไทป์เพื่อการศึกษา' : '🎓 This is a high-fidelity UI prototype for academic purposes'}
          </p>
          <p className="text-gray-600 text-[10px] md:text-xs">
            © 2026 RoamHub Tour - University Figma Assignment Project
          </p>
        </div>
      </footer>
    </div>
  );
}