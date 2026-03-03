// src/data/mockData.ts

export interface Province {
  id: string;
  name: string;
  name_th?: string;
  tourCount: number;
  image: string;
  description: string;
  description_th?: string;
}

export interface Tour {
  id: string;
  name: string;
  name_th?: string;
  provinceId: string;
  province: string;
  province_th?: string;
  price: number;
  duration: string;
  duration_th?: string;
  image: string;
  videoUrl?: string;
  rating: number;
  reviewCount: number;
  description: string;
  description_th?: string;
  highlights: string[];
  highlights_th?: string[];
  itinerary: {
    day: number;
    title: string;
    title_th?: string;
    activities: string[];
    activities_th?: string[];
  }[];
  included: string[];
  included_th?: string[];
  notIncluded: string[];
  notIncluded_th?: string[];
}

export interface Booking {
  id: string;
  userId: string;
  tourId: string;
  tourName: string;
  tourName_th?: string;
  province: string;
  province_th?: string;
  date: string;
  travelers: number;
  totalPrice: number;
  status: "pending" | "approved" | "rejected";
  paymentStatus: "pending" | "verified" | "rejected";
  paymentSlip?: string;
  bookingDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

// --- ส่วนที่เพิ่มใหม่สำหรับ Cart ---
export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

export interface CartItem {
  tour: Tour;
  date: string;
  travelers: number;
  totalPrice: number;
  contactInfo: ContactInfo;
}
// ------------------------------

// ฟังก์ชันช่วยดึงข้อมูลตามภาษา
export function getLang(
  data: any,
  key: string,
  lang: "en" | "th",
) {
  if (!data) return "";
  if (lang === "th") {
    return data[`${key}_th`] || data[key];
  }
  return data[key];
}

export const provinces: Province[] = [
  {
    id: "chiang-mai",
    name: "Chiang Mai",
    name_th: "เชียงใหม่",
    tourCount: 12,
    image:
      "https://github.com/psu6810110318/-/blob/main/imag%E0%B8%81%E0%B8%AB%E0%B8%94%E0%B8%AB%E0%B8%81%E0%B8%AB%E0%B8%94e.png?raw=true",
    description:
      "Explore the cultural heart of Northern Thailand with ancient temples, hill tribes, and lush mountains.",
    description_th:
      "สัมผัสหัวใจแห่งล้านนา วัดวาอารามเก่าแก่ ชนเผ่าพื้นเมือง และขุนเขาอันเขียวขจี",
  },
  {
    id: "phuket",
    name: "Phuket",
    name_th: "ภูเก็ต",
    tourCount: 18,
    image:
      "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800",
    description:
      "Discover pristine beaches, vibrant nightlife, and stunning islands in the Andaman Sea.",
    description_th:
      "ค้นพบชายหาดที่สวยงาม สถานที่ท่องเที่ยวกลางคืน และเกาะแก่งในทะเลอันดามัน",
  },
  {
    id: "krabi",
    name: "Krabi",
    name_th: "กระบี่",
    tourCount: 15,
    image:
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
    description:
      "Experience dramatic limestone cliffs, crystal-clear waters, and world-class rock climbing.",
    description_th:
      "ตื่นตากับเขาหินปูน น้ำทะเลใสแจ๋ว และแหล่งปีนผาระดับโลก",
  },
  {
    id: "bangkok",
    name: "Bangkok",
    name_th: "กรุงเทพมหานคร",
    tourCount: 20,
    image:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800",
    description:
      "Immerse yourself in the bustling capital with golden temples, street food, and modern shopping.",
    description_th:
      "สัมผัสเมืองหลวงที่ไม่เคยหลับใหล วัดวาอารามสีทอง สตรีทฟู้ด และแหล่งช้อปปิ้ง",
  },
  {
    id: "kanchanaburi",
    name: "Kanchanaburi",
    name_th: "กาญจนบุรี",
    tourCount: 8,
    image:
      "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800",
    description:
      "Visit the historic Bridge over River Kwai, national parks, and stunning waterfalls.",
    description_th:
      "ย้อนรอยประวัติศาสตร์สะพานข้ามแม่น้ำแคว และเล่นน้ำตกเอราวัณ",
  },
  {
    id: "ayutthaya",
    name: "Ayutthaya",
    name_th: "พระนครศรีอยุธยา",
    tourCount: 10,
    image:
      "https://github.com/psu6810110318/-/blob/main/imag%E0%B8%81%E0%B8%94%E0%B8%AB%E0%B8%81%E0%B8%94e.png?raw=true",
    description:
      "Explore the ancient capital with UNESCO World Heritage temples and historical ruins.",
    description_th:
      "เยือนกรุงเก่า มรดกโลกทางวัฒนธรรม ชมโบราณสถานอันทรงคุณค่า",
  },
];

export const tours: Tour[] = [
  // Chiang Mai Tours
  {
    id: "cm-001",
    name: "Doi Suthep Temple & Hill Tribe Village",
    name_th: "วัดพระธาตุดอยสุเทพและหมู่บ้านชาวเขา",
    provinceId: "chiang-mai",
    province: "Chiang Mai",
    province_th: "เชียงใหม่",
    price: 1500,
    duration: "1 Day",
    duration_th: "1 วัน",
    image:
      "https://github.com/psu6810110318/-/blob/main/imag%E0%B8%81%E0%B8%AB%E0%B8%94%E0%B8%AB%E0%B8%81%E0%B8%AB%E0%B8%94e.png?raw=true",
    rating: 4.8,
    reviewCount: 342,
    description:
      "Visit the sacred Doi Suthep temple with panoramic city views and explore authentic hill tribe villages.",
    description_th:
      "เยี่ยมชมวัดพระธาตุดอยสุเทพ วัดคู่บ้านคู่เมืองเชียงใหม่ พร้อมชมวิวตัวเมืองแบบพาโนรามา และสัมผัสวิถีชีวิตชาวเขา",
    highlights: [
      "Visit Wat Phra That Doi Suthep",
      "Panoramic views of Chiang Mai",
      "Hill tribe village visit",
      "Traditional crafts demonstration",
      "Lunch included",
    ],
    highlights_th: [
      "ไหว้พระธาตุดอยสุเทพ",
      "ชมวิวเมืองเชียงใหม่",
      "เยี่ยมชมหมู่บ้านชาวเขา",
      "ชมการสาธิตงานหัตถกรรม",
      "รวมอาหารกลางวัน",
    ],
    itinerary: [
      {
        day: 1,
        title: "Temple & Village Discovery",
        title_th: "ค้นพบวัดศักดิ์สิทธิ์และหมู่บ้าน",
        activities: [
          "8:00 AM - Hotel pickup",
          "9:00 AM - Climb 309 steps to Doi Suthep Temple",
          "11:00 AM - Visit hill tribe village",
          "12:30 PM - Traditional lunch",
          "2:00 PM - Craft demonstration",
          "4:00 PM - Return to hotel",
        ],
        activities_th: [
          "8:00 น. - รับที่โรงแรม",
          "9:00 น. - ขึ้นบันไดนาคสู่วัดพระธาตุดอยสุเทพ",
          "11:00 น. - เยี่ยมชมหมู่บ้านชาวเขา",
          "12:30 น. - อาหารกลางวันแบบพื้นเมือง",
          "14:00 น. - ชมงานฝีมือ",
          "16:00 น. - กลับที่พัก",
        ],
      },
    ],
    included: [
      "Hotel pickup/drop-off",
      "English speaking guide",
      "Lunch",
      "Entrance fees",
      "Drinking water",
    ],
    included_th: [
      "รถรับส่งโรงแรม",
      "ไกด์นำเที่ยว",
      "อาหารกลางวัน",
      "ค่าเข้าชมสถานที่",
      "น้ำดื่ม",
    ],
    notIncluded: [
      "Personal expenses",
      "Tips",
      "Travel insurance",
    ],
    notIncluded_th: [
      "ค่าใช้จ่ายส่วนตัว",
      "ทิป",
      "ประกันการเดินทาง",
    ],
  },
  {
    id: "cm-002",
    name: "Elephant Sanctuary & Jungle Trek",
    name_th: "ปางช้างและเดินป่า",
    provinceId: "chiang-mai",
    province: "Chiang Mai",
    province_th: "เชียงใหม่",
    price: 2800,
    duration: "1 Day",
    duration_th: "1 วัน",
    image:
      "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800",
    rating: 4.9,
    reviewCount: 567,
    description:
      "Ethical elephant experience with feeding, bathing, and jungle trekking in natural habitat.",
    description_th:
      "สัมผัสประสบการณ์ดูแลช้างอย่างถูกวิธี ให้อาหาร อาบน้ำช้าง และเดินป่าศึกษาธรรมชาติ",
    highlights: [
      "Feed and bathe elephants",
      "Learn about elephant conservation",
      "Jungle trek",
      "Bamboo rafting",
      "Organic lunch",
    ],
    highlights_th: [
      "ให้อาหารและอาบน้ำช้าง",
      "เรียนรู้การอนุรักษ์ช้าง",
      "เดินป่า",
      "ล่องแพไม้ไผ่",
      "อาหารกลางวันออแกนิค",
    ],
    itinerary: [
      {
        day: 1,
        title: "Elephant Sanctuary Experience",
        title_th: "ประสบการณ์ปางช้าง",
        activities: [
          "7:30 AM - Hotel pickup",
          "9:00 AM - Meet elephants and feed",
          "10:30 AM - Bathe elephants in river",
          "12:00 PM - Organic lunch",
          "1:00 PM - Jungle trek",
          "2:30 PM - Bamboo rafting",
          "4:30 PM - Return to hotel",
        ],
        activities_th: [
          "7:30 น. - รับที่โรงแรม",
          "9:00 น. - พบปะและให้อาหารช้าง",
          "10:30 น. - อาบน้ำช้างในแม่น้ำ",
          "12:00 น. - อาหารกลางวัน",
          "13:00 น. - เดินป่า",
          "14:30 น. - ล่องแพไม้ไผ่",
          "16:30 น. - กลับที่พัก",
        ],
      },
    ],
    included: [
      "Hotel transfer",
      "Guide",
      "Lunch",
      "All activities",
      "Insurance",
    ],
    included_th: [
      "รถรับส่ง",
      "ไกด์",
      "อาหารกลางวัน",
      "กิจกรรมทั้งหมด",
      "ประกันอุบัติเหตุ",
    ],
    notIncluded: ["Personal expenses", "Tips"],
    notIncluded_th: ["ค่าใช้จ่ายส่วนตัว", "ทิป"],
  },
  // Phuket Tours
  {
    id: "pk-001",
    name: "Phi Phi Islands Day Trip by Speedboat",
    name_th: "ทัวร์เกาะพีพีโดยสปีดโบ๊ท",
    provinceId: "phuket",
    province: "Phuket",
    province_th: "ภูเก็ต",
    price: 3200,
    duration: "1 Day",
    duration_th: "1 วัน",
    image:
      "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800",
    rating: 4.7,
    reviewCount: 892,
    description:
      "Explore the stunning Phi Phi Islands with crystal-clear waters, snorkeling, and beach relaxation.",
    description_th:
      "สำรวจหมู่เกาะพีพีที่สวยงาม น้ำทะเลใสสะอาด ดำน้ำดูปะการัง และพักผ่อนบนชายหาดขาว",
    highlights: [
      "Speedboat to Phi Phi Islands",
      "Maya Bay visit",
      "Snorkeling at 3 spots",
      "Beach lunch",
      "Monkey Beach",
    ],
    highlights_th: [
      "นั่งสปีดโบ๊ทไปเกาะพีพี",
      "เที่ยวอ่าวมาหยา",
      "ดำน้ำตื้น 3 จุด",
      "อาหารกลางวันบนหาด",
      "หาดลิง",
    ],
    itinerary: [
      {
        day: 1,
        title: "Island Paradise",
        title_th: "สวรรค์แห่งหมู่เกาะ",
        activities: [
          "7:00 AM - Hotel pickup",
          "8:00 AM - Speedboat departure",
          "9:30 AM - Maya Bay",
          "11:00 AM - Snorkeling",
          "12:30 PM - Lunch on beach",
          "2:00 PM - Monkey Beach",
          "5:00 PM - Return to Phuket",
        ],
        activities_th: [
          "7:00 น. - รับที่โรงแรม",
          "8:00 น. - ออกเดินทางโดยสปีดโบ๊ท",
          "9:30 น. - อ่าวมาหยา",
          "11:00 น. - ดำน้ำตื้น",
          "12:30 น. - อาหารกลางวัน",
          "14:00 น. - หาดลิง",
          "17:00 น. - กลับถึงภูเก็ต",
        ],
      },
    ],
    included: [
      "Hotel transfer",
      "Speedboat",
      "Lunch",
      "Snorkel gear",
      "Guide",
      "Insurance",
    ],
    included_th: [
      "รถรับส่ง",
      "สปีดโบ๊ท",
      "อาหารกลางวัน",
      "อุปกรณ์ดำน้ำ",
      "ไกด์",
      "ประกัน",
    ],
    notIncluded: [
      "National park fee (400 THB)",
      "Personal expenses",
    ],
    notIncluded_th: [
      "ค่าธรรมเนียมอุทยาน (400 บาท)",
      "ค่าใช้จ่ายส่วนตัว",
    ],
  },
  // Krabi Tours
  {
    id: "kb-001",
    name: "4 Islands Tour by Longtail Boat",
    name_th: "ทัวร์ 4 เกาะ เรือหางยาว",
    provinceId: "krabi",
    province: "Krabi",
    province_th: "กระบี่",
    price: 2400,
    duration: "1 Day",
    duration_th: "1 วัน",
    image:
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
    rating: 4.8,
    reviewCount: 654,
    description:
      "Traditional longtail boat tour visiting 4 stunning islands with snorkeling and beach time.",
    description_th:
      "ล่องเรือหางยาวแบบดั้งเดิมเที่ยว 4 เกาะสวยงาม พร้อมดำน้ำและพักผ่อนริมหาด",
    highlights: [
      "Phra Nang Cave Beach",
      "Chicken Island",
      "Tup Island sandbar",
      "Poda Island",
      "Snorkeling",
    ],
    highlights_th: [
      "หาดถ้ำพระนาง",
      "เกาะไก่",
      "ทะเลแหวก (เกาะทับ)",
      "เกาะปอดะ",
      "ดำน้ำตื้น",
    ],
    itinerary: [
      {
        day: 1,
        title: "Island Hopping Adventure",
        title_th: "ผจญภัยหมู่เกาะ",
        activities: [
          "8:00 AM - Hotel pickup",
          "9:00 AM - Depart Ao Nang",
          "9:30 AM - Phra Nang Beach",
          "11:00 AM - Chicken Island snorkeling",
          "12:00 PM - Tup Island (sandbar at low tide)",
          "1:00 PM - Lunch on Poda Island",
          "3:00 PM - Return to Ao Nang",
        ],
        activities_th: [
          "8:00 น. - รับที่โรงแรม",
          "9:00 น. - ออกจากอ่าวนาง",
          "9:30 น. - หาดถ้ำพระนาง",
          "11:00 น. - ดำน้ำเกาะไก่",
          "12:00 น. - ทะเลแหวก",
          "13:00 น. - อาหารกลางวันเกาะปอดะ",
          "15:00 น. - กลับถึงอ่าวนาง",
        ],
      },
    ],
    included: [
      "Hotel transfer",
      "Longtail boat",
      "Lunch box",
      "Snorkel gear",
      "Guide",
      "Life jacket",
    ],
    included_th: [
      "รถรับส่ง",
      "เรือหางยาว",
      "ข้าวกล่อง",
      "อุปกรณ์ดำน้ำ",
      "ไกด์",
      "เสื้อชูชีพ",
    ],
    notIncluded: ["National park fee (400 THB)", "Drinks"],
    notIncluded_th: [
      "ค่าธรรมเนียมอุทยาน (400 บาท)",
      "เครื่องดื่ม",
    ],
  },
  // Bangkok Tours
  {
    id: "bk-001",
    name: "Grand Palace & Temples of Bangkok",
    name_th: "พระบรมมหาราชวังและวัดในกรุงเทพฯ",
    provinceId: "bangkok",
    province: "Bangkok",
    province_th: "กรุงเทพมหานคร",
    price: 1800,
    duration: "1 Day",
    duration_th: "1 วัน",
    image:
      "https://github.com/psu6810110318/-/blob/main/dsfsd.jpg?raw=true",
    rating: 4.6,
    reviewCount: 1234,
    description:
      "Discover Bangkok's most iconic temples including the Grand Palace, Wat Pho, and Wat Arun.",
    description_th:
      "ค้นพบวัดที่สำคัญที่สุดของกรุงเทพฯ รวมถึงพระบรมมหาราชวัง วัดโพธิ์ และวัดอรุณ",
    highlights: [
      "Grand Palace complex",
      "Emerald Buddha",
      "Wat Pho (Reclining Buddha)",
      "Wat Arun",
      "River crossing",
    ],
    highlights_th: [
      "พระบรมมหาราชวัง",
      "พระแก้วมรกต",
      "วัดโพธิ์ (พระนอน)",
      "วัดอรุณ",
      "นั่งเรือข้ามฟาก",
    ],
    itinerary: [
      {
        day: 1,
        title: "Bangkok Temples Tour",
        title_th: "ทัวร์วัดกรุงเทพฯ",
        activities: [
          "8:00 AM - Hotel pickup",
          "9:00 AM - Grand Palace & Emerald Buddha",
          "11:00 AM - Wat Pho",
          "12:30 PM - Lunch",
          "2:00 PM - River crossing to Wat Arun",
          "4:00 PM - Return to hotel",
        ],
        activities_th: [
          "8:00 น. - รับที่โรงแรม",
          "9:00 น. - พระบรมมหาราชวังและพระแก้วมรกต",
          "11:00 น. - วัดโพธิ์",
          "12:30 น. - อาหารกลางวัน",
          "14:00 น. - ข้ามเรือไปวัดอรุณ",
          "16:00 น. - กลับที่พัก",
        ],
      },
    ],
    included: [
      "Hotel transfer",
      "Guide",
      "Lunch",
      "Entrance fees",
      "Boat fare",
    ],
    included_th: [
      "รถรับส่ง",
      "ไกด์",
      "อาหารกลางวัน",
      "ค่าเข้าชม",
      "ค่าเรือ",
    ],
    notIncluded: [
      "Personal expenses",
      "Appropriate dress (shoulders/knees covered)",
    ],
    notIncluded_th: [
      "ค่าใช้จ่ายส่วนตัว",
      "ชุดสุภาพ (ต้องคลุมไหล่และเข่า)",
    ],
  },
  // Kanchanaburi Tours
  {
    id: "kn-001",
    name: "Bridge over River Kwai & Erawan Falls",
    name_th: "สะพานข้ามแม่น้ำแควและน้ำตกเอราวัณ",
    provinceId: "kanchanaburi",
    province: "Kanchanaburi",
    province_th: "กาญจนบุรี",
    price: 2200,
    duration: "1 Day",
    duration_th: "1 วัน",
    image:
      "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800",
    rating: 4.7,
    reviewCount: 445,
    description:
      "Visit the historic Bridge over River Kwai and swim in the beautiful 7-tier Erawan Waterfall.",
    description_th:
      "เยี่ยมชมสะพานข้ามแม่น้ำแควแห่งประวัติศาสตร์และเล่นน้ำที่น้ำตกเอราวัณ 7 ชั้น",
    highlights: [
      "Death Railway Bridge",
      "War museum",
      "Train ride",
      "Erawan National Park",
      "7-tier waterfall swim",
    ],
    highlights_th: [
      "สะพานข้ามแม่น้ำแคว",
      "พิพิธภัณฑ์สงคราม",
      "นั่งรถไฟ",
      "อุทยานแห่งชาติเอราวัณ",
      "เล่นน้ำตก 7 ชั้น",
    ],
    itinerary: [
      {
        day: 1,
        title: "History & Nature",
        title_th: "ประวัติศาสตร์และธรรมชาติ",
        activities: [
          "6:30 AM - Bangkok pickup",
          "9:00 AM - Bridge over River Kwai",
          "10:00 AM - War museum",
          "11:00 AM - Train ride on Death Railway",
          "12:00 PM - Lunch",
          "1:30 PM - Erawan National Park",
          "5:00 PM - Return to Bangkok",
        ],
        activities_th: [
          "6:30 น. - รับจากกรุงเทพฯ",
          "9:00 น. - สะพานข้ามแม่น้ำแคว",
          "10:00 น. - พิพิธภัณฑ์สงคราม",
          "11:00 น. - นั่งรถไฟสายมรณะ",
          "12:00 น. - อาหารกลางวัน",
          "13:30 น. - อุทยานแห่งชาติเอราวัณ",
          "17:00 น. - กลับกรุงเทพฯ",
        ],
      },
    ],
    included: [
      "Hotel transfer from Bangkok",
      "Guide",
      "Lunch",
      "Entrance fees",
      "Train ticket",
    ],
    included_th: [
      "รถรับส่งจากกรุงเทพฯ",
      "ไกด์",
      "อาหารกลางวัน",
      "ค่าเข้าชม",
      "ตั๋วรถไฟ",
    ],
    notIncluded: ["Swimming attire", "Towel", "Drinks"],
    notIncluded_th: ["ชุดว่ายน้ำ", "ผ้าเช็ดตัว", "เครื่องดื่ม"],
  },
];

export const mockBookings: Booking[] = [
  {
    id: "BK-20260129-001",
    userId: "user-001",
    tourId: "cm-001",
    tourName: "Doi Suthep Temple & Hill Tribe Village",
    tourName_th: "วัดพระธาตุดอยสุเทพและหมู่บ้านชาวเขา",
    province: "Chiang Mai",
    province_th: "เชียงใหม่",
    date: "2026-02-15",
    travelers: 2,
    totalPrice: 3000,
    status: "pending",
    paymentStatus: "pending",
    bookingDate: "2026-01-29",
  },
  {
    id: "BK-20260125-002",
    userId: "user-001",
    tourId: "pk-001",
    tourName: "Phi Phi Islands Day Trip by Speedboat",
    tourName_th: "ทัวร์เกาะพีพีโดยสปีดโบ๊ท",
    province: "Phuket",
    province_th: "ภูเก็ต",
    date: "2026-02-20",
    travelers: 4,
    totalPrice: 12800,
    status: "approved",
    paymentStatus: "verified",
    bookingDate: "2026-01-25",
  },
];

export const currentUser: User = {
  id: "user-001",
  name: "Somchai Tanaka",
  email: "somchai@example.com",
  role: "user",
};