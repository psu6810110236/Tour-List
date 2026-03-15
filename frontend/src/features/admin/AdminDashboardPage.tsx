import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Package,
  LogOut,
  Eye,
  Search,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  ListChecks,
  Image as ImageIcon,
  Users,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  EyeOff
} from 'lucide-react';
import { getLang } from '../../data/mockData';
import type { Province } from '../../data/mockData';
import { translations } from "../../data/translations";
import type { Language } from "../../data/translations";
import type { Booking, Tour } from '../../types';

// API Service
import { tourService, bookingService } from '../../services/api';

interface AdminDashboardProps {
  onNavigate: (page: string, data?: any) => void;
  language: Language;
}


export function AdminDashboard({ onNavigate, language }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'payments' | 'tours'>('overview');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedTourIds, setSelectedTourIds] = useState<string[]>([]);

  // ข้อมูลจาก Backend
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [allProvinces, setAllProvinces] = useState<Province[]>([]);
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);

  // State สำหรับตัวกรอง "แท็บการจอง"
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingProvinceFilter, setBookingProvinceFilter] = useState('all');
  const [bookingSort, setBookingSort] = useState('newest');

  // State สำหรับตัวกรอง "แท็บชำระเงิน"
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentSort, setPaymentSort] = useState('oldest');

  // State สำหรับตัวกรอง "แท็บทัวร์"
  const [tourSearch, setTourSearch] = useState('');
  const [tourProvinceFilter, setTourProvinceFilter] = useState('all');
  const [tourPriceSort, setTourPriceSort] = useState('default');

  // State ฟอร์มเพิ่ม/แก้ไขทัวร์
  const [isAddingTour, setIsAddingTour] = useState(false);
  const [editingTourId, setEditingTourId] = useState<string | null>(null);
  const [formLang, setFormLang] = useState<Language>(language);
  const [createNewProvince, setCreateNewProvince] = useState(false);
  const [isEditingProvince, setIsEditingProvince] = useState(false);

  // State นี้สำหรับเก็บรูปจังหวัดโดยเฉพาะ
  const [provinceImage, setProvinceImage] = useState<string>('');

  // State สำหรับปฏิทินแอดมิน
  const [adminMonth, setAdminMonth] = useState(new Date(2026, 2, 1));

  // State สำหรับระบบค้นหาจังหวัด
  const [isProvinceOpen, setIsProvinceOpen] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState('');

  // State สำหรับ Popup
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'alert', title: '', message: '' });

  // 🌟 เพิ่มฟิลด์ใหม่: vehicleType, maxCapacity, tripType, tripDays, availableDates
  const initialTourForm: Partial<Tour> = {
    id: '', name: '', name_th: '', description: '', description_th: '',
    provinceId: '', province: '', price: 0, duration: '', duration_th: '', image: '',
    vehicleType: 'รถตู้ VIP', maxCapacity: 10,
    tripType: 'one-day', tripDays: 1, availableDates: [],
    highlights: [], highlights_th: [], itinerary: [{ day: 1, title: '', title_th: '', activities: [], activities_th: [] }],
    included: [], included_th: [], notIncluded: [], notIncluded_th: []
  };

  const [tourForm, setTourForm] = useState<Partial<Tour>>({ ...initialTourForm, id: `T-${Date.now()}` });

  const t = translations[language].admin;
  const tourT = translations[language].tourDetail;

  const LOGO_URL = "https://github.com/psu6810110318/-/blob/main/611177844_1219279366819683_4920076292858051338_n-removebg-preview.png?raw=true";

  const fetchAdminData = async () => {
    try {
      const [toursRes, provRes, bookingsRes] = await Promise.all([
        tourService.search({}),
        tourService.getProvinces(),
        bookingService.getAllBookings()
      ]);
      setAllTours(toursRes.data);
      setAllProvinces(provRes.data);
      setBookingsList(bookingsRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const showAlert = (title: string, message: string) => { setPopup({ isOpen: true, type: 'alert', title, message }); };
  const showConfirm = (title: string, message: string, onConfirm: () => void) => { setPopup({ isOpen: true, type: 'confirm', title, message, onConfirm }); };
  const closePopup = () => setPopup(prev => ({ ...prev, isOpen: false }));

  // ==========================================
  // 🟢 ฟังก์ชันจัดการสถานะ
  // ==========================================

  const handleApproveBooking = (bookingId: string) => {
    showConfirm(language === 'th' ? "ยืนยันการอนุมัติที่นั่ง" : "Confirm Seat Approval", language === 'th' ? `คุณต้องการอนุมัติที่นั่งให้การจอง ${bookingId} ใช่หรือไม่?` : `Approve seats for booking ${bookingId}?`, async () => {
      try {
        await bookingService.updateBookingStatus(bookingId, 'approved');
        fetchAdminData();
        setSelectedBooking(null);
        showAlert(language === 'th' ? "สำเร็จ" : "Success", language === 'th' ? "อนุมัติที่นั่งเรียบร้อยแล้ว" : "Seats approved successfully.");
      } catch (error) {
        showAlert(language === 'th' ? "ข้อผิดพลาด" : "Error", language === 'th' ? "เกิดข้อผิดพลาดในการอนุมัติ" : "Error approving booking.");
        closePopup();
      }
    });
  };

  const handleRejectBooking = (bookingId: string) => {
    const reason = window.prompt(language === 'th' ? "กรุณากรอกเหตุผลที่ปฏิเสธการจอง (เช่น ทัวร์เต็ม):" : "Please enter rejection reason (e.g., Tour is full):");
    if (reason === null) return;

    showConfirm(language === 'th' ? "ยืนยันการปฏิเสธการจอง" : "Confirm Rejection", language === 'th' ? `คุณต้องการปฏิเสธการจอง ${bookingId} ใช่หรือไม่?` : `Reject booking ${bookingId}?`, async () => {
      try {
        await Promise.all([
          bookingService.updateBookingStatus(bookingId, 'rejected', reason),
          bookingService.updatePaymentStatus(bookingId, 'failed', reason)
        ]);
        fetchAdminData();
        setSelectedBooking(null);
        showAlert(language === 'th' ? "สำเร็จ" : "Success", language === 'th' ? "ปฏิเสธการจองเรียบร้อยแล้ว" : "Booking rejected.");
      } catch (error) {
        closePopup();
      }
    });
  };

 const handleApprovePayment = (bookingId: string) => {
    showConfirm(language === 'th' ? "ยืนยันยอดชำระเงิน" : "Confirm Payment", language === 'th' ? `สลิปถูกต้อง อนุมัติยอดเงินสำหรับ ${bookingId} ใช่หรือไม่?` : `Slip is valid, approve payment?`, async () => {
      
      // เปลี่ยนเป็น APPROVED ให้ตรงกับฐานข้อมูล
      setBookingsList((prev) => prev.map((booking) => 
        booking.id === bookingId 
          ? { ...booking, status: 'APPROVED', paymentStatus: 'completed' } as any 
          : booking
      ));

      try {
        await Promise.all([
          bookingService.updatePaymentStatus(bookingId, 'COMPLETED'),
          bookingService.updateBookingStatus(bookingId, 'APPROVED') // 🟢 จุดที่แก้! ส่งคำว่า APPROVED ไป
        ]);
        
        setSelectedBooking(null);
        showAlert(language === 'th' ? "สำเร็จ" : "Success", language === 'th' ? "ยืนยันยอดชำระเงินเรียบร้อยแล้ว" : "Payment verified successfully.");
      } catch (error) {
        await fetchAdminData(); 
        showAlert(language === 'th' ? "ข้อผิดพลาด" : "Error", language === 'th' ? "เกิดข้อผิดพลาดในการยืนยันสลิป" : "Error verifying payment.");
        closePopup();
      }
    });
  };
  const handleRejectPayment = (bookingId: string) => {
    const reason = window.prompt(language === 'th' ? "กรุณากรอกเหตุผลที่ปฏิเสธสลิป (เช่น ยอดเงินไม่ตรง):" : "Please enter rejection reason (e.g., Invalid amount):");
    if (reason === null) return;

    showConfirm(language === 'th' ? "ปฏิเสธสลิปและยกเลิก" : "Reject Payment & Booking", language === 'th' ? `สลิปไม่ถูกต้อง ปฏิเสธยอดเงินและยกเลิกการจองใช่หรือไม่?` : `Slip invalid, reject payment and cancel booking?`, async () => {
      
      // เปลี่ยนเป็น REJECTED
      setBookingsList((prev) => prev.map((booking) => 
        booking.id === bookingId 
          ? { ...booking, status: 'REJECTED', paymentStatus: 'failed' } as any 
          : booking
      ));

      try {
        await Promise.all([
          bookingService.updatePaymentStatus(bookingId, 'FAILED', reason),
          bookingService.updateBookingStatus(bookingId, 'REJECTED', reason) // 🟢 จุดที่แก้! ส่งคำว่า REJECTED ไป
        ]);
        
        setSelectedBooking(null);
        showAlert(language === 'th' ? "สำเร็จ" : "Success", language === 'th' ? "ปฏิเสธสลิปและยกเลิกการจองแล้ว" : "Payment rejected and booking cancelled.");
      } catch (error) {
        await fetchAdminData();
        closePopup();
      }
    });
  };

  const handleDeleteBooking = (bookingId: string) => {
    showConfirm(language === 'th' ? "ยืนยันการลบ" : "Confirm Delete", language === 'th' ? `ต้องการลบการจอง ${bookingId} ถาวรใช่หรือไม่?` : `Permanently delete booking ${bookingId}?`, async () => {
      try {
        await bookingService.deleteBooking(bookingId); fetchAdminData();
        showAlert(language === 'th' ? "สำเร็จ" : "Success", language === 'th' ? "ลบการจองเรียบร้อยแล้ว" : "Booking deleted successfully.");
      } catch (error) {
        showAlert(language === 'th' ? "ข้อผิดพลาด" : "Error", language === 'th' ? "เกิดข้อผิดพลาดในการลบ" : "Error deleting booking.");
      }
    });
  };

  // 🟢 ฟังก์ชันเลือกทั้งหมด / เลือกทีละอัน สำหรับ "ทัวร์"
  const handleSelectAllTours = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedTourIds(filteredTours.map(t => t.id));
    else setSelectedTourIds([]);
  };
  const handleSelectTour = (id: string) => {
    setSelectedTourIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // 🟢 ฟังก์ชันเลือกลบหลายอัน สำหรับ "ทัวร์"
 const handleBulkDeleteTours = () => {
    if (selectedTourIds.length === 0) return;
    showConfirm(language === 'th' ? "ยืนยันการลบหลายรายการ" : "Confirm Bulk Delete", language === 'th' ? `คุณต้องการลบทัวร์ที่เลือก ${selectedTourIds.length} รายการแบบถาวรใช่หรือไม่?` : `Delete ${selectedTourIds.length} selected tours?`, async () => {
      try {
        await Promise.all(selectedTourIds.map(id => tourService.deleteTour(id)));
        setSelectedTourIds([]); fetchAdminData();
        showAlert(language === 'th' ? "สำเร็จ" : "Success", language === 'th' ? "ลบรายการที่เลือกเรียบร้อยแล้ว" : "Selected items deleted.");
      } catch (error) {
        // 🟢 เปลี่ยนข้อความให้แอดมินรู้ว่าทำไมถึงลบไม่ได้ทั้งหมด
        showAlert(language === 'th' ? "ลบได้แค่บางส่วน" : "Partial Success", language === 'th' ? "บางทัวร์ไม่สามารถลบได้ เนื่องจากมีประวัติการจองของลูกค้าค้างอยู่ครับ" : "Some tours could not be deleted because they have active bookings.");
      }
    });
  };

  // 🟢 ฟังก์ชันเลือกทั้งหมด / เลือกทีละอัน สำหรับ "การจอง"
  const handleSelectAllBookings = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedBookingIds(filteredBookings.map(b => b.id));
    else setSelectedBookingIds([]);
  };
  const handleSelectBooking = (id: string) => {
    setSelectedBookingIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // 🟢 ฟังก์ชันเลือกลบหลายอัน สำหรับ "การจอง"
  const handleBulkDeleteBookings = () => {
    if (selectedBookingIds.length === 0) return;
    showConfirm(
      language === 'th' ? "ยืนยันการลบหลายรายการ" : "Confirm Bulk Delete",
      language === 'th' ? `คุณต้องการลบการจองที่เลือก ${selectedBookingIds.length} รายการแบบถาวรใช่หรือไม่?` : `Delete ${selectedBookingIds.length} selected bookings?`,
      async () => {
        try {
          await Promise.all(selectedBookingIds.map(id => bookingService.deleteBooking(id)));
          setSelectedBookingIds([]); // ล้างค่าที่เลือกไว้
          fetchAdminData();
          showAlert(language === 'th' ? "สำเร็จ" : "Success", language === 'th' ? "ลบรายการที่เลือกเรียบร้อยแล้ว" : "Selected items deleted.");
          closePopup();
        } catch (error) {
          showAlert(language === 'th' ? "ข้อผิดพลาด" : "Error", "ไม่สามารถลบรายการได้ทั้งหมด");
          closePopup();
        }
      }
    );
  };

  // ==========================================
  // ฟังก์ชันทัวร์ (Tours)
  // ==========================================
  const handleEditClick = (tour: Tour) => {
    setEditingTourId(tour.id);
    const currentProvinceId = typeof tour.province === 'object' && tour.province !== null ? (tour.province as any).id : tour.provinceId || tour.province;
    setTourForm({ ...tour, provinceId: currentProvinceId });
    setIsAddingTour(true);
    setCreateNewProvince(false);
  };

  const handleSaveTour = async () => {
    if (!(tourForm.name || tourForm.name_th) || !tourForm.provinceId) {
      return showAlert(language === 'th' ? "ข้อมูลไม่ครบ" : "Incomplete Data", language === 'th' ? "กรุณากรอกชื่อทัวร์และเลือกจังหวัด" : "Please enter tour name and select province.");
    }
    
    try {
     if (createNewProvince) {
        const provData = { 
          id: tourForm.provinceId!, 
          name: String(tourForm.province || ''), 
          name_th: String(tourForm.province || ''), 
          tourCount: 0, 
          image: provinceImage || '', 
          description: '', 
          description_th: '' 
        };

        // เช็คว่าเป็นการแก้ไข หรือ สร้างใหม่
        if (isEditingProvince) {
          await tourService.updateProvince(provData.id, provData); // ⚠️ ต้องมี API นี้ใน backend
        } else {
          await tourService.createProvince(provData);
        }
      }
      if (editingTourId) {
        await tourService.updateTour(editingTourId, tourForm);
        showAlert(language === 'th' ? "สำเร็จ" : "Success", language === 'th' ? "อัปเดตทัวร์สำเร็จ!" : "Tour updated successfully!");
      } else {
        const newTour = { ...tourForm, rating: 5.0, reviewCount: 0 };
        delete newTour.id;
        await tourService.createTour(newTour);
        showAlert(language === 'th' ? "สำเร็จ" : "Success", language === 'th' ? "สร้างทัวร์สำเร็จ!" : "Tour created successfully!");
      }
      
      setIsAddingTour(false); 
      setEditingTourId(null); 
      fetchAdminData();
      setTourForm({ ...initialTourForm, id: `T-${Date.now()}` }); 
      setCreateNewProvince(false);
      setProvinceImage(''); // 🟢 เคลียร์รูปลิงก์จังหวัดทิ้งด้วย
      
    } catch (error) {
      showAlert(language === 'th' ? "ข้อผิดพลาด" : "Error", language === 'th' ? "เกิดข้อผิดพลาดในการบันทึกข้อมูล" : "Error saving data");
    }
  };

  const handleDeleteTour = (id: string) => {
    showConfirm(language === 'th' ? "ยืนยันการลบ" : "Confirm Delete", language === 'th' ? "คุณแน่ใจหรือไม่ว่าต้องการลบทัวร์นี้แบบถาวร?" : "Are you sure you want to permanently delete this tour?", async () => {
      try {
        await tourService.deleteTour(id); fetchAdminData();
        showAlert(language === 'th' ? "สำเร็จ" : "Success", language === 'th' ? "ลบทัวร์เรียบร้อยแล้ว" : "Tour deleted successfully.");
      } catch (error) {
        // 🟢 เปลี่ยนข้อความให้แอดมินรู้ว่าทำไมถึงลบไม่ได้
        showAlert(language === 'th' ? "ไม่สามารถลบทัวร์ได้" : "Cannot Delete", language === 'th' ? "ทัวร์นี้มีการจองของลูกค้าค้างอยู่ กรุณาไปลบการจองในแท็บ 'การจอง' ให้หมดก่อนครับ" : "Please delete all bookings associated with this tour first.");
      }
    });
  };



  // 🟢 ฟังก์ชันซ่อน/แสดงทัวร์
  const handleToggleVisibility = (tour: Tour) => {
    const isCurrentlyHidden = tour.isHidden;
    const actionText = isCurrentlyHidden ? 'แสดง' : 'ซ่อน';
    
    showConfirm(
      language === 'th' ? `ยืนยันการ${actionText}ทัวร์` : `Confirm ${actionText} Tour`,
      language === 'th' 
        ? `คุณต้องการ${actionText}ทัวร์ "${getLang(tour, 'name', language)}" บนหน้าเว็บใช่หรือไม่?` 
        : `Are you sure you want to ${actionText.toLowerCase()} this tour?`,
      async () => {
        try {
          // ส่งค่าไปอัปเดตที่ Backend
          await tourService.updateTour(tour.id, { isHidden: !isCurrentlyHidden });
          fetchAdminData(); // โหลดข้อมูลตารางใหม่
          showAlert(
            language === 'th' ? "สำเร็จ" : "Success", 
            language === 'th' ? `อัปเดตสถานะทัวร์เรียบร้อยแล้ว` : `Tour visibility updated.`
          );
          closePopup();
        } catch (error) {
          showAlert(language === 'th' ? "ข้อผิดพลาด" : "Error", "ไม่สามารถอัปเดตสถานะได้");
          closePopup();
        }
      }
    );
  };

  const handleSelectProvince = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = allProvinces.find(p => p.id === e.target.value);
    if (selected) { setTourForm({ ...tourForm, provinceId: selected.id, province: selected.name }); }
  };

  const handleAddDay = () => {
    setTourForm(prev => ({ ...prev, itinerary: [...(prev.itinerary || []), { day: (prev.itinerary?.length || 0) + 1, title: '', title_th: '', activities: [], activities_th: [] }] }));
  };

  // 🌟 ฟังก์ชันจัดการปฏิทิน Admin
  const adminWeekDays = language === "th" ? ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const adminMonthNames = language === "th" ? ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"] : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const adminNextMonth = (e: any) => { e.preventDefault(); setAdminMonth(new Date(adminMonth.getFullYear(), adminMonth.getMonth() + 1, 1)); };
  const adminPrevMonth = (e: any) => { e.preventDefault(); setAdminMonth(new Date(adminMonth.getFullYear(), adminMonth.getMonth() - 1, 1)); };
  const adminDaysInMonth = new Date(adminMonth.getFullYear(), adminMonth.getMonth() + 1, 0).getDate();
  const adminStartDay = new Date(adminMonth.getFullYear(), adminMonth.getMonth(), 1).getDay();

  const toggleAvailableDate = (e: any, dateStr: string) => {
    e.preventDefault();
    const currentDates = tourForm.availableDates || [];
    if (currentDates.includes(dateStr)) {
      setTourForm({ ...tourForm, availableDates: currentDates.filter(d => d !== dateStr) });
    } else {
      setTourForm({ ...tourForm, availableDates: [...currentDates, dateStr].sort() });
    }
  };

  const isDateInAnyAdminRange = (dateStr: string) => {
    if (!tourForm.availableDates || tourForm.availableDates.length === 0 || !tourForm.tripDays || tourForm.tripDays <= 1) return false;
    const current = new Date(dateStr);
    return tourForm.availableDates.some(startStr => {
      const start = new Date(startStr);
      const end = new Date(startStr);
      end.setDate(start.getDate() + tourForm.tripDays! - 1);
      return current > start && current <= end;
    });
  };

  const stats = {
    totalBookings: bookingsList.length,
    pendingBookings: bookingsList.filter(b => b.status?.toLowerCase() === 'pending').length,
    pendingPayments: bookingsList.filter(b => b.paymentStatus?.toLowerCase() === 'verifying').length,
    approvedBookings: bookingsList.filter(b => b.status?.toLowerCase() === 'approved' && b.paymentStatus?.toLowerCase() === 'completed').length,
    totalRevenue: bookingsList.filter(b => b.status?.toLowerCase() === 'approved' && b.paymentStatus?.toLowerCase() === 'completed').reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  };

  // ==========================================
  // 🔍 ระบบกรองข้อมูล (Filters)
  // ==========================================

  const filteredBookings = bookingsList
    .filter(b => {
      const searchLower = (bookingSearch || '').toLowerCase();
      const tourName = getLang(b, 'tourName', language) || getLang(b, 'tourNameSnapshot', language) || '';
      const matchesSearch = String(b.id || '').toLowerCase().includes(searchLower) || String(tourName).toLowerCase().includes(searchLower);

      const matchesStatus = bookingStatusFilter === 'all' || b.status?.toLowerCase() === bookingStatusFilter.toLowerCase();

      const relatedTour = b.tour || allTours.find(t => String(t.id) === String(b.tourId));
      const bProv = relatedTour?.province || b.province;
      const bProvId = typeof bProv === 'object' && bProv !== null ? (bProv as any).id : (relatedTour?.provinceId || bProv || '');

      const matchesProvince = bookingProvinceFilter === 'all' || String(bProvId).toLowerCase() === bookingProvinceFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesProvince;
    })
    .sort((a, b) => {
      const dateA = new Date(a.bookingDate || (a as any).createdAt || 0).getTime();
      const dateB = new Date(b.bookingDate || (b as any).createdAt || 0).getTime();

      if (bookingSort === 'newest') return dateB - dateA;
      if (bookingSort === 'oldest') return dateA - dateB;
      if (bookingSort === 'travelDate') {
        const tDateA = new Date(a.travelDate || (a as any).date || 0).getTime();
        const tDateB = new Date(b.travelDate || (b as any).date || 0).getTime();
        return tDateA - tDateB;
      }
      return 0;
    });

  const filteredPayments = bookingsList
    // 🟢 เอาตัวกรองสถานะและตัวกรองสลิปออกไปเลยครับ เพราะระบบเราบังคับแนบสลิปมาตั้งแต่แรกแล้ว
    .filter(b => {
      // ระบบค้นหา (Search)
      const searchLower = (paymentSearch || '').toLowerCase();
      const tourName = getLang(b, 'tourName', language) || getLang(b, 'tourNameSnapshot', language) || '';
      return String(b.id || '').toLowerCase().includes(searchLower) || String(tourName).toLowerCase().includes(searchLower);
    })
    .sort((a, b) => {
      // ระบบเรียงลำดับ (Sort)
      const dateA = new Date(a.bookingDate || (a as any).createdAt || 0).getTime();
      const dateB = new Date(b.bookingDate || (b as any).createdAt || 0).getTime();

      if (paymentSort === 'oldest') return dateA - dateB;
      if (paymentSort === 'newest') return dateB - dateA;
      if (paymentSort === 'amountDesc') return (b.totalPrice || 0) - (a.totalPrice || 0);
      return 0;
    });
  // 3. กรองทัวร์
  const filteredTours = allTours 
    .filter(t => {
      const searchLower = (tourSearch || '').toLowerCase();
      const tourName = getLang(t, 'name', language) || '';
      const matchesSearch = String(tourName).toLowerCase().includes(searchLower) || String(t.id || '').toLowerCase().includes(searchLower);

      const currentProvinceId = typeof t.province === 'object' && t.province !== null ? (t.province as any).id : t.provinceId || t.province;
      const matchesProvince = tourProvinceFilter === 'all' || currentProvinceId === tourProvinceFilter;

      return matchesSearch && matchesProvince;
    })
    .sort((a, b) => {
      if (tourPriceSort === 'asc') return (a.price || 0) - (b.price || 0);
      if (tourPriceSort === 'desc') return (b.price || 0) - (a.price || 0);
      return 0;
    });

  const [viewingCustomersForTour, setViewingCustomersForTour] = useState<Tour | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-18 h-18 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center p-1 overflow-hidden">
                <img
                  src={LOGO_URL}
                  alt="RoamHub Tour Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t.title}</h1>
                <p className="text-gray-500 text-sm">{t.subtitle}</p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition"
            >
              <LogOut className="w-5 h-5" />
              <span>{t.exit}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {(['overview', 'bookings', 'payments', 'tours'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setIsAddingTour(false);
                  setEditingTourId(null);
                }}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${activeTab === tab
                  ? 'border-[#00A699] text-[#00A699]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                {tab === 'overview' && <LayoutDashboard className="w-5 h-5" />}
                {tab === 'bookings' && <Calendar className="w-5 h-5" />}
                {tab === 'payments' && <DollarSign className="w-5 h-5" />}
                {tab === 'tours' && <Package className="w-5 h-5" />}
                {t.tabs[tab]}

                {tab === 'bookings' && stats.pendingBookings > 0 && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {stats.pendingBookings}
                  </span>
                )}
                {tab === 'payments' && stats.pendingPayments > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {stats.pendingPayments}
                  </span>
                )}
              </button>
            ))}

            <button
              onClick={() => onNavigate('admin/chat')}
              className="flex items-center gap-2 px-6 py-4 font-medium border-b-2 border-transparent text-gray-600 hover:text-[#00A699] transition whitespace-nowrap"
            >
              <MessageSquare className="w-5 h-5" />
              {language === 'th' ? 'ระบบแชท' : 'Chat System'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-gray-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalBookings}</div>
                <div className="text-sm text-gray-600">{language === 'th' ? 'การจองทั้งหมด' : 'Total Bookings'}</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-semibold">
                    {stats.pendingBookings + stats.pendingPayments} รายการ
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingBookings + stats.pendingPayments}</div>
                <div className="text-sm text-gray-600">{language === 'th' ? 'รอดำเนินการ (จอง+สลิป)' : 'Total Pending Actions'}</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.approvedBookings}</div>
                <div className="text-sm text-gray-600">{language === 'th' ? 'สมบูรณ์ (จอง+จ่าย)' : 'Fully Completed'}</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#00A699]/10 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-[#00A699]" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">฿{stats.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{t.stats.revenue}</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.recent}</h2>
              <div className="space-y-3">
                {bookingsList.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${booking.status?.toLowerCase() === 'pending' ? 'bg-orange-100' :
                        booking.status?.toLowerCase() === 'approved' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                        {booking.status?.toLowerCase() === 'pending' && <Clock className="w-5 h-5 text-orange-600" />}
                        {booking.status?.toLowerCase() === 'approved' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {booking.status?.toLowerCase() === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{getLang(booking, 'tourName', language) || getLang(booking, 'tourNameSnapshot', language)}</div>
                        <div className="text-sm text-gray-600">{booking.id}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">฿{booking.totalPrice?.toLocaleString()}</div>
                      <div className={`text-sm font-medium ${booking.status?.toLowerCase() === 'pending' ? 'text-orange-600' :
                        booking.status?.toLowerCase() === 'approved' ? 'text-green-600' : 'text-red-600'
                        }`}>{booking.status?.toUpperCase()}</div>
                    </div>
                  </div>
                ))}
                {bookingsList.length === 0 && (
                  <div className="text-center text-gray-500 py-4">{language === 'th' ? 'ไม่มีรายการจองล่าสุด' : 'No recent bookings'}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= BOOKINGS TAB ================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col xl:flex-row justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900">{t.tabs.bookings} (จัดการที่นั่งทัวร์)</h2>
              <div className="flex flex-col md:flex-row gap-3">

                {/* 🟢 เพิ่มปุ่มลบหลายรายการตรงนี้ (จะโชว์เมื่อมีการติ๊กเลือกเท่านั้น) */}
                {selectedBookingIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteBookings}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-semibold transition whitespace-nowrap animate-in fade-in shadow-sm"
                  >
                    <Trash2 className="w-5 h-5" />
                    {language === 'th' ? `ลบที่เลือก (${selectedBookingIds.length})` : `Delete Selected (${selectedBookingIds.length})`}
                  </button>
                )}

                <select
                  className="border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-sm outline-none focus:ring-2 focus:ring-[#00A699]"
                  value={bookingProvinceFilter}
                  onChange={(e) => setBookingProvinceFilter(e.target.value)}
                >
                  <option value="all">{language === 'th' ? 'ทุกจังหวัด' : 'All Provinces'}</option>
                  {allProvinces.map(p => (
                    <option key={p.id} value={p.id}>{getLang(p, 'name', language)}</option>
                  ))}
                </select>

                <select
                  className="border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-sm outline-none focus:ring-2 focus:ring-[#00A699]"
                  value={bookingSort}
                  onChange={(e) => setBookingSort(e.target.value)}
                >
                  <option value="newest">{language === 'th' ? 'เวลาจอง: ล่าสุด' : 'Booking Time: Newest'}</option>
                  <option value="oldest">{language === 'th' ? 'เวลาจอง: เก่าสุด' : 'Booking Time: Oldest'}</option>
                  <option value="travelDate">{language === 'th' ? 'ใกล้วันเดินทาง' : 'Upcoming Travel Date'}</option>
                </select>

                <select
                  className="border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-sm outline-none focus:ring-2 focus:ring-[#00A699]"
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                >
                  <option value="all">{language === 'th' ? 'ทุกสถานะ' : 'All Statuses'}</option>
                  <option value="pending">{language === 'th' ? 'รออนุมัติที่นั่ง (Pending)' : 'Pending'}</option>
                  <option value="approved">{language === 'th' ? 'ยืนยันแล้ว (Approved)' : 'Approved'}</option>
                  <option value="rejected">{language === 'th' ? 'ปฏิเสธ (Rejected)' : 'Rejected'}</option>
                </select>

                <div className="relative group w-full md:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#00A699] transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder={language === 'th' ? "ค้นหาชื่อลูกค้า หรือชื่อทัวร์..." : "Search customer or tour name..."}
                    className="block w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A699]/20 focus:border-[#00A699] transition-all duration-200 shadow-sm"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {/* 🟢 1. เพิ่ม Checkbox ที่หัวตาราง (เลือกทั้งหมด) */}
                      <th className="px-6 py-4 w-12 text-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-[#00A699] rounded border-gray-300 focus:ring-[#00A699] cursor-pointer"
                          checked={selectedBookingIds.length === filteredBookings.length && filteredBookings.length > 0}
                          onChange={handleSelectAllBookings}
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.table.id}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.table.tour}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{language === 'th' ? 'วันที่เดินทาง' : 'Travel Date'}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">สถานะที่นั่ง (Booking)</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">สถานะเงิน (Payment)</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.table.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className={`transition ${selectedBookingIds.includes(booking.id) ? 'bg-[#00A699]/5' : 'hover:bg-gray-50'}`}>
                        
                        {/* 🟢 2. เพิ่ม Checkbox ในแต่ละแถว */}
                        <td className="px-6 py-4 text-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-[#00A699] rounded border-gray-300 focus:ring-[#00A699] cursor-pointer"
                            checked={selectedBookingIds.includes(booking.id)}
                            onChange={() => handleSelectBooking(booking.id)}
                          />
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{booking.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{getLang(booking, 'tourName', language) || getLang(booking, 'tourNameSnapshot', language)}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date((booking as any).travelDate || (booking as any).date || 0).toLocaleDateString(language === 'en' ? 'en-US' : 'th-TH')}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${booking.status?.toLowerCase() === 'pending' ? 'bg-orange-100 text-orange-800' :
                            booking.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {booking.status?.toUpperCase()}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${booking.paymentStatus?.toLowerCase() === 'verifying' ? 'bg-blue-100 text-blue-800' :
                            booking.paymentStatus?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {booking.paymentStatus?.toUpperCase()}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedBooking(booking)} className="text-[#00A699] hover:text-[#008c81] transition p-1" title="ดูรายละเอียด/จัดการ">
                              <AlertCircle className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDeleteBooking(booking.id)} className="text-red-500 hover:text-red-600 transition p-1" title="ลบการจอง">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredBookings.length === 0 && (
                      <tr>
                        {/* 🟢 3. อัปเดต colSpan จาก 6 เป็น 7 ให้ครอบคลุมคอลัมน์ Checkbox */}
                        <td colSpan={7} className="text-center py-6 text-gray-500">{language === 'th' ? 'ไม่พบข้อมูลการจองที่ค้นหา' : 'No bookings found'}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

       {/* ================= PAYMENTS TAB ================= */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">ตรวจสลิปโอนเงิน (Payment Verification)</h2>
                <p className="text-gray-600 mt-1">ประวัติการชำระเงินและรายการที่รอตรวจสอบ</p>
              </div>
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">

                <select
                  className="border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-sm outline-none focus:ring-2 focus:ring-[#00A699]"
                  value={paymentSort}
                  onChange={(e) => setPaymentSort(e.target.value)}
                >
                  <option value="oldest">{language === 'th' ? 'เรียงตาม: รอนานที่สุด' : 'Sort: Oldest First'}</option>
                  <option value="newest">{language === 'th' ? 'เรียงตาม: ล่าสุด' : 'Sort: Newest First'}</option>
                  <option value="amountDesc">{language === 'th' ? 'เรียงตาม: ยอดเงินสูงสุด' : 'Sort: Highest Amount'}</option>
                </select>

                <div className="relative group w-full md:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#00A699] transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder={language === 'th' ? "ค้นหารหัส/ชื่อทัวร์..." : "Search ID/Tour name..."}
                    className="block w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A699]/20 focus:border-[#00A699] transition-all duration-200 shadow-sm"
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPayments.map((booking) => {
                const isConfirmed = booking.status?.toUpperCase() === 'APPROVED'; 
                const isCancelled = booking.status?.toUpperCase() === 'REJECTED';
                const isPending = !isConfirmed && !isCancelled;
                
                const borderColor = isConfirmed ? 'border-green-500' : isCancelled ? 'border-red-400' : 'border-blue-400';

                return (
                  <div key={booking.id} className={`bg-white rounded-3xl p-6 shadow-lg border-t-4 ${borderColor} relative transition-all duration-300 hover:-translate-y-1`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-600 font-mono">{booking.id}</span>
                      
                      {/* 🟢 ป้าย Badge แสดงสถานะ */}
                      {isPending && <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">WAITING SLIP</span>}
                      {isConfirmed && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> APPROVED</span>}
                      {isCancelled && <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3"/> REJECTED</span>}
                    </div>
                    
                    <div className="font-bold text-gray-900 mb-4 line-clamp-1">{getLang(booking, 'tourNameSnapshot', language)}</div>

                    <div className="bg-gray-100 rounded-xl mb-4 overflow-hidden h-40 flex items-center justify-center cursor-pointer border hover:border-gray-300 transition relative group" onClick={() => window.open(booking.paymentSlip, '_blank')}>
                      {booking.paymentSlip ? (
                        <>
                          <img src={booking.paymentSlip} alt="slip" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-semibold text-sm bg-black/50 px-3 py-1 rounded-lg">ดูรูปเต็ม</span>
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400 flex flex-col items-center"><FileText className="w-6 h-6 mb-2" /> ไม่มีสลิปแนบมา</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <div className="text-gray-600 mb-1">{t.payment.amount}</div>
                        <div className="font-bold text-[#00A699] text-lg">฿{booking.totalPrice?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-1">{t.payment.paymentDate}</div>
                        <div className="font-semibold text-gray-900">{booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString(language === 'en' ? 'en-US' : 'th-TH') : '-'}</div>
                      </div>
                    </div>

                    {/* 🟢 ซ่อนปุ่มถ้าจัดการไปแล้ว โชว์เป็นข้อความแทน */}
                    {isPending ? (
                      <div className="flex gap-3">
                        <button onClick={() => handleApprovePayment(booking.id)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-sm">
                          <CheckCircle className="w-4 h-4" /> อนุมัติสลิป
                        </button>
                        <button onClick={() => handleRejectPayment(booking.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2">
                          <XCircle className="w-4 h-4" /> ปฏิเสธ
                        </button>
                      </div>
                    ) : (
                      <div className={`mt-2 text-center py-2.5 rounded-xl font-bold border flex items-center justify-center gap-2 ${isConfirmed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {isConfirmed ? (
                          <><CheckCircle className="w-4 h-4" /> ตรวจสอบและอนุมัติแล้ว</>
                        ) : (
                          <><XCircle className="w-4 h-4" /> ปฏิเสธการชำระเงินแล้ว</>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredPayments.length === 0 && (
                <div className="col-span-full bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                  <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">ตรวจสอบสลิปครบหมดแล้ว!</h3>
                  <p className="text-gray-600">{language === 'th' ? 'ไม่มีรายการชำระเงินในระบบขณะนี้' : 'All caught up! No payments found.'}</p>
                </div>
              )}
            </div>
          </div>
        )}
       {/* ================= TOURS TAB ================= */}
        {activeTab === 'tours' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {!isAddingTour ? (
              <>
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t.tours.title}</h2>
                    <p className="text-gray-600 mt-1">{t.tours.desc}</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto items-center">

                    {/* 🟢 1. เพิ่มปุ่มลบหลายรายการ (แสดงเมื่อมีการติ๊กเลือก) */}
                    {selectedTourIds.length > 0 && (
                      <button
                        onClick={handleBulkDeleteTours}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-semibold transition shadow-sm whitespace-nowrap animate-in fade-in"
                      >
                        <Trash2 className="w-5 h-5" />
                        {language === 'th' ? `ลบที่เลือก (${selectedTourIds.length})` : `Delete Selected (${selectedTourIds.length})`}
                      </button>
                    )}

                    <select
                      className="border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-sm outline-none focus:ring-2 focus:ring-[#00A699]"
                      value={tourProvinceFilter}
                      onChange={(e) => setTourProvinceFilter(e.target.value)}
                    >
                      <option value="all">{language === 'th' ? 'ทุกจังหวัด' : 'All Provinces'}</option>
                      {allProvinces.map(p => (
                        <option key={p.id} value={p.id}>{getLang(p, 'name', language)}</option>
                      ))}
                    </select>

                    <select
                      className="border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-sm outline-none focus:ring-2 focus:ring-[#00A699]"
                      value={tourPriceSort}
                      onChange={(e) => setTourPriceSort(e.target.value)}
                    >
                      <option value="default">{language === 'th' ? 'เรียงตาม: ล่าสุด' : 'Sort: Default'}</option>
                      <option value="asc">{language === 'th' ? 'ราคา: ต่ำไปสูง' : 'Price: Low to High'}</option>
                      <option value="desc">{language === 'th' ? 'ราคา: สูงไปต่ำ' : 'Price: High to Low'}</option>
                    </select>

                    <div className="relative group w-full md:w-64">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#00A699] transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder={language === 'th' ? "ค้นหาชื่อทัวร์/รหัส..." : "Search tour name/ID..."}
                        className="block w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A699]/20 focus:border-[#00A699] transition-all duration-200 shadow-sm"
                        value={tourSearch}
                        onChange={(e) => setTourSearch(e.target.value)}
                      />
                    </div>
                    
                    <button
                      onClick={() => {
                        setIsAddingTour(true);
                        setEditingTourId(null);
                        setTourForm({ ...initialTourForm, id: `T-${Date.now()}` });
                      }}
                      className="flex items-center justify-center gap-2 bg-[#00A699] hover:bg-[#008c81] text-white px-6 py-2.5 rounded-xl font-semibold transition shadow-lg whitespace-nowrap"
                    >
                      <Plus className="w-5 h-5" />
                      {t.quickActions.addTour}
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-lg overflow-hidden border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          {/* 🟢 2. เพิ่ม Checkbox ที่หัวตาราง */}
                          <th className="px-6 py-4 w-12 text-center">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-[#00A699] rounded border-gray-300 focus:ring-[#00A699] cursor-pointer"
                              checked={selectedTourIds.length === filteredTours.length && filteredTours.length > 0}
                              onChange={handleSelectAllTours}
                            />
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{language === 'th' ? 'รหัส' : 'ID'}</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.tours.name}</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.tours.province}</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.tours.duration}</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.tours.price}</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.table.actions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredTours.map((tour) => (
                          <tr key={tour.id} className={`transition ${selectedTourIds.includes(tour.id) ? 'bg-[#00A699]/5' : tour.isHidden ? 'bg-gray-100 opacity-60' : 'hover:bg-gray-50'}`}>
                            
                            {/* 🟢 3. เพิ่ม Checkbox ในแต่ละแถว */}
                            <td className="px-6 py-4 text-center">
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 text-[#00A699] rounded border-gray-300 focus:ring-[#00A699] cursor-pointer"
                                checked={selectedTourIds.includes(tour.id)}
                                onChange={() => handleSelectTour(tour.id)}
                              />
                            </td>

                            <td className="px-6 py-4 text-sm font-bold text-[#00A699]">{tour.id}</td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{getLang(tour, 'name', language)}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {typeof tour.province === 'object' && tour.province !== null
                                ? getLang(tour.province, 'name', language)
                                : getLang(tour, 'province', language)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {getLang(tour, 'duration', language) || '-'}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              ฿{Number(tour.price || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-900">{tour.rating || 0}</span>
                                <span className="text-yellow-400">★</span>
                                <span className="text-gray-500">({tour.reviewCount || 0})</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button onClick={() => setViewingCustomersForTour(tour)} className="text-blue-500 hover:text-blue-600 transition p-2" title={language === 'th' ? "ดูรายชื่อลูกค้า" : "View Customers"}>
                                  <Users className="w-5 h-5" />
                                </button>
                                
                                <button 
                                  onClick={() => handleToggleVisibility(tour)} 
                                  className={`transition p-2 ${tour.isHidden ? 'text-gray-400 hover:text-gray-600' : 'text-green-500 hover:text-green-600'}`}
                                  title={tour.isHidden ? "คลิกเพื่อแสดงทัวร์" : "คลิกเพื่อซ่อนทัวร์"}
                                >
                                  {tour.isHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>

                                <button onClick={() => handleEditClick(tour)} className="text-[#00A699] hover:text-[#008c81] transition p-2" title={language === 'th' ? "แก้ไขทัวร์" : "Edit Tour"}>
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDeleteTour(tour.id)} className="text-red-500 hover:text-red-600 transition p-2" title={language === 'th' ? "ลบทัวร์" : "Delete Tour"}>
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredTours.length === 0 && (
                          <tr>
                            {/* 🟢 4. แก้ colSpan จาก 7 เป็น 8 เพราะมีคอลัมน์เพิ่มมา */}
                            <td colSpan={8} className="text-center py-6 text-gray-500">{language === 'th' ? 'ไม่พบทัวร์ที่ค้นหา' : 'No tours found'}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
            
              // โค้ดส่วนฟอร
              /* ================= ฟอร์มเพิ่ม/แก้ไขทัวร์ ================= */
              <div className="bg-white rounded-3xl shadow-xl p-8 border animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                  <h2 className="text-2xl font-bold">
                    {editingTourId
                      ? (language === 'th' ? 'แก้ไขข้อมูลทัวร์' : 'Edit Tour Info')
                      : (language === 'th' ? 'ข้อมูลทัวร์และสถานที่ (สร้างใหม่)' : 'New Tour & Location Info')}
                  </h2>
                  <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <button onClick={(e) => { e.preventDefault(); setFormLang('en'); }} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${formLang === 'en' ? 'bg-white text-[#00A699] shadow' : ''}`}>EN</button>
                    <button onClick={(e) => { e.preventDefault(); setFormLang('th'); }} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${formLang === 'th' ? 'bg-white text-[#00A699] shadow' : ''}`}>TH</button>
                  </div>
                </div>

                <div className="space-y-10">
                  {/* 🟢 คลุมดำวางทับตั้งแต่บรรทัดนี้ลงไปเลยครับ */}
                  <div className="bg-[#00A699]/5 p-6 rounded-2xl border-2 border-dashed border-[#00A699]/20">
                    <div className="flex justify-between items-center mb-4">
                      <label className="font-bold flex items-center gap-2"><MapPin size={18} /> {language === 'th' ? 'ระบุจังหวัด' : 'Specify Province'}</label>
                      <div className="flex gap-4">
                        {/* 🟢 ปุ่มแก้ไข (โชว์เมื่อเลือกจังหวัดแล้ว และไม่ได้อยู่ในหน้าฟอร์ม) */}
                        {tourForm.provinceId && !createNewProvince && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              const selectedProv = allProvinces.find(p => p.id === tourForm.provinceId);
                              if (selectedProv) {
                                setTourForm({ ...tourForm, provinceId: selectedProv.id, province: getLang(selectedProv, 'name', language) });
                                setProvinceImage(selectedProv.image || '');
                                setIsEditingProvince(true);
                                setCreateNewProvince(true);
                              }
                            }}
                            className="text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" /> {language === 'th' ? 'แก้ไขจังหวัดนี้' : 'Edit this Province'}
                          </button>
                        )}

                        <button 
                          onClick={(e) => { 
                            e.preventDefault(); 
                            if (createNewProvince) {
                              setCreateNewProvince(false);
                              setIsEditingProvince(false);
                              if (isEditingProvince) {
                                setTourForm({ ...tourForm, provinceId: '', province: '' });
                                setProvinceImage('');
                              }
                            } else {
                              setTourForm({ ...tourForm, provinceId: '', province: '' });
                              setProvinceImage('');
                              setIsEditingProvince(false);
                              setCreateNewProvince(true);
                            }
                          }} 
                          className="text-xs font-bold text-[#00A699] hover:underline"
                        >
                          {createNewProvince ? (language === 'th' ? 'กลับไปเลือกจังหวัด' : 'Back to Select') : (language === 'th' ? '+ สร้างจังหวัดใหม่' : '+ Add New Province')}
                        </button>
                      </div>
                    </div>

                    {!createNewProvince ? (
                      /* ================= ระบบเลือกจังหวัดแบบค้นหาได้ ================= */
                      <div className="relative">
                        <div 
                          className="w-full p-4 bg-white border rounded-xl font-bold cursor-pointer flex justify-between items-center focus:ring-2 focus:ring-[#00A699]"
                          onClick={() => setIsProvinceOpen(!isProvinceOpen)}
                        >
                          <span className={tourForm.provinceId ? "text-gray-900" : "text-gray-400 font-normal"}>
                            {tourForm.provinceId 
                              ? getLang(allProvinces.find(p => p.id === tourForm.provinceId) || {}, 'name', language) || (language === 'th' ? '-- กรุณาเลือกจังหวัด --' : '-- Select Province --')
                              : (language === 'th' ? '-- กรุณาเลือกจังหวัด --' : '-- Select Province --')}
                          </span>
                          <span className="text-gray-400 text-xs">▼</span>
                        </div>

                        {isProvinceOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-2 border-b border-gray-100 bg-gray-50">
                              <input
                                type="text"
                                placeholder={language === 'th' ? "🔍 พิมพ์ชื่อจังหวัดเพื่อค้นหา..." : "🔍 Search province..."}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-normal focus:outline-none focus:ring-2 focus:ring-[#00A699]/20 focus:border-[#00A699] transition-all"
                                value={provinceSearch}
                                onChange={(e) => setProvinceSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()} 
                                autoFocus
                              />
                            </div>
                            <ul className="max-h-60 overflow-y-auto p-1 font-normal">
                              {allProvinces
                                .filter((p) => getLang(p, 'name', language)?.toLowerCase().includes(provinceSearch.toLowerCase()))
                                .map((province) => (
                                  <li
                                    key={province.id}
                                    className="px-3 py-2 hover:bg-[#00A699]/10 hover:text-[#00A699] rounded-lg cursor-pointer text-sm text-gray-700 transition-colors"
                                    onClick={() => {
                                      setTourForm({ ...tourForm, provinceId: province.id, province: province.name });
                                      setIsProvinceOpen(false);
                                      setProvinceSearch('');
                                    }}
                                  >
                                    {getLang(province, 'name', language)}
                                  </li>
                                ))}
                              {allProvinces.filter((p) => getLang(p, 'name', language)?.toLowerCase().includes(provinceSearch.toLowerCase())).length === 0 && (
                                <li className="px-3 py-4 text-center text-gray-400 text-sm">
                                  {language === 'th' ? 'ไม่พบชื่อจังหวัดที่ค้นหา' : 'No province found'}
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="grid grid-cols-2 gap-4">
                          {/* 🟢 ล็อคช่อง ID ไว้ถ้ากำลังแก้ไข (ป้องกัน ID เปลี่ยน) */}
                          <input 
                            placeholder="Province ID (e.g., hat-yai)" 
                            className={`p-4 border rounded-xl focus:ring-2 focus:ring-[#00A699] outline-none transition ${isEditingProvince ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`} 
                            value={tourForm.provinceId || ''}
                            disabled={isEditingProvince}
                            onChange={e => setTourForm({ ...tourForm, provinceId: e.target.value })} 
                          />
                          <input 
                            placeholder="Province Name (TH/EN)" 
                            className="p-4 bg-white border rounded-xl focus:ring-2 focus:ring-[#00A699] outline-none transition" 
                            value={(tourForm.province as string) || ''}
                            onChange={e => setTourForm({ ...tourForm, province: e.target.value })} 
                          />
                        </div>
                          
                        <div className="bg-white p-4 border rounded-xl">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            {language === 'th' ? 'รูปภาพจังหวัด (URL)' : 'Province Image (URL)'}
                          </label>
                          
                          {provinceImage ? (
                            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 group">
                              <img src={provinceImage} alt="Province Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  onClick={() => setProvinceImage('')}
                                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transform hover:scale-105 transition shadow-lg"
                                >
                                  <Trash2 className="w-4 h-4" /> {language === 'th' ? 'ลบรูปภาพ' : 'Remove Image'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                              <input 
                                type="text" 
                                placeholder={language === 'th' ? "วางลิงก์รูปภาพจังหวัดที่นี่ (https://...)" : "Paste province image URL here..."} 
                                className="w-full p-3 bg-gray-50 border border-transparent focus:border-[#00A699] focus:bg-white rounded-lg outline-none transition text-sm"
                                value={provinceImage}
                                onChange={e => setProvinceImage(e.target.value)} 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="block font-bold">{language === 'th' ? 'รหัสทัวร์ (ID)' : 'Tour ID'}</label>
                      <input className={`w-full p-4 border rounded-2xl ${editingTourId ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-50'}`}
                        placeholder="เช่น cm-003" value={tourForm.id || ''} disabled={!!editingTourId}
                        onChange={e => setTourForm({ ...tourForm, id: e.target.value })} />

                      <label className="block font-bold">{language === 'th' ? 'ชื่อทัวร์' : 'Tour Name'} ({formLang.toUpperCase()})</label>
                      <input className="w-full p-4 bg-gray-50 border rounded-2xl" value={formLang === 'en' ? (tourForm.name || '') : (tourForm.name_th || '')}
                        onChange={e => setTourForm({ ...tourForm, [formLang === 'en' ? 'name' : 'name_th']: e.target.value })} />

                      <label className="block font-bold">{language === 'th' ? 'รายละเอียด' : 'Description'} ({formLang.toUpperCase()})</label>
                      <textarea className="w-full p-4 bg-gray-50 border rounded-2xl h-32" value={formLang === 'en' ? (tourForm.description || '') : (tourForm.description_th || '')}
                        onChange={e => setTourForm({ ...tourForm, [formLang === 'en' ? 'description' : 'description_th']: e.target.value })} />

                      <label className="block font-bold">{language === 'th' ? 'ราคาพื้นฐาน' : 'Base Price'}</label>
                      <input type="number" className="w-full p-4 bg-gray-50 border rounded-2xl font-bold text-[#00A699]" placeholder="0" value={tourForm.price || ''}
                        onChange={e => setTourForm({ ...tourForm, price: Number(e.target.value) })} />

                      {/* 🌟 1. ข้อมูลยานพาหนะและจำนวนคน */}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block font-bold text-orange-600">{language === 'th' ? 'ประเภทยานพาหนะ' : 'Vehicle Type'}</label>
                          <input className="w-full p-4 bg-gray-50 border rounded-2xl" placeholder="เช่น รถตู้ VIP, สปีดโบ๊ท" value={tourForm.vehicleType || ''} onChange={e => setTourForm({ ...tourForm, vehicleType: e.target.value })} />
                        </div>
                        <div>
                          <label className="block font-bold text-orange-600">{language === 'th' ? 'รับจำนวนสูงสุด (คน)' : 'Max Capacity'}</label>
                          <input type="number" className="w-full p-4 bg-gray-50 border rounded-2xl font-bold" placeholder="10" value={tourForm.maxCapacity || ''} onChange={e => setTourForm({ ...tourForm, maxCapacity: Number(e.target.value) })} />
                        </div>
                      </div>

                    </div>
                    <div className="space-y-4">

                      {/* 🌟 2. เลือกประเภททริป จำนวนวัน และปฏิทินของแอดมิน */}
                      {/* 🌟 2. เลือกประเภททริป จำนวนวัน และปฏิทินของแอดมิน */}
                      <div className="p-5 border border-blue-100 bg-blue-50/30 rounded-2xl space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block font-bold text-blue-600 mb-2">{language === 'th' ? 'ประเภททริป' : 'Trip Type'}</label>
                            <select className="w-full p-3 bg-white border border-blue-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-400"
                              value={tourForm.tripType || 'one-day'}
                              onChange={e => setTourForm({ ...tourForm, tripType: e.target.value })}>
                              <option value="one-day">One Day (ไปเช้าเย็นกลับ)</option>
                              <option value="multiple-days">Multiple Days (หลายวัน/ไม่รวมที่พัก)</option>
                              <option value="package">Package (หลายวัน + มีที่พัก)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-bold text-blue-600 mb-2">{language === 'th' ? 'จำนวนวันเดินทาง' : 'Trip Days'}</label>
                            <input type="number" className={`w-full p-3 bg-white border border-blue-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-400 ${tourForm.tripType === 'one-day' ? 'opacity-50' : ''}`}
                              min="1"
                              value={tourForm.tripDays || 1}
                              disabled={tourForm.tripType === 'one-day'}
                              onChange={e => setTourForm({ ...tourForm, tripDays: Number(e.target.value) })} />
                          </div>
                        </div>

                        {/* 🟢 แสดงช่องกรอกชื่อที่พักอัตโนมัติเมื่อเลือก Package */}
                        {tourForm.tripType === 'package' && (
                          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block font-bold text-blue-600 mb-2">{language === 'th' ? 'ชื่อที่พัก (Accommodation)' : 'Accommodation'}</label>
                            <input className="w-full p-3 bg-white border border-blue-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400" 
                              placeholder={language === 'th' ? "เช่น โรงแรม ABC ภูเก็ต" : "e.g., ABC Hotel Phuket"}
                              value={tourForm.accommodation || ''}
                              onChange={e => setTourForm({ ...tourForm, accommodation: e.target.value })} 
                            />
                          </div>
                        )}

                        <div> 
                          <label className="block font-bold text-blue-600 mb-2">
                            {language === 'th' ? 'กำหนดวันเปิดรอบ (จิ้มที่ปฏิทินเพื่อเพิ่ม/ลบ)' : 'Available Dates (Click to toggle)'}
                          </label>

                          {/* 🌟 Calendar Component สำหรับ Admin */}
                          <div className="bg-white border border-blue-100 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-3">
                              <button onClick={adminPrevMonth} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"><ChevronLeft className="w-5 h-5" /></button>
                              <div className="font-bold text-sm text-gray-800">{adminMonthNames[adminMonth.getMonth()]} {adminMonth.getFullYear()}</div>
                              <button onClick={adminNextMonth} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"><ChevronRight className="w-5 h-5" /></button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center mb-1">
                              {adminWeekDays.map(day => <div key={day} className="text-[10px] font-bold text-gray-400 py-1">{day}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-y-1 text-center">
                              {Array.from({ length: adminStartDay }).map((_, i) => <div key={`empty-${i}`} />)}
                              {Array.from({ length: adminDaysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dateStr = `${adminMonth.getFullYear()}-${String(adminMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                const isStart = (tourForm.availableDates || []).includes(dateStr);
                                const inRange = isDateInAnyAdminRange(dateStr);

                                let bgClass = "hover:bg-blue-50 text-gray-700";
                                if (isStart) bgClass = "bg-blue-600 text-white shadow-sm shadow-blue-200 z-10 rounded-lg font-bold";
                                else if (inRange) bgClass = "bg-blue-50 text-blue-600 font-bold border-y border-blue-100 rounded-none";

                                return (
                                  <div key={i} className={`relative flex items-center justify-center ${inRange && !isStart ? 'bg-blue-50' : ''}`}>
                                    <button
                                      onClick={(e) => toggleAvailableDate(e, dateStr)}
                                      className={`w-full aspect-square flex items-center justify-center text-xs transition-all ${bgClass} ${!isStart && !inRange ? 'rounded-lg' : ''}`}
                                    >
                                      {day}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          {tourForm.availableDates && tourForm.availableDates.length > 0 && (
                            <p className="text-xs text-blue-500 mt-2 font-medium">
                              เปิดไว้ทั้งหมด {tourForm.availableDates.length} รอบ (คลิกซ้ำเพื่อเอาออก)
                            </p>
                          )}
                        </div>
                      </div>

                      <label className="block font-bold">{language === 'th' ? 'รูปภาพหลัก' : 'Main Image'} (URL)</label>
                      <input className="w-full p-4 bg-gray-50 border rounded-2xl" placeholder="https://..." value={tourForm.image || ''}
                        onChange={e => setTourForm({ ...tourForm, image: e.target.value })} />

                      <label className="block font-bold">{language === 'th' ? 'คำอธิบายระยะเวลา' : 'Duration Text'}</label>
                      <input className="w-full p-4 bg-gray-50 border rounded-2xl" placeholder="เช่น 3 วัน 2 คืน" value={tourForm.duration || ''}
                        onChange={e => setTourForm({ ...tourForm, duration_th: e.target.value, duration: e.target.value })} />
                    </div>
                  </div>
                  

                  
                  {/* 🟢 ส่วนที่เพิ่มใหม่: จุดเด่น สิ่งที่รวม และสิ่งที่ไม่รวม */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t">
                    <div className="space-y-4">
                      <label className="block font-bold text-[#00A699]">{language === 'th' ? 'จุดเด่น (Highlights)' : 'Highlights'} ({formLang.toUpperCase()})</label>
                      <textarea className="w-full p-4 bg-gray-50 border rounded-2xl h-32 text-sm leading-relaxed"
                        placeholder={language === 'th' ? "เช่น ดำน้ำดูปะการัง, ชมวิวภูเขา (ใช้เครื่องหมาย , คั่นข้อ)" : "e.g. Snorkeling, Mountain View (comma separated)"}
                        value={formLang === 'en' ? (tourForm.highlights?.join(',') || '') : (tourForm.highlights_th?.join(',') || '')}
                        onChange={e => {
                          const val = e.target.value;
                          const arr = val ? val.split(',') : [];
                          setTourForm({ ...tourForm, [formLang === 'en' ? 'highlights' : 'highlights_th']: arr });
                        }} />
                    </div>

                    <div className="space-y-4">
                      <label className="block font-bold text-green-600">{language === 'th' ? 'สิ่งที่รวม (Included)' : 'Included'} ({formLang.toUpperCase()})</label>
                      <textarea className="w-full p-4 bg-gray-50 border rounded-2xl h-32 text-sm leading-relaxed"
                        placeholder={language === 'th' ? "เช่น รถรับส่ง, อาหารกลางวัน (ใช้เครื่องหมาย , คั่นข้อ)" : "e.g. Transfer, Lunch (comma separated)"}
                        value={formLang === 'en' ? (tourForm.included?.join(',') || '') : (tourForm.included_th?.join(',') || '')}
                        onChange={e => {
                          const val = e.target.value;
                          const arr = val ? val.split(',') : [];
                          setTourForm({ ...tourForm, [formLang === 'en' ? 'included' : 'included_th']: arr });
                        }} />
                    </div>

                    <div className="space-y-4">
                      <label className="block font-bold text-red-600">{language === 'th' ? 'สิ่งที่ไม่รวม (Not Included)' : 'Not Included'} ({formLang.toUpperCase()})</label>
                      <textarea className="w-full p-4 bg-gray-50 border rounded-2xl h-32 text-sm leading-relaxed"
                        placeholder={language === 'th' ? "เช่น ค่าใช้จ่ายส่วนตัว, ทิปไกด์ (ใช้เครื่องหมาย , คั่นข้อ)" : "e.g. Personal expenses, Guide tips (comma separated)"}
                        value={formLang === 'en' ? (tourForm.notIncluded?.join(',') || '') : (tourForm.notIncluded_th?.join(',') || '')}
                        onChange={e => {
                          const val = e.target.value;
                          const arr = val ? val.split(',') : [];
                          setTourForm({ ...tourForm, [formLang === 'en' ? 'notIncluded' : 'notIncluded_th']: arr });
                        }} />
                    </div>
                  </div>

                  <div className="border-t pt-8">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold flex items-center gap-2"><ListChecks /> {tourT.itinerary}</h3>
                      <button onClick={(e) => { e.preventDefault(); handleAddDay(); }} className="text-[#00A699] font-bold text-sm">{language === 'th' ? '+ เพิ่มวันเดินทาง' : '+ Add Day'}</button>
                    </div>
                    <div className="space-y-4">
                      {tourForm.itinerary?.map((day, idx) => (
                        <div key={idx} className="p-6 bg-gray-50 rounded-2xl border relative">
                          <span className="absolute -top-3 left-4 bg-[#00A699] text-white px-3 py-1 rounded-lg text-xs font-bold uppercase">DAY {day.day}</span>
                          <input className="w-full p-3 bg-white border rounded-xl font-bold mb-3" placeholder="Day Title (TH/EN)" value={day.title || ''}
                            onChange={e => {
                              const updated = [...(tourForm.itinerary || [])];
                              updated[idx] = { ...updated[idx], title: e.target.value, title_th: e.target.value };
                              setTourForm({ ...tourForm, itinerary: updated });
                            }} />
                          <textarea className="w-full p-3 bg-white border rounded-xl text-sm" placeholder={language === 'th' ? "กิจกรรมรายวัน (ใช้เครื่องหมาย , แยกกิจกรรม)" : "Daily activities (comma separated)"} value={day.activities?.join(',') || ''}
                            onChange={e => {
                              const updated = [...(tourForm.itinerary || [])];
                              updated[idx] = { ...updated[idx], activities: e.target.value.split(','), activities_th: e.target.value.split(',') };
                              setTourForm({ ...tourForm, itinerary: updated });
                            }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-10 border-t">
                    <button onClick={(e) => { e.preventDefault(); handleSaveTour(); }} className="flex-1 bg-[#00A699] hover:bg-[#008c81] text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition">
                      {editingTourId ? (language === 'th' ? 'บันทึกการแก้ไข' : 'Save Changes') : (language === 'th' ? 'บันทึกและเผยแพร่' : 'Save & Publish')}
                    </button>
                    <button onClick={(e) => { e.preventDefault(); setIsAddingTour(false); setEditingTourId(null); }} className="px-10 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-200 transition">
                      {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      

      {/* ================= MODALS ================= */}

      {/* 1. Modal ดูรายละเอียดและกดอนุมัติของ Admin */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">จัดการการจอง</h2>
                <div className="text-sm font-mono text-gray-500 mt-1">Ref: {selectedBooking.id}</div>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-900 bg-gray-100 p-2 rounded-full transition">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div>
                <span className="text-xs text-gray-500 block mb-1">สถานะที่นั่ง (Booking Status)</span>
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${selectedBooking.status?.toLowerCase() === 'pending' ? 'bg-orange-100 text-orange-800' :
                  selectedBooking.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {selectedBooking.status?.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">สถานะชำระเงิน (Payment Status)</span>
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${selectedBooking.paymentStatus?.toLowerCase() === 'verifying' ? 'bg-blue-100 text-blue-800' :
                  selectedBooking.paymentStatus?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {selectedBooking.paymentStatus?.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-8 text-sm">
              <div><span className="text-gray-500 block mb-1">ชื่อทัวร์:</span> <div className="font-bold text-gray-900">{getLang(selectedBooking, 'tourNameSnapshot', language)}</div></div>
              <div><span className="text-gray-500 block mb-1">วันที่เดินทาง:</span> <div className="font-medium text-gray-900">{new Date(selectedBooking.travelDate || selectedBooking.date).toLocaleDateString('th-TH')}</div></div>
              <div><span className="text-gray-500 block mb-1">จำนวนผู้เดินทาง:</span> <div className="font-medium text-gray-900">{selectedBooking.travelers} ท่าน</div></div>
              <div><span className="text-gray-500 block mb-1">ยอดรวมสุทธิ:</span> <div className="font-black text-[#00A699] text-lg">฿{selectedBooking.totalPrice?.toLocaleString()}</div></div>
            </div>

            <div className="space-y-4">
              {selectedBooking.status?.toLowerCase() === 'pending' && (
                <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl">
                  <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2"><Calendar className="w-5 h-5" /> 1. อนุมัติที่นั่งว่าง (Seat Approval)</h4>
                  <p className="text-sm text-orange-800 mb-4">กรุณาตรวจสอบว่ามีที่นั่งว่างสำหรับทัวร์นี้หรือไม่ ก่อนกดยืนยัน</p>
                  <div className="flex gap-3">
                    <button onClick={() => handleApproveBooking(selectedBooking.id)} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition">อนุมัติให้ที่นั่ง (Approve)</button>
                    <button onClick={() => handleRejectBooking(selectedBooking.id)} className="px-6 bg-white border border-orange-200 text-orange-700 py-3 rounded-xl font-bold hover:bg-orange-100 transition">ปฏิเสธและยกเลิก</button>
                  </div>
                </div>
              )}

              {selectedBooking.paymentStatus?.toLowerCase() === 'verifying' && (
                <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2"><DollarSign className="w-5 h-5" /> 2. ตรวจสอบสลิปเงิน (Payment Verification)</h4>
                  {selectedBooking.paymentSlip ? (
                    <div className="mb-4">
                      <img src={selectedBooking.paymentSlip} alt="slip" className="w-full max-h-48 object-contain bg-white border rounded-xl cursor-pointer hover:border-blue-400" onClick={() => window.open(selectedBooking.paymentSlip, '_blank')} />
                      <p className="text-xs text-center text-blue-600 mt-2">คลิกที่รูปเพื่อดูขนาดเต็ม</p>
                    </div>
                  ) : (
                    <div className="text-sm text-red-500 mb-4 bg-white p-3 rounded-lg border border-red-100 text-center">ลูกค้ายังไม่แนบสลิป หรือเกิดข้อผิดพลาดในการโหลดรูป</div>
                  )}
                  <div className="flex gap-3">
                    <button onClick={() => handleApprovePayment(selectedBooking.id)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-blue-500/30">สลิปถูกต้อง อนุมัติยอดเงิน</button>
                    <button onClick={() => handleRejectPayment(selectedBooking.id)} className="px-6 bg-white border border-red-200 text-red-600 py-3 rounded-xl font-bold hover:bg-red-50 transition">สลิปผิด/ยกเลิก</button>
                  </div>
                </div>
              )}
            </div>

            {selectedBooking.status?.toLowerCase() === 'approved' && selectedBooking.paymentStatus?.toLowerCase() === 'completed' && (
              <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded-2xl flex items-center gap-3 text-green-800">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <div className="font-bold">รายการนี้สมบูรณ์แล้ว 100%</div>
                  <div className="text-sm">อนุมัติที่นั่งและตรวจสอบยอดเงินเรียบร้อยแล้ว</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Custom Popup Modal (Alert / Confirm) */}
      {popup.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-sm border-4 ${popup.type === 'confirm' ? 'bg-orange-50 border-orange-100 text-[#FF6B4A]' : 'bg-[#00A699]/10 border-[#00A699]/20 text-[#00A699]'}`}>
              {popup.type === 'confirm' ? <AlertCircle className="w-10 h-10" /> : <CheckCircle className="w-10 h-10" />}
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">{popup.title}</h3>
            <p className="text-gray-500 mb-8 leading-relaxed text-sm">{popup.message}</p>
            <div className="flex gap-3">
              {popup.type === 'confirm' && (
                <button onClick={closePopup} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-2xl font-bold active:scale-95 transition">
                  {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
              )}
              <button
                onClick={() => { if (popup.type === 'confirm' && popup.onConfirm) { popup.onConfirm(); } else { closePopup(); } }}
                className={`flex-1 text-white py-3.5 rounded-2xl font-bold active:scale-95 transition shadow-lg ${popup.type === 'confirm' ? 'bg-[#FF6B4A] hover:bg-[#ff5232] shadow-orange-200' : 'bg-[#00A699] hover:bg-[#008c81] shadow-[#00A699]/30'}`}
              >
                {popup.type === 'confirm' ? (language === 'th' ? 'ยืนยัน' : 'Confirm') : (language === 'th' ? 'ตกลง' : 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}
      {viewingCustomersForTour && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{language === 'th' ? 'รายชื่อลูกค้าที่จอง' : 'Customer List'}</h2>
                <p className="text-[#00A699] font-medium mt-1">{getLang(viewingCustomersForTour, 'name', language)}</p>
              </div>
              <button onClick={() => setViewingCustomersForTour(null)} className="text-gray-400 hover:text-gray-900 bg-gray-100 p-2 rounded-full transition">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-sm text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-semibold">Booking ID</th>
                    <th className="p-4 font-semibold">วันที่จอง</th>
                    <th className="p-4 font-semibold">วันที่เดินทาง</th>
                    <th className="p-4 text-center font-semibold">จำนวนผู้เดินทาง</th>
                    <th className="p-4 text-right font-semibold">สถานะการจ่ายเงิน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookingsList
                    // 🟢 แก้ไขตรงนี้: ให้เช็คทั้ง b.tour?.id และ b.tourId
                    .filter(b => String((b.tour as any)?.id || b.tourId) === String(viewingCustomersForTour.id))
                    .map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-bold text-gray-900">{b.id}</td>
                      <td className="p-4 text-sm">{new Date(b.bookingDate || (b as any).createdAt || '').toLocaleDateString('th-TH')}</td>
                      <td className="p-4 text-sm text-[#00A699] font-medium">{new Date((b as any).travelDate || (b as any).date || '').toLocaleDateString('th-TH')}</td>
                      <td className="p-4 text-center font-bold text-blue-600 bg-blue-50/50 rounded-lg">{b.travelers} ท่าน</td>
                      <td className="p-4 text-right">
                         <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${
                           b.paymentStatus?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                         }`}>
                           {b.paymentStatus?.toLowerCase() === 'completed' ? 'จ่ายแล้ว' : 'รอตรวจสอบ'}
                         </span>
                      </td>
                    </tr>
                  ))}
                  
                  {/* 🟢 แก้ไขเงื่อนไขตรงนี้ด้วยเหมือนกัน */}
                  {bookingsList.filter(b => String((b.tour as any)?.id || b.tourId) === String(viewingCustomersForTour.id)).length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <Users className="w-12 h-12 mb-3 text-gray-300" />
                          <p className="text-lg font-medium text-gray-500">ยังไม่มีลูกค้าจองแพ็กเกจนี้</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


