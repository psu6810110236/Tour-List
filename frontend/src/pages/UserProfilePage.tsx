// src/pages/UserProfilePage.tsx
import { useState, useRef, useEffect } from "react";
import {
  User, Mail, Phone, Lock, Calendar, Settings, CreditCard,
  Bell, HelpCircle, ChevronRight, Check, X, Eye, EyeOff,
  Camera, LogOut, MapPin, Clock, Users, BadgeCheck, Hourglass,
  Shield, Trash2
} from "lucide-react";
import { useAuth } from "../features/auth/context/AuthContext";
import { bookingService, userService } from "../services/api";

interface UserProfilePageProps {
  language: "th" | "en";
  onNavigate: (page: string, data?: any) => void;
}

const statusConfig: Record<string, { label_th: string; label_en: string; color: string; bg: string; icon: any }> = {
  PENDING:   { label_th: "รอตรวจสอบ", label_en: "Pending",   color: "text-amber-600",  bg: "bg-amber-50 border-amber-200",   icon: Hourglass },
  APPROVED:  { label_th: "อนุมัติแล้ว", label_en: "Approved", color: "text-green-600",  bg: "bg-green-50 border-green-200",   icon: BadgeCheck },
  REJECTED:  { label_th: "ไม่อนุมัติ", label_en: "Rejected", color: "text-red-600",    bg: "bg-red-50 border-red-200",       icon: X },
  CANCELLED: { label_th: "ยกเลิกแล้ว", label_en: "Cancelled", color: "text-gray-500",  bg: "bg-gray-50 border-gray-200",     icon: X },
};

export function UserProfilePage({ language, onNavigate }: UserProfilePageProps) {
  const { user, logout } = useAuth() as any;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage] = useState<string | null>(localStorage.getItem("userProfileImage"));
  
  const [displayFullName, setDisplayFullName] = useState(user?.fullName || "Normal User");
  const [displayPhone, setDisplayPhone] = useState((user as any)?.phone || "");

  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: displayFullName,
    email: user?.email || "",
    phone: displayPhone,
  });

  const [passwordForm, setPasswordForm] = useState<{
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const name = storedUser.fullName || user.fullName || "Normal User";
      const phone = storedUser.phone || user.phone || "";
      
      setDisplayFullName(name);
      setDisplayPhone(phone);
      setEditForm(prev => ({ ...prev, fullName: name, phone: phone }));
    }
  }, [user]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoadingBookings(true);
        const res = await bookingService.getMyBookings();
        const mine: any[] = res.data || [];
        setBookings(mine);
      } catch {
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };
    if (user?.id) fetchBookings();
  }, [user?.id]);

  const totalBookings = bookings.length;
  const pendingCount  = bookings.filter(b => b.status?.toUpperCase() === "PENDING").length;
  const approvedCount = bookings.filter(b => b.status?.toUpperCase() === "APPROVED").length;
  const totalSpent    = bookings
    .filter(b => b.status?.toUpperCase() === "APPROVED")
    .reduce((s, b) => s + Number(b.totalPrice || 0), 0);
  const recentBookings = [...bookings].sort((a, b) =>
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  ).slice(0, 3);

  const memberYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();

  const avatar = displayFullName
    ? displayFullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setProfileImage(result);
      localStorage.setItem("userProfileImage", result);
      window.dispatchEvent(new Event("profileImageUpdated"));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    const updateUI = () => {
      setDisplayFullName(editForm.fullName);
      setDisplayPhone(editForm.phone);
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.fullName = editForm.fullName;
        storedUser.phone = editForm.phone;
        localStorage.setItem('user', JSON.stringify(storedUser));
        window.dispatchEvent(new Event("userInfoUpdated")); 
      } catch (e) {}

      setProfileSuccess(true);
      setTimeout(() => {
        setProfileSuccess(false);
        setShowSettingsModal(false);
      }, 1000);
    };

    try {
      if (userService?.updateProfile) {
        await userService.updateProfile({
          fullName: editForm.fullName,
          phone: editForm.phone,
        });
      }
      updateUI();
    } catch {
      updateUI();
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError(language === "th" ? "กรุณากรอกข้อมูลให้ครบ" : "Please fill in all fields");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(language === "th" ? "รหัสผ่านใหม่ไม่ตรงกัน" : "Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError(language === "th" ? "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" : "Min 8 characters");
      return;
    }
    try {
      // @ts-ignore
      await userService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      
      setPasswordSuccess(true);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => { setPasswordSuccess(false); setShowPasswordModal(false); }, 2000);
    } catch {
      setPasswordError(language === "th" ? "รหัสผ่านเดิมไม่ถูกต้อง" : "Incorrect current password");
    }
  };

  const formatDate = (d: string) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
        day: "numeric", month: "short", year: "numeric"
      });
    } catch { return d; }
  };

  // ✅ เปลี่ยน Action ของปุ่มวิธีการชำระเงิน ให้เปลี่ยนหน้าได้
  const quickMenuItems = [
    { icon: Calendar,    label_th: "ดูประวัติการจองทั้งหมด", label_en: "View All Bookings",     action: () => onNavigate("bookings"),  color: "text-[#00A699]", bg: "bg-teal-50" },
    { icon: Settings,    label_th: "ตั้งค่าบัญชี",             label_en: "Account Settings",        action: () => setShowSettingsModal(true), color: "text-blue-600",  bg: "bg-blue-50" },
    { icon: CreditCard,  label_th: "วิธีการชำระเงิน",         label_en: "Payment Methods",        action: () => onNavigate("payment-methods"), color: "text-purple-600", bg: "bg-purple-50" },
    { icon: Bell,        label_th: "การแจ้งเตือน",             label_en: "Notifications",          action: () => {},                      color: "text-orange-600", bg: "bg-orange-50" },
    { icon: HelpCircle,  label_th: "ช่วยเหลือและสนับสนุน",    label_en: "Help & Support",         action: () => {},                      color: "text-gray-600",   bg: "bg-gray-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">

      {/* Hero Banner */}
      <div className="bg-[#00A699] relative overflow-hidden pb-24 pt-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

            <div className="flex items-center gap-6">
              <div className="relative group shrink-0">
                {/* ขยายขนาดรูป Profile */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl sm:text-5xl font-black text-[#00A699]">{avatar}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors border border-gray-100 cursor-pointer group-hover:scale-105"
                >
                  <Camera className="w-5 h-5 text-[#00A699]" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>

              <div>
                {/* ขยายขนาดชื่อและอีเมล */}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                  {displayFullName}
                </h1>
                <div className="flex flex-col gap-2">
                  <p className="text-white/90 text-base flex items-center gap-2 font-medium">
                    <Mail className="w-5 h-5 opacity-70" /> {user?.email || "user@example.com"}
                  </p>
                  <div className="text-white/80 text-sm flex items-center gap-2">
                    <Calendar className="w-5 h-5 opacity-70" />
                    <span>{language === "th" ? `เป็นสมาชิกตั้งแต่ ${memberYear}` : `Member since ${memberYear}`}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => { if (logout) logout(); onNavigate("home"); }}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3 rounded-xl transition-all text-base backdrop-blur-md self-start sm:self-center"
            >
              <LogOut className="w-5 h-5" />
              {language === "th" ? "ออกจากระบบ" : "Sign Out"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20 mb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
          {[
            { label_th: "การจองทั้งหมด", label_en: "Total Bookings", value: totalBookings, icon: Calendar, color: "text-[#00A699]", iconBg: "bg-[#00A699]/10" },
            { label_th: "รอตรวจสอบ",    label_en: "Pending",         value: pendingCount,  icon: Hourglass, color: "text-amber-500", iconBg: "bg-amber-100" },
            { label_th: "อนุมัติแล้ว",  label_en: "Approved",        value: approvedCount, icon: BadgeCheck, color: "text-green-500", iconBg: "bg-green-100" },
            { label_th: "ยอดใช้จ่ายรวม", label_en: "Total Spent",   value: `฿${totalSpent.toLocaleString()}`, icon: CreditCard, color: "text-blue-500", iconBg: "bg-blue-100" },
          ].map(({ label_th, label_en, value, icon: Icon, color, iconBg }) => (
            // ขยาย Padding และขนาดตัวอักษร
            <div key={label_th} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow flex flex-col justify-between h-full">
              <div className="flex items-start justify-between mb-4">
                <span className="text-base text-gray-500 font-semibold leading-tight">
                  {language === "th" ? label_th : label_en}
                </span>
                <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
              </div>
              <div className="text-4xl font-black text-gray-800 tracking-tight">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"> {/* ขยายระยะห่างคอลัมน์ */}

          {/* Left: Bookings + Profile Display */}
          <div className="lg:col-span-2 space-y-8">

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-900">
                  {language === "th" ? "การจองล่าสุด" : "Recent Bookings"}
                </h2>
                <button
                  onClick={() => onNavigate("bookings")}
                  className="text-[#00A699] text-base font-bold hover:underline flex items-center gap-1"
                >
                  {language === "th" ? "ดูทั้งหมด" : "View all"} →
                </button>
              </div>

              {loadingBookings ? (
                <div className="px-8 py-16 text-center text-gray-400 text-base">
                  <div className="w-8 h-8 border-2 border-[#00A699] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  {language === "th" ? "กำลังโหลด..." : "Loading..."}
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="px-8 py-16 text-center">
                  {/* ขยายไอคอนและตัวหนังสือหน้า Empty State */}
                  <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium text-base mb-4">
                    {language === "th" ? "ยังไม่มีประวัติการจอง" : "No bookings yet"}
                  </p>
                  <button
                    onClick={() => onNavigate("home")}
                    className="mt-2 text-base text-[#00A699] font-bold hover:underline"
                  >
                    {language === "th" ? "ค้นหาทัวร์" : "Explore Tours"}
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentBookings.map((booking) => {
                    const status = statusConfig[booking.status?.toUpperCase()] || statusConfig.PENDING;
                    const StatusIcon = status.icon;
                    return (
                      <div key={booking.id} className="px-8 py-5 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-base truncate mb-1">
                              {booking.tourNameSnapshot_th && language === "th"
                                ? booking.tourNameSnapshot_th
                                : booking.tourNameSnapshot || `Tour #${booking.tourId}`}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                {language === "th" ? `รหัส: ${booking.id?.toString().slice(-6) || "-"}` : `ID: ${booking.id?.toString().slice(-6) || "-"}`}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {formatDate(booking.travelDate || booking.date)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                {booking.travelers || booking.pax} {language === "th" ? "ท่าน" : "pax"}
                              </span>
                            </div>
                            <p className="text-[#00A699] font-black text-base mt-2">
                              ฿{Number(booking.totalPrice || 0).toLocaleString()}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full border ${status.bg} ${status.color} shrink-0`}>
                            <StatusIcon className="w-4 h-4" />
                            {language === "th" ? status.label_th : status.label_en}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Profile Info Display Only */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-900">
                  {language === "th" ? "ข้อมูลส่วนตัว" : "Personal Information"}
                </h2>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="text-base font-bold text-[#00A699] bg-teal-50 px-5 py-2 rounded-xl hover:bg-teal-100 transition-colors flex items-center gap-2"
                >
                  ✏️ {language === "th" ? "แก้ไข" : "Edit"}
                </button>
              </div>

              <div className="px-8 py-6 space-y-5">
                {[
                  { key: "fullName", label_th: "ชื่อ-นามสกุล", label_en: "Full Name",    icon: User,  value: displayFullName },
                  { key: "email",    label_th: "อีเมล",         label_en: "Email",        icon: Mail,  value: user?.email },
                  { key: "phone",    label_th: "เบอร์โทรศัพท์", label_en: "Phone Number", icon: Phone, value: displayPhone },
                ].map(({ key, label_th, label_en, icon: Icon, value }) => (
                  <div key={key}>
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                      {language === "th" ? label_th : label_en}
                    </label>
                    <div className="flex items-center gap-4 px-5 py-4 bg-gray-50 rounded-xl border border-gray-100">
                      {/* ขยายไอคอนและตัวหนังสือด้านใน */}
                      <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                        <Icon className="w-5 h-5 text-[#00A699]" />
                      </div>
                      <span className="font-semibold text-gray-900 text-base">
                        {value || (key === "phone" ? (language === "th" ? "ยังไม่ได้ระบุ" : "Not specified") : "-")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Quick Menu */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-900">
                  {language === "th" ? "เมนูด่วน" : "Quick Menu"}
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {quickMenuItems.map(({ icon: Icon, label_th, label_en, action, color, bg }) => (
                  <button
                    key={label_th}
                    onClick={action}
                    className="w-full flex items-center gap-4 px-8 py-5 hover:bg-gray-50 transition-colors group text-left"
                  >
                    {/* ขยายไอคอนในเมนู */}
                    <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <span className="font-bold text-gray-700 text-base flex-1">
                      {language === "th" ? label_th : label_en}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-gradient-to-br from-[#00A699] to-teal-400 rounded-2xl p-8 text-white">
              <h3 className="font-extrabold text-lg mb-2">
                {language === "th" ? "ต้องการความช่วยเหลือ?" : "Need Help?"}
              </h3>
              <p className="text-white/90 text-sm mb-6 leading-relaxed">
                {language === "th"
                  ? "ทีมสนับสนุนของเราพร้อมให้บริการตลอด 24 ชั่วโมง"
                  : "Our support team is available 24/7"}
              </p>
              <button className="bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold text-base px-5 py-3 rounded-xl transition-colors w-full">
                {language === "th" ? "ติดต่อเรา" : "Contact Us"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Settings Modal ────────────────────────────── */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
            
            <div className="shrink-0 flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-white z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
                  <Settings className="w-5 h-5 text-[#00A699]" />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900">
                  {language === "th" ? "ตั้งค่าบัญชี" : "Account Settings"}
                </h3>
              </div>
              <button onClick={() => {
                  setShowSettingsModal(false);
                  setEditForm({ fullName: displayFullName, email: user?.email || "", phone: displayPhone });
                }}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 px-7 py-6 space-y-8 bg-gray-50/50">
              
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  {language === "th" ? "ข้อมูลส่วนตัว" : "Personal Information"}
                </h4>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                      {language === "th" ? "ชื่อ-นามสกุล" : "Full Name"}
                    </label>
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={e => setEditForm(p => ({ ...p, fullName: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:bg-white focus:border-[#00A699] transition-all font-semibold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                      {language === "th" ? "อีเมล (ไม่สามารถแก้ไขได้)" : "Email (Read-only)"}
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-100 rounded-xl outline-none font-semibold text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                      {language === "th" ? "เบอร์โทรศัพท์" : "Phone Number"}
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:bg-white focus:border-[#00A699] transition-all font-semibold text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  {language === "th" ? "ความปลอดภัย" : "Security"}
                </h4>
                <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-gray-200 transition-all">
                        <Lock className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 text-sm">{language === "th" ? "เปลี่ยนรหัสผ่าน" : "Change Password"}</p>
                        <p className="text-xs text-gray-500">{language === "th" ? "อัปเดตรหัสผ่านเพื่อความปลอดภัย" : "Update your password to stay secure"}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-red-600 mb-4 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-500" />
                  {language === "th" ? "พื้นที่อันตราย" : "Danger Zone"}
                </h4>
                <div className="bg-red-50 p-5 rounded-2xl border border-red-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-red-900 text-sm">{language === "th" ? "ลบบบัญชีผู้ใช้" : "Delete Account"}</p>
                    <p className="text-xs text-red-600/80 mt-1 max-w-[250px]">
                      {language === "th" ? "การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลของคุณจะถูกลบถาวร" : "Once you delete your account, there is no going back. Please be certain."}
                    </p>
                  </div>
                  <button className="bg-white text-red-600 border border-red-200 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors shadow-sm shrink-0">
                    {language === "th" ? "ลบบบัญชี" : "Delete"}
                  </button>
                </div>
              </div>

            </div>

            <div className="shrink-0 p-5 border-t border-gray-100 bg-white z-20">
               {profileSuccess && (
                <div className="mb-4 flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-semibold border border-green-200">
                  <Check className="w-4 h-4" />
                  {language === "th" ? "บันทึกข้อมูลสำเร็จ!" : "Saved successfully!"}
                </div>
              )}
              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="w-full bg-[#00A699] hover:bg-[#008c81] text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSavingProfile ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                {language === "th" ? "บันทึกการเปลี่ยนแปลง" : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Change Password Modal ────────────────────────────── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-900">
                {language === "th" ? "เปลี่ยนรหัสผ่าน" : "Change Password"}
              </h3>
              <button onClick={() => { setShowPasswordModal(false); setPasswordError(""); setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" }); }}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="px-7 py-6 space-y-4">
              {passwordSuccess && (
                <div className="flex items-center gap-2 bg-[#00A699] text-white px-4 py-3 rounded-xl text-sm font-semibold">
                  <Check className="w-4 h-4" />
                  {language === "th" ? "เปลี่ยนรหัสผ่านสำเร็จ!" : "Password changed!"}
                </div>
              )}
              {passwordError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold">
                  <X className="w-4 h-4 shrink-0" /> {passwordError}
                </div>
              )}

              {[
                { key: "oldPassword",     label: language === "th" ? "รหัสผ่านเดิม" : "Current Password",     show: showOld,    toggle: () => setShowOld(p => !p) },
                { key: "newPassword",     label: language === "th" ? "รหัสผ่านใหม่" : "New Password",         show: showNew,    toggle: () => setShowNew(p => !p) },
                { key: "confirmPassword", label: language === "th" ? "ยืนยันรหัสผ่านใหม่" : "Confirm Password", show: showConfirm, toggle: () => setShowConfirm(p => !p) },
              ].map(({ key, label, show, toggle }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">{label}</label>
                  <div className="relative">
                    <input
                      type={show ? "text" : "password"}
                      value={passwordForm[key as keyof typeof passwordForm]}
                      onChange={e => setPasswordForm(p => ({ ...p, [key]: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full px-4 py-3.5 pr-12 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:bg-white focus:border-[#00A699] transition-all font-medium tracking-widest"
                    />
                    <button type="button" onClick={toggle}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                {[
                  { label: language === "th" ? "อย่างน้อย 8 ตัวอักษร" : "At least 8 characters", met: passwordForm.newPassword.length >= 8 },
                  { label: language === "th" ? "รหัสผ่านตรงกัน" : "Passwords match", met: passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.confirmPassword !== "" },
                ].map(({ label, met }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${met ? "bg-[#00A699]" : "bg-gray-200"}`}>
                      {met && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className={`text-xs font-medium ${met ? "text-[#00A699]" : "text-gray-400"}`}>{label}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleChangePassword}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                {language === "th" ? "ยืนยันเปลี่ยนรหัสผ่าน" : "Confirm Change"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}