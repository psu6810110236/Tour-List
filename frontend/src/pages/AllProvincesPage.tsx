// src/pages/AllProvincesPage.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ArrowRight, Search, Compass } from "lucide-react";

interface Province {
  id: string;
  name: string;
  name_th: string;
  description?: string;
  description_th?: string;
  image?: string;
  tourCount?: number;
}

interface AllProvincesPageProps {
  language?: "th" | "en";
}

export default function AllProvincesPage({ language = "th" }: AllProvincesPageProps) {
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        // 🟢 ยิง API ไปที่ Backend ของเรา (เช็ค URL ให้ตรงกับพอร์ต Backend)
        const response = await fetch("http://localhost:3000/provinces");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("ข้อมูลจังหวัดที่ได้จาก API:", data); // ปริ้นดูข้อมูลใน Console (F12)

        // ตรวจสอบว่า Backend ส่งมาเป็น Array ตรงๆ หรือมี Object ครอบ
        if (Array.isArray(data)) {
          setProvinces(data);
        } else if (data && Array.isArray(data.data)) {
          setProvinces(data.data);
        } else {
           setProvinces([]);
        }

      } catch (error: any) {
        console.error("Error fetching provinces:", error);
        setErrorMsg(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  const filteredProvinces = provinces.filter((province) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (province.name && province.name.toLowerCase().includes(searchLower)) ||
      (province.name_th && province.name_th.includes(searchLower))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20 mt-16">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00A699]/10 rounded-full mb-6 text-[#00A699]">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {language === "th" ? "จุดหมายปลายทางทั้งหมด" : "All Destinations"}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          {language === "th"
            ? "ค้นพบเสน่ห์ของแต่ละจังหวัด เลือกจุดหมายที่ใช่ แล้วออกไปสร้างความทรงจำดีๆ ด้วยกัน"
            : "Discover the charm of each province. Choose your perfect destination and create unforgettable memories."}
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === "th" ? "ค้นหาชื่อจังหวัด..." : "Search provinces..."}
            className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-[#00A699] focus:border-[#00A699] transition-all shadow-sm text-lg"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A699]"></div>
          </div>
        ) : errorMsg ? (
          <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100 shadow-sm text-red-600">
             <h3 className="text-xl font-bold mb-2">เกิดข้อผิดพลาดในการดึงข้อมูล</h3>
             <p>กรุณาตรวจสอบว่า Backend (NestJS) เปิดอยู่หรือไม่ (Error: {errorMsg})</p>
          </div>
        ) : filteredProvinces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredProvinces.map((province) => (
              <button
                key={province.id}
                onClick={() => navigate(`/province/${province.id}`)}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 text-left flex flex-col h-full w-full"
              >
                <div className="relative h-48 md:h-56 overflow-hidden w-full">
                  <img
                    src={province.image || "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800"}
                    alt={language === "th" ? province.name_th : province.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 bg-gray-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                  
                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#00A699]" />
                      {language === "th" ? province.name_th : province.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col w-full">
                  <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-4 flex-1">
                    {language === "th" ? province.description_th : province.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <span className="text-[#00A699] font-medium text-sm bg-[#00A699]/10 px-3 py-1 rounded-full">
                      {province.tourCount || 0} {language === "th" ? "ทัวร์ที่เปิดให้บริการ" : "Tours Available"}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#00A699] group-hover:text-white transition-colors text-gray-400">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {language === "th" ? "ไม่พบจังหวัดที่คุณค้นหา" : "No provinces found"}
            </h3>
            <p className="text-gray-500">
              {language === "th" ? "อาจจะยังไม่มีข้อมูลจังหวัดในระบบ" : "No province data available."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}