// src/pages/TourDetailPage.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Clock, Star, ArrowLeft, CheckCircle, Video } from "lucide-react";
import { tourService } from "../services/api";
import type { Tour } from "../data/mockData"; // ใช้ Type อ้างอิงเดิมเพื่อให้ตรงกัน

export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchTour = async () => {
      setLoading(true);
      try {
        // เรียก API ไปที่ Backend เพื่อขอข้อมูลทัวร์ตาม ID
        const response = await tourService.getById(id);
        setTour(response.data);
      } catch (err) {
        console.error("Error fetching tour details:", err);
        setError("ไม่สามารถโหลดข้อมูลทัวร์ได้ หรือไม่พบทัวร์นี้");
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A699]"></div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">ขออภัย</h2>
        <p className="text-gray-600">{error || "ไม่พบข้อมูลทัวร์ที่คุณค้นหา"}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-[#00A699] text-white rounded-xl hover:bg-[#008c81] transition"
        >
          ย้อนกลับ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ===== HERO IMAGE ===== */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <img 
          src={tour.image} 
          alt={tour.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-md border border-white/30 p-2.5 rounded-full text-white hover:bg-white/40 transition z-10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Video Badge (ถ้ามี) */}
        {tour.videoUrl && (
          <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
            <Video className="w-4 h-4" />
            <span>Video Available</span>
          </div>
        )}
      </div>

      {/* ===== CONTENT SECTION ===== */}
      <div className="max-w-5xl mx-auto -mt-10 relative z-10 px-4 sm:px-6">
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6 md:p-10">
          
          {/* Header Info */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-100 pb-8 mb-8">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {tour.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm md:text-base text-gray-600">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <MapPin className="w-5 h-5 text-[#00A699]" />
                  <span>{tour.province}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <Clock className="w-5 h-5 text-[#FF6B4A]" />
                  <span>{tour.duration}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-gray-900">{tour.rating}</span>
                  <span className="text-gray-400">({tour.reviewCount} รีวิว)</span>
                </div>
              </div>
            </div>

            <div className="text-left md:text-right w-full md:w-auto bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-2xl">
              <p className="text-sm text-gray-500 mb-1">ราคาเริ่มต้น</p>
              <div className="text-3xl font-bold text-[#00A699]">
                ฿{tour.price.toLocaleString()}
              </div>
              <button className="w-full md:w-auto mt-4 bg-[#00A699] hover:bg-[#008c81] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-teal-100 transition transform hover:-translate-y-0.5">
                จองเลย
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Description & Highlights */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-4">รายละเอียด</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {tour.description}
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-4">ไฮไลท์สำคัญ</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tour.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-green-50/50 hover:bg-green-50 transition border border-transparent hover:border-green-100">
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Sticky Summary or Additional Info (Future Expansion) */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 sticky top-24">
                <h4 className="font-bold text-gray-900 mb-4">สิ่งที่จะได้รับ</h4>
                <ul className="space-y-3">
                  {/* แสดงรายการสิ่งที่รวมอยู่ในแพ็กเกจ (ถ้ามีใน DB สามารถดึงมาแสดงได้) */}
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A699]"></span>
                    รถรับ-ส่ง จากที่พัก
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A699]"></span>
                    อาหารกลางวันและน้ำดื่ม
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A699]"></span>
                    ไกด์นำเที่ยว
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A699]"></span>
                    ประกันอุบัติเหตุ
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}