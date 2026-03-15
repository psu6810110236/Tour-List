// src/pages/UserProfilePage.tsx
import { useState, useRef, useEffect } from "react";
import {
  User, Mail, Phone, Lock, Calendar, Settings, CreditCard,
  Bell, ChevronRight, Check, X, Eye, EyeOff,
  Camera, LogOut, MapPin, Clock, Users, BadgeCheck, Hourglass,
  Shield, Trash2, BellRing, MessageCircle,
} from "lucide-react";
import { useAuth } from "../features/auth/context/AuthContext";
import { bookingService, userService } from "../services/api";

interface UserProfilePageProps {
  language: "th" | "en";
  onNavigate: (page: string, data?: any) => void;
}

const statusConfig: Record<string, { label_th: string; label_en: string; color: string; bg: string; icon: any }> = {
  PENDING:   { label_th: "รอตรวจสอบ", label_en: "Pending",   color: "text-amber-600", bg: "bg-amber-50 border-amber-200",  icon: Hourglass },
  APPROVED:  { label_th: "อนุมัติแล้ว", label_en: "Approved", color: "text-green-600", bg: "bg-green-50 border-green-200",  icon: BadgeCheck },
  REJECTED:  { label_th: "ไม่อนุมัติ",  label_en: "Rejected", color: "text-red-600",   bg: "bg-red-50 border-red-200",      icon: X },
  CANCELLED: { label_th: "ยกเลิกแล้ว", label_en: "Cancelled", color: "text-gray-500", bg: "bg-gray-50 border-gray-200",    icon: X },
};

export function UserProfilePage({ language, onNavigate }: UserProfilePageProps) {
  const { user, logout } = useAuth() as any;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage]       = useState<string | null>(localStorage.getItem("userProfileImage"));
  const [displayFullName, setDisplayFullName] = useState(user?.fullName || "Normal User");
  const [displayPhone, setDisplayPhone]       = useState((user as any)?.phone || "");
  const [bookings, setBookings]               = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotifModal, setShowNotifModal]       = useState(false);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess]   = useState(false);
  const [showOld, setShowOld]         = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError]     = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: displayFullName, email: user?.email || "", phone: displayPhone,
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "", newPassword: "", confirmPassword: "",
  });
  const [notifSettings, setNotifSettings] = useState({
    booking: true, promotion: true, system: false, email: true,
  });

  useEffect(() => {
    if (user) {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const name  = storedUser.fullName || user.fullName || "Normal User";
      const phone = storedUser.phone    || user.phone    || "";
      setDisplayFullName(name);
      setDisplayPhone(phone);
      setEditForm(prev => ({ ...prev, fullName: name, phone }));
    }
  }, [user]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoadingBookings(true);
        const res = await bookingService.getMyBookings();
        setBookings(res.data || []);
      } catch { setBookings([]); }
      finally { setLoadingBookings(false); }
    };
    if (user?.id) fetchBookings();
  }, [user?.id]);

  const totalBookings = bookings.length;
  const pendingCount  = bookings.filter(b => b.status?.toUpperCase() === "PENDING").length;
  const approvedCount = bookings.filter(b => b.status?.toUpperCase() === "APPROVED").length;
  const totalSpent    = bookings
    .filter(b => b.status?.toUpperCase() === "APPROVED")
    .reduce((s, b) => s + Number(b.totalPrice || 0), 0);
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);
  const memberYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();

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
        storedUser.phone    = editForm.phone;
        localStorage.setItem('user', JSON.stringify(storedUser));
        window.dispatchEvent(new Event("userInfoUpdated"));
      } catch {}
      setProfileSuccess(true);
      setTimeout(() => { setProfileSuccess(false); setShowSettingsModal(false); }, 1000);
    };
    try {
      if (userService?.updateProfile)
        await userService.updateProfile({ fullName: editForm.fullName, phone: editForm.phone });
      updateUI();
    } catch { updateUI(); }
    finally { setIsSavingProfile(false); }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError(language === "th" ? "กรุณากรอกข้อมูลให้ครบ" : "Please fill in all fields"); return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(language === "th" ? "รหัสผ่านใหม่ไม่ตรงกัน" : "Passwords do not match"); return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError(language === "th" ? "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" : "Min 8 characters"); return;
    }
    try {
      // @ts-ignore
      await userService.changePassword({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword });
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
      return new Date(d).toLocaleDateString(
        language === "th" ? "th-TH" : "en-US",
        { day: "numeric", month: "short", year: "numeric" }
      );
    } catch { return d; }
  };

  const quickMenuItems = [
    { icon: Calendar,   label_th: "ดูประวัติการจองทั้งหมด", label_en: "View All Bookings", action: () => onNavigate("bookings"),        color: "text-[#00A699]",  bg: "bg-teal-50"   },
    { icon: Settings,   label_th: "ตั้งค่าบัญชี",            label_en: "Account Settings",  action: () => setShowSettingsModal(true),    color: "text-blue-600",   bg: "bg-blue-50"   },
    { icon: CreditCard, label_th: "วิธีการชำระเงิน",          label_en: "Payment Methods",   action: () => onNavigate("payment-methods"), color: "text-purple-600", bg: "bg-purple-50" },
    { icon: Bell,       label_th: "การแจ้งเตือน",             label_en: "Notifications",     action: () => setShowNotifModal(true),       color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">

      {/* Hero */}
      <div
        className="relative overflow-hidden pb-24 pt-10"
        style={{ background: "linear-gradient(135deg, #00A699 0%, #00BCD4 40%, #2196F3 100%)" }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white/30 shadow-xl overflow-hidden bg-white/20 backdrop-blur-md flex items-center justify-center">
                  {profileImage
                    ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center bg-white/20"><User className="w-10 h-10 text-white" strokeWidth={1.5} /></div>
                  }
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors border border-gray-100 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#00A699]" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">{displayFullName}</h1>
                <p className="text-white/80 text-sm mt-1 flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user?.email || "user@example.com"}</p>
                <p className="text-white/70 text-xs mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {language === "th" ? `เป็นสมาชิกตั้งแต่ ${memberYear}` : `Member since ${memberYear}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => { if (logout) logout(); onNavigate("home"); }}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm backdrop-blur-md self-start sm:self-center"
            >
              <LogOut className="w-4 h-4" />
              {language === "th" ? "ออกจากระบบ" : "Sign Out"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 -mt-14 relative z-20 mb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label_th: "การจองทั้งหมด",  label_en: "Total Bookings", value: totalBookings,                     icon: <Calendar className="w-5 h-5 text-gray-400" />,                valueColor: "text-gray-900"  },
            { label_th: "รอตรวจสอบ",      label_en: "Pending",        value: pendingCount,                     icon: <span className="text-xl leading-none">⏳</span>,               valueColor: "text-amber-500" },
            { label_th: "อนุมัติแล้ว",    label_en: "Approved",       value: approvedCount,                    icon: <Check className="w-5 h-5 text-green-500" strokeWidth={2.5} />,  valueColor: "text-green-500" },
            { label_th: "ยอดใช้จ่ายรวม",  label_en: "Total Spent",    value: `฿${totalSpent.toLocaleString()}`, icon: <CreditCard className="w-5 h-5 text-teal-500" />,              valueColor: "text-gray-900"  },
          ].map(({ label_th, label_en, value, icon, valueColor }) => (
            <div key={label_th} className="bg-white rounded-2xl px-5 py-5 shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 font-medium">{language === "th" ? label_th : label_en}</span>
                <div className="w-8 h-8 flex items-center justify-center">{icon}</div>
              </div>
              <div className={`text-3xl font-black tracking-tight ${valueColor}`}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left */}
          <div className="lg:col-span-2 space-y-8">

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-extrabold text-gray-900">{language === "th" ? "การจองล่าสุด" : "Recent Bookings"}</h2>
                <button onClick={() => onNavigate("bookings")} className="text-[#00A699] text-sm font-bold hover:underline">
                  {language === "th" ? "ดูทั้งหมด" : "View all"} →
                </button>
              </div>
              {loadingBookings ? (
                <div className="py-14 text-center"><div className="w-8 h-8 border-2 border-[#00A699] border-t-transparent rounded-full animate-spin mx-auto" /></div>
              ) : recentBookings.length === 0 ? (
                <div className="py-14 text-center">
                  <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm mb-3">{language === "th" ? "ยังไม่มีประวัติการจอง" : "No bookings yet"}</p>
                  <button onClick={() => onNavigate("home")} className="text-[#00A699] font-bold text-sm hover:underline">
                    {language === "th" ? "ค้นหาทัวร์" : "Explore Tours"}
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentBookings.map((booking) => {
                    const status = statusConfig[booking.status?.toUpperCase()] || statusConfig.PENDING;
                    const StatusIcon = status.icon;
                    return (
                      <div key={booking.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">
                              {booking.tourNameSnapshot_th && language === "th" ? booking.tourNameSnapshot_th : booking.tourNameSnapshot || `Tour #${booking.tourId}`}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> ID: {booking.id?.toString().slice(-6) || "-"}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(booking.travelDate || booking.date)}</span>
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {booking.travelers || booking.pax} {language === "th" ? "ท่าน" : "pax"}</span>
                            </div>
                            <p className="text-[#00A699] font-black text-sm mt-1.5">฿{Number(booking.totalPrice || 0).toLocaleString()}</p>
                          </div>
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border ${status.bg} ${status.color} shrink-0`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {language === "th" ? status.label_th : status.label_en}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Personal Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-extrabold text-gray-900">{language === "th" ? "ข้อมูลส่วนตัว" : "Personal Information"}</h2>
                <button onClick={() => setShowSettingsModal(true)} className="text-sm font-bold text-[#00A699] bg-teal-50 px-4 py-1.5 rounded-xl hover:bg-teal-100 transition-colors flex items-center gap-1.5">
                  ✏️ {language === "th" ? "แก้ไข" : "Edit"}
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                {[
                  { key: "fullName", label_th: "ชื่อ-นามสกุล", label_en: "Full Name",    icon: User,  value: displayFullName },
                  { key: "email",    label_th: "อีเมล",         label_en: "Email",        icon: Mail,  value: user?.email     },
                  { key: "phone",    label_th: "เบอร์โทรศัพท์", label_en: "Phone Number", icon: Phone, value: displayPhone    },
                ].map(({ key, label_th, label_en, icon: Icon, value }) => (
                  <div key={key}>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
                      {language === "th" ? label_th : label_en}
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-9 h-9 bg-white rounded-lg border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                        <Icon className="w-4 h-4 text-[#00A699]" />
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">
                        {value || (key === "phone" ? (language === "th" ? "ยังไม่ได้ระบุ" : "Not specified") : "-")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">

            {/* Quick Menu */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-extrabold text-gray-900">{language === "th" ? "เมนูด่วน" : "Quick Menu"}</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {quickMenuItems.map(({ icon: Icon, label_th, label_en, action, color, bg }) => (
                  <button key={label_th} onClick={action} className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors group text-left">
                    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <span className="font-semibold text-gray-700 text-sm flex-1">{language === "th" ? label_th : label_en}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* ✅ Help card — เพิ่ม relative z-10 เพื่อให้ปุ่มกดได้ */}
            <div
              className="rounded-2xl p-6 text-white relative z-10"
              style={{ background: "linear-gradient(135deg, #00A699 0%, #2196F3 100%)" }}
            >
              <h3 className="font-extrabold text-base mb-1">{language === "th" ? "ต้องการความช่วยเหลือ?" : "Need Help?"}</h3>
              <p className="text-white/85 text-xs mb-4 leading-relaxed">
                {language === "th" ? "ทีมสนับสนุนพร้อมให้บริการตลอด 24 ชั่วโมง" : "Our support team is available 24/7"}
              </p>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("openChatWidget"))}
                className="bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors w-full flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                {language === "th" ? "ติดต่อเรา" : "Contact Us"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: การแจ้งเตือน */}
      {showNotifModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="text-lg font-extrabold text-gray-900">{language === "th" ? "การแจ้งเตือน" : "Notifications"}</h3>
              </div>
              <button onClick={() => setShowNotifModal(false)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-3">
              {[
                { key: "booking",   label_th: "การแจ้งเตือนการจอง",     label_en: "Booking updates",     desc_th: "อัปเดตสถานะการจองและการชำระเงิน", desc_en: "Booking status & payment updates", icon: Calendar, color: "text-[#00A699]",  bg: "bg-teal-50"   },
                { key: "promotion", label_th: "โปรโมชั่นและข้อเสนอ",    label_en: "Promotions & offers", desc_th: "ส่วนลดและดีลพิเศษสำหรับคุณ",      desc_en: "Discounts and special deals",      icon: BellRing, color: "text-purple-600", bg: "bg-purple-50" },
                { key: "system",    label_th: "การแจ้งเตือนระบบ",        label_en: "System notifications",desc_th: "ข่าวสารและการอัปเดตจากระบบ",       desc_en: "System news and updates",          icon: Settings, color: "text-blue-600",   bg: "bg-blue-50"   },
                { key: "email",     label_th: "รับการแจ้งเตือนทางอีเมล", label_en: "Email notifications", desc_th: "ส่งสรุปไปยังอีเมลของคุณ",           desc_en: "Send summaries to your email",      icon: Mail,     color: "text-gray-600",   bg: "bg-gray-100"  },
              ].map(({ key, label_th, label_en, desc_th, desc_en, icon: Icon, color, bg }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{language === "th" ? label_th : label_en}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{language === "th" ? desc_th : desc_en}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                    className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ml-3 ${notifSettings[key as keyof typeof notifSettings] ? 'bg-[#00A699]' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifSettings[key as keyof typeof notifSettings] ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => setShowNotifModal(false)}
                className="w-full bg-[#00A699] hover:bg-[#008c81] text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {language === "th" ? "บันทึกการตั้งค่า" : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
            <div className="shrink-0 flex items-center justify-between px-7 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-teal-50 rounded-full flex items-center justify-center">
                  <Settings className="w-4 h-4 text-[#00A699]" />
                </div>
                <h3 className="text-lg font-extrabold text-gray-900">{language === "th" ? "ตั้งค่าบัญชี" : "Account Settings"}</h3>
              </div>
              <button
                onClick={() => { setShowSettingsModal(false); setEditForm({ fullName: displayFullName, email: user?.email || "", phone: displayPhone }); }}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 px-7 py-6 space-y-6 bg-gray-50/50">
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />{language === "th" ? "ข้อมูลส่วนตัว" : "Personal Information"}
                </h4>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  {[
                    { key: "fullName", label_th: "ชื่อ-นามสกุล",               label_en: "Full Name",         type: "text",  readOnly: false },
                    { key: "email",    label_th: "อีเมล (ไม่สามารถแก้ไขได้)",  label_en: "Email (Read-only)", type: "email", readOnly: true  },
                    { key: "phone",    label_th: "เบอร์โทรศัพท์",               label_en: "Phone Number",      type: "tel",   readOnly: false },
                  ].map(({ key, label_th, label_en, type, readOnly }) => (
                    <div key={key}>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">{language === "th" ? label_th : label_en}</label>
                      <input
                        type={type}
                        value={editForm[key as keyof typeof editForm]}
                        readOnly={readOnly}
                        onChange={readOnly ? undefined : e => setEditForm(p => ({ ...p, [key]: e.target.value }))}
                        className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all font-semibold text-sm ${
                          readOnly
                            ? "bg-gray-100 border-gray-100 text-gray-500 cursor-not-allowed"
                            : "bg-gray-50 border-gray-100 focus:bg-white focus:border-[#00A699] text-gray-900"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />{language === "th" ? "ความปลอดภัย" : "Security"}
                </h4>
                <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                  <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-gray-200 transition-all">
                        <Lock className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 text-sm">{language === "th" ? "เปลี่ยนรหัสผ่าน" : "Change Password"}</p>
                        <p className="text-xs text-gray-500">{language === "th" ? "อัปเดตรหัสผ่านเพื่อความปลอดภัย" : "Update your password"}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-red-600 mb-3 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-500" />{language === "th" ? "พื้นที่อันตราย" : "Danger Zone"}
                </h4>
                <div className="bg-red-50 p-5 rounded-2xl border border-red-100 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-red-900 text-sm">{language === "th" ? "ลบบัญชีผู้ใช้" : "Delete Account"}</p>
                    <p className="text-xs text-red-600/80 mt-1">{language === "th" ? "การกระทำนี้ไม่สามารถย้อนกลับได้" : "This action cannot be undone."}</p>
                  </div>
                  <button className="bg-white text-red-600 border border-red-200 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors shadow-sm shrink-0">
                    {language === "th" ? "ลบบัญชี" : "Delete"}
                  </button>
                </div>
              </div>
            </div>

            <div className="shrink-0 p-5 border-t border-gray-100 bg-white">
              {profileSuccess && (
                <div className="mb-3 flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2.5 rounded-xl text-sm font-semibold border border-green-200">
                  <Check className="w-4 h-4" /> {language === "th" ? "บันทึกข้อมูลสำเร็จ!" : "Saved successfully!"}
                </div>
              )}
              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="w-full bg-[#00A699] hover:bg-[#008c81] text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSavingProfile
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Check className="w-5 h-5" />}
                {language === "th" ? "บันทึกการเปลี่ยนแปลง" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-gray-900">{language === "th" ? "เปลี่ยนรหัสผ่าน" : "Change Password"}</h3>
              <button
                onClick={() => { setShowPasswordModal(false); setPasswordError(""); setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" }); }}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="px-7 py-6 space-y-4">
              {passwordSuccess && (
                <div className="flex items-center gap-2 bg-[#00A699] text-white px-4 py-3 rounded-xl text-sm font-semibold">
                  <Check className="w-4 h-4" />{language === "th" ? "เปลี่ยนรหัสผ่านสำเร็จ!" : "Password changed!"}
                </div>
              )}
              {passwordError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold">
                  <X className="w-4 h-4 shrink-0" /> {passwordError}
                </div>
              )}
              {[
                { key: "oldPassword",     label: language === "th" ? "รหัสผ่านเดิม"       : "Current Password", show: showOld,     toggle: () => setShowOld(p => !p)     },
                { key: "newPassword",     label: language === "th" ? "รหัสผ่านใหม่"       : "New Password",     show: showNew,     toggle: () => setShowNew(p => !p)     },
                { key: "confirmPassword", label: language === "th" ? "ยืนยันรหัสผ่านใหม่" : "Confirm Password", show: showConfirm, toggle: () => setShowConfirm(p => !p) },
              ].map(({ key, label, show, toggle }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">{label}</label>
                  <div className="relative">
                    <input
                      type={show ? "text" : "password"}
                      value={passwordForm[key as keyof typeof passwordForm]}
                      onChange={e => setPasswordForm(p => ({ ...p, [key]: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-12 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:bg-white focus:border-[#00A699] transition-all font-medium tracking-widest text-sm"
                    />
                    <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm">
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                {[
                  { label: language === "th" ? "อย่างน้อย 8 ตัวอักษร" : "At least 8 characters", met: passwordForm.newPassword.length >= 8 },
                  { label: language === "th" ? "รหัสผ่านตรงกัน"       : "Passwords match",        met: passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.confirmPassword !== "" },
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