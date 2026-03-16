// src/features/public/pages/home-page.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Map,
  MapPin,
  ArrowRight,
  Star,
  TrendingUp,
  Flame,
  Compass,
  Plane,
} from "lucide-react";

import { tourService } from "../../../services/api";

import type { Language } from "../../../data/translations";
import { translations } from "../../../data/translations";

interface Province {
  id: string;
  name: string;
  name_th: string;
  tourCount: number;
  image: string;
  description: string;
  description_th: string;
}

interface Tour {
  id: string | number;
  name: string;
  name_th?: string;
  province?: any;
  provinceId?: string;
  price: number;
  image?: string;
  bookedSeats?: number;
  description?: string;
  isHidden?: boolean;
  historicalBooked: number;
}

interface HomePageProps {
  language: Language;
}

export default function HomePage({ language }: HomePageProps) {
  const FALLBACK_IMAGE_URL =
    "https://raw.githubusercontent.com/psu6810110318/-/main/611177844_1219279366819683_4920076292858051338_n-removebg-preview.png";
  const navigate = useNavigate();

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [allTours, setAllTours] = useState<Tour[]>([]);

  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingTours, setLoadingTours] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [heroSlide, setHeroSlide] = useState(0);
  const heroImages = [
    "https://bktemple.wordpress.com/wp-content/uploads/2018/09/cropped-1-zvqo976jklnpve9gyg6sfw.jpeg",
    "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a",
    "https://s359.kapook.com/pagebuilder/9626fbfd-602a-4c30-bb9d-68eeafb07b69.jpg",
    "https://s359.kapook.com/pagebuilder/d56acd15-99d1-4dae-9087-91fdd69d9f05.jpg",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroImages.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
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

    const fetchTours = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/tours/search"
        );
        const toursData = response.data;
        setAllTours(toursData);
        const popularTours = [...toursData].sort(
          (a, b) => (b.historicalBooked || 0) - (a.historicalBooked || 0)
        );
        setTours(popularTours.slice(0, 3));
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
    } else if (page === "tour" && data) {
      navigate(`/tour/${data}`);
    } else {
      console.log("Navigate to:", page);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (!trimmedQuery) {
      navigate("/provinces");
      return;
    }
    const matchedProvince = provinces.find(
      (p) =>
        p.name.toLowerCase().includes(trimmedQuery) ||
        p.name_th.toLowerCase().includes(trimmedQuery)
    );
    if (matchedProvince) {
      navigate(`/province/${matchedProvince.id}`);
    } else {
      navigate("/provinces");
    }
  };

  const t = translations[language].hero;
  const h = translations[language].home;

  const footerSections = [
    {
      title: "Our Vision",
      content:
        "ยกระดับการเดินทางของคุณด้วยบริการทัวร์ระดับพรีเมียม คัดสรรสถานที่ที่ดีที่สุดเพื่อสร้างความทรงจำที่ไม่รู้ลืม",
      Icon: Compass,
    },
    {
      title: "Experience",
      content:
        "สัมผัสประสบการณ์การท่องเที่ยวที่แตกต่าง ด้วยเส้นทางสุดเอ็กซ์คลูซีฟและการบริการที่เหนือระดับในทุกก้าวเดิน",
      Icon: Map,
    },
    {
      title: "Our Values",
      content:
        "เรายึดมั่นในความปลอดภัย ความหรูหรา และการสร้างสรรค์แรงบันดาลใจ เพื่อให้ทุกทริปของคุณมีความหมายที่สุด",
      Icon: Plane,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden relative flex flex-col">

      {/* ===== HERO SECTION ===== */}
      <div className="relative min-h-[550px] md:h-[700px] flex items-center justify-center text-white overflow-hidden py-12 md:py-0 group">
        <div className="absolute inset-0 z-0">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === heroSlide
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-105"
              }`}
            >
              <img
                src={img}
                alt="Amazing Thailand"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-6 text-center z-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-xs md:text-sm font-medium mb-10 text-white/90 tracking-wide shadow-inner">
            <span>✈️</span>
            <span>
              {language === "th"
                ? "เตรียมพบกับประสบการณ์พิเศษ..."
                : "Discover your next extraordinary journey..."}
            </span>
          </div>

          <h1
            className="text-4xl md:text-7xl lg:text-8xl font-thin mb-8 tracking-tighter leading-[1.1] text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {language === "th" ? (
              <>
                <span className="font-light opacity-80">ค้นพบความมหัศจรรย์</span>
                <br />
                <span className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#7ffffe] via-[#00e5d3] to-[#00bfb0] drop-shadow-xl">
                  ประเทศไทย
                </span>
              </>
            ) : (
              <>
                <span className="font-light opacity-80">Discover Amazing</span>
                <br />
                <span className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#00e5d3] to-[#00bfb0] drop-shadow-xl">
                  Thailand
                </span>
              </>
            )}
          </h1>

          <p className="text-base md:text-xl text-white/90 mb-14 leading-relaxed drop-shadow-sm max-w-xl mx-auto font-light tracking-wide opacity-90 px-4">
            {language === "th" ? (
              <>
                สัมผัสความงามของวัฒนธรรม ธรรมชาติ <br />
                และการผจญภัยที่น่าตื่นเต้นในมุมที่ต่างออกไป
              </>
            ) : (
              <>
                Experience the beauty of culture, nature, <br />
                and adventure in a new light.
              </>
            )}
          </p>

          <form
            onSubmit={handleSearch}
            className="search-bar max-w-2xl mx-auto bg-white/95 backdrop-blur-xl rounded-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] p-2.5 flex flex-col md:flex-row items-center gap-2 md:gap-3 transform transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center w-full px-2 text-gray-900">
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
              className="w-full md:w-auto bg-[#FF6B4A] hover:bg-[#ff5232] text-white px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg transition shadow-lg shadow-orange-200"
            >
              {t.searchBtn}
            </button>
          </form>
        </div>
      </div>

      {/* ===== STATS SECTION ===== */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-8 md:-mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-4">
          <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-[0_0_25px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(56,189,248,0.6)] border border-sky-100 transform hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#00A699]/10 flex items-center justify-center text-[#00A699] mb-4">
              <Map className="w-8 h-8" />
            </div>
            <div className="text-4xl lg:text-5xl font-black text-gray-900 mb-2">
              {allTours.length}
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              {language === "th" ? "แพ็กเกจทัวร์" : "Tour Packages"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {language === "th" ? "พร้อมให้บริการในขณะนี้" : "Available for booking"}
            </p>
          </div>

          <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-[0_0_35px_rgba(56,189,248,0.4)] hover:shadow-[0_0_50px_rgba(56,189,248,0.7)] border border-sky-200 md:-mt-6 transform hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-[#00A699]/10 flex items-center justify-center text-[#00A699] mb-4 shadow-lg shadow-[#00A699]/20">
              <MapPin className="w-8 h-8" />
            </div>
            <div className="text-4xl lg:text-5xl font-black text-gray-900 mb-2">
              {provinces.length}
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              {language === "th" ? "จังหวัดทั่วไทย" : "Provinces"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {language === "th"
                ? "ครอบคลุมทุกจุดหมายปลายทาง"
                : "Covering all destinations"}
            </p>
          </div>

          <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-[0_0_25px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(56,189,248,0.6)] border border-sky-100 transform hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center text-yellow-500 mb-4">
              <Star className="w-8 h-8 fill-yellow-500" />
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl lg:text-5xl font-black text-gray-900">
                4.8
              </span>
              <span className="text-xl font-bold text-gray-400">/5</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              {language === "th" ? "คะแนนรีวิวเฉลี่ย" : "Average Rating"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {language === "th"
                ? "จากนักท่องเที่ยวตัวจริง"
                : "From verified travelers"}
            </p>
          </div>
        </div>
      </div>

      {/* ===== RECOMMENDED TOURS SECTION ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              {language === "th"
                ? "🔥 ทัวร์แนะนำสำหรับคุณ"
                : "🔥 Recommended Tours"}
            </h2>
            <p className="text-gray-500 text-base md:text-lg">
              {language === "th"
                ? "แพ็กเกจทัวร์ยอดฮิตที่เปิดจองในขณะนี้"
                : "Popular tour packages highly booked right now"}
            </p>
          </div>
          <button
            onClick={() => onNavigate("provinces")}
            className="flex items-center self-start md:self-auto gap-2 text-[#00A699] font-bold hover:text-[#008c81] transition px-4 py-2 hover:bg-[#00A699]/5 rounded-xl border border-[#00A699]/10 cursor-pointer"
          >
            <Map className="w-5 h-5" />
            <span className="text-sm md:text-base">
              {language === "th" ? "ค้นหาทัวร์ตามจังหวัด" : "Explore by Province"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loadingTours ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00A699]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {tours
              .filter((tour) => !tour.isHidden)
              .map((tour) => {
                const provinceName =
                  tour.province?.name_th && language === "th"
                    ? tour.province.name_th
                    : tour.province?.name && language === "en"
                    ? tour.province.name
                    : tour.provinceId || "จุดหมายยอดฮิต";
                const tourName =
                  language === "th" && tour.name_th ? tour.name_th : tour.name;

                return (
                  <div
                    key={tour.id}
                    className="bg-white rounded-[1.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col group overflow-hidden"
                  >
                    <div className="relative h-56 overflow-hidden bg-[#00A699]">
                      <img
                        src={tour.image || FALLBACK_IMAGE_URL}
                        alt={tourName}
                        className={`w-full h-full group-hover:scale-110 transition-transform duration-500 ${
                          !tour.image ? "object-contain p-6" : "object-cover"
                        }`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = FALLBACK_IMAGE_URL;
                          target.className =
                            "w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500";
                        }}
                      />
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-[#FF6B4A] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        {language === "th"
                          ? `จองแล้ว ${tour.historicalBooked || 0} ที่`
                          : `${tour.historicalBooked || 0} Booked`}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3
                        className="text-lg font-bold text-gray-800 mb-2 line-clamp-2"
                        title={tourName}
                      >
                        {tourName}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-4 h-4 text-[#00A699]" />
                        {provinceName}
                      </p>
                      <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col justify-end">
                        <p className="text-gray-500 text-xs mb-1">
                          {language === "th" ? "ราคาเริ่มต้น" : "Starting from"}
                        </p>
                        <p className="text-[#FF6B4A] font-bold text-2xl mb-4">
                          ฿{tour.price.toLocaleString()}
                        </p>
                        <button
                          onClick={() => onNavigate("tour", tour.id as any)}
                          className="w-full bg-[#00A699] hover:bg-[#008c81] text-white py-2.5 rounded-xl font-medium transition-colors flex justify-center items-center gap-2 cursor-pointer"
                        >
                          {language === "th"
                            ? "ดูรายละเอียดทัวร์"
                            : "View Tour Details"}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ===== Province Selection ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {h.exploreByProvince}
            </h2>
            <p className="text-gray-600 text-base md:text-lg">
              {language === "th"
                ? "เลือกจังหวัดที่คุณสนใจเพื่อค้นหาทัวร์และประสบการณ์สุดพิเศษ"
                : "Select a province to discover its unique tours and experiences"}
            </p>
          </div>
          <button
            onClick={() => onNavigate("provinces")}
            className="flex items-center self-start md:self-auto gap-2 text-[#00A699] font-bold hover:text-[#008c81] transition px-4 py-2 hover:bg-[#00A699]/5 rounded-xl border border-[#00A699]/10 cursor-pointer"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm md:text-base">
              {language === "th" ? "ดูจุดหมายทั้งหมด" : "View All Destinations"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loadingProvinces ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A699]"></div>
          </div>
        ) : (
          <div className="province-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {provinces.slice(0, 9).map((province) => (
              <button
                key={province.id}
                onClick={() => onNavigate("province", province)}
                className="group bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 text-left cursor-pointer"
              >
                <div className="relative h-56 md:h-64 overflow-hidden bg-gray-200">
                  <img
                    src={province.image || FALLBACK_IMAGE_URL}
                    alt={province.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = FALLBACK_IMAGE_URL;
                      target.className =
                        "w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-700";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 text-white mb-2">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold tracking-wide">
                        {language === "th" ? province.name_th : province.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/90 text-xs md:text-sm font-medium bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                        {
                          allTours.filter(
                            (t) =>
                              String(
                                t.provinceId || t.province?.id || t.province
                              ) === String(province.id) && !t.isHidden
                          ).length
                        }{" "}
                        {h.toursAvailable}
                      </span>
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== Why Choose Us ===== */}
      <div className="bg-white py-12 md:py-24 mt-10 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-[#00A699] font-bold tracking-wider uppercase text-xs md:text-sm mb-2 block">
              {language === "th" ? "คำสัญญาของเรา" : "Our Promise"}
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === "th"
                ? "ทำไมต้องเลือก RoamHub Tour?"
                : "Why Choose RoamHub Tour?"}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {[
              {
                icon: "🏆",
                title: language === "th" ? "ทัวร์ดีที่สุด" : "Best Tours",
                desc:
                  language === "th"
                    ? "คัดสรรประสบการณ์ทั่วไทย"
                    : "Handpicked experiences",
                color: "bg-[#00A699]",
              },
              {
                icon: "💳",
                title: language === "th" ? "จองง่าย" : "Easy Booking",
                desc:
                  language === "th"
                    ? "ขั้นตอนการชำระเงินที่ปลอดภัย"
                    : "Simple and secure process",
                color: "bg-[#007AFF]",
              },
              {
                icon: "🎯",
                title: language === "th" ? "ไกด์ท้องถิ่น" : "Local Guides",
                desc:
                  language === "th"
                    ? "เชี่ยวชาญและบริการเป็นกันเอง"
                    : "Expert knowledge",
                color: "bg-[#FF6B4A]",
              },
              {
                icon: "⭐",
                title: language === "th" ? "ยอดนิยม" : "Top Rated",
                desc:
                  language === "th"
                    ? "ได้รับความไว้วางใจจากนักท่องเที่ยว"
                    : "Trusted by thousands",
                color: "bg-[#10b981]",
              },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div
                  className={`w-14 h-14 md:w-20 md:h-20 ${item.color}/10 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6`}
                >
                  <span className="text-2xl md:text-4xl">{item.icon}</span>
                </div>
                <h3 className="text-base md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                  {item.title}
                </h3>
                <p className="hidden md:block text-gray-600 leading-relaxed text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== CTA Section ===== */}
      <div className="relative py-16 md:py-24 overflow-hidden px-4">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?q=80&w=2670&auto=format&fit=crop"
            alt="CTA"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#00A699]/90 mix-blend-multiply" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto text-center text-white">
          <h2 className="text-2xl md:text-5xl font-bold mb-6">
            {language === "th"
              ? "พร้อมที่จะเริ่มการผจญภัยหรือยัง?"
              : "Ready to Start Your Adventure?"}
          </h2>
          <button
            onClick={() => onNavigate("provinces")}
            className="bg-white text-[#00A699] px-8 py-4 md:px-10 md:py-5 rounded-2xl font-bold text-base md:text-lg hover:bg-gray-100 transition shadow-2xl inline-flex items-center gap-3 cursor-pointer"
          >
            {language === "th" ? "ดูจังหวัดทั้งหมด" : "Explore All Provinces"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer
        className="bg-[#060c18] text-gray-400 relative overflow-hidden font-sans mt-auto z-50"
        style={{ borderTop: "1px solid rgba(0,210,180,0.18)" }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,210,180,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,210,180,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 100% 120% at 50% -10%, black 30%, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 100% 120% at 50% -10%, black 30%, transparent 85%)",
          }}
        />

        {/* Glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-120px", left: "50%", transform: "translateX(-50%)",
            width: "650px", height: "280px",
            background: "radial-gradient(ellipse, rgba(0,180,160,0.16) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="max-w-6xl mx-auto px-9 relative z-10">

          {/* 4-col row */}
          <div
            className="grid grid-cols-1 md:grid-cols-4"
            style={{ borderBottom: "0.5px solid rgba(255,255,255,0.055)" }}
          >
            {/* Brand */}
            <div
              className="py-11 pr-9 flex flex-col justify-between"
              style={{ borderRight: "0.5px solid rgba(0,210,180,0.1)" }}
            >
              <div>
                <div className="flex items-baseline gap-[5px] mb-[7px]">
                  <span
                    className="text-white leading-none"
                    style={{ fontFamily: "Georgia, serif", fontSize: 29, letterSpacing: "-2.5px" }}
                  >
                    R<span className="text-[#00d2b4]">H</span>
                  </span>
                  <span
                    className="leading-none"
                    style={{ fontSize: 18, fontWeight: 300, color: "rgba(255,255,255,0.88)", letterSpacing: "-0.3px" }}
                  >
                    Roamhub<span className="text-[#00d2b4]">Tour</span>
                  </span>
                </div>
                <p style={{ fontSize: 8, letterSpacing: "4.5px", color: "rgba(255,255,255,0.22)", textTransform: "uppercase" }}>
                  Premium Travel Experience
                </p>
              </div>
              <div className="flex items-center gap-2 mt-7">
                <div
                  className="w-[5px] h-[5px] rounded-full bg-[#00d2b4] animate-pulse flex-shrink-0"
                  style={{ boxShadow: "0 0 0 2px rgba(0,210,180,0.2), 0 0 8px rgba(0,210,180,0.5)" }}
                />
                <span style={{ fontSize: 9, letterSpacing: "3px", color: "rgba(0,210,180,0.45)" }}>
                  EST. 2026
                </span>
              </div>
            </div>

            {/* 3 info cols */}
            {footerSections.map(({ title, content, Icon }, index) => (
              <div
                key={index}
                className="relative py-11 px-[1.85rem] transition-colors duration-300 group"
                style={{
                  borderRight:
                    index < footerSections.length - 1
                      ? "0.5px solid rgba(255,255,255,0.05)"
                      : "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,210,180,0.022)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Hover top accent */}
                <div
                  className="absolute top-[-1px] opacity-0 group-hover:opacity-100 transition-all duration-300"
                  style={{
                    left: "10%", right: "10%", height: "1.5px",
                    background: "linear-gradient(90deg, transparent, rgba(0,210,180,0.5), transparent)",
                  }}
                />

                <div className="flex items-center gap-2 mb-[11px]">
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 23, height: 23, borderRadius: 6,
                      border: "0.5px solid rgba(0,210,180,0.22)",
                      background: "rgba(0,210,180,0.06)",
                      color: "#00d2b4", fontSize: 10,
                    }}
                  >
                    <Icon size={11} />
                  </div>
                  <span
                    style={{ fontSize: 9, fontWeight: 600, letterSpacing: "2.8px", color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}
                  >
                    {title}
                  </span>
                </div>

                {/* Teal rule */}
                <div
                  className="mb-[10px]"
                  style={{
                    width: 18, height: "0.5px",
                    background: "linear-gradient(90deg, rgba(0,210,180,0.5), transparent)",
                  }}
                />

                <p style={{ fontSize: 12, lineHeight: 1.85, color: "rgba(156,163,175,0.55)" }}>
                  {content}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="py-3 flex flex-col md:flex-row justify-between items-center gap-3">
            <p style={{ fontSize: 8.5, letterSpacing: "1.5px", color: "rgba(255,255,255,0.15)", textTransform: "uppercase" }}>
              © 2026 Roamhub Tour. All rights reserved.
            </p>
            <div className="flex items-center">
              {["Privacy Policy", "Terms of Service"].map((label, i) => (
                <span key={label} className="flex items-center">
                  {i > 0 && (
                    <span className="mx-3" style={{ color: "rgba(255,255,255,0.07)", fontSize: 9 }}>|</span>
                  )}
                  <span
                    className="cursor-pointer transition-colors duration-200 hover:text-[#00d2b4]"
                    style={{ fontSize: 8.5, letterSpacing: "1.5px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}
                  >
                    {label}
                  </span>
                </span>
              ))}
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}