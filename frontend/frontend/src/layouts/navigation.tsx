// src/components/navigation.tsx

import { useState } from "react";
import {
    Home,
    Map,
    Calendar,
    User,
    Menu,
    HelpCircle,
    Globe,
    X,
    ShoppingBag,
    ChevronDown,
    LayoutDashboard, // ไอคอนสำหรับ Admin
    LogOut, // ไอคอนสำหรับ Logout
} from "lucide-react";

import { useAuth } from "../features/auth/context/AuthContext";
import { useNavigate } from "react-router-dom";
import type { Language } from "../data/translations";
import { translations } from "../data/translations";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

import {
    Avatar,
    AvatarFallback,
} from "../components/ui/avatar";

import { Badge } from "../components/ui/badge";

interface NavigationProps {
    currentPage: string;
    onNavigate: (page: string) => void;
    userName: string;
    onShowTutorial: () => void;
    language: Language;
    onToggleLanguage: () => void;
    cartCount?: number;
    onOpenCart?: () => void;
}

export function Navigation({
    currentPage,
    onNavigate,
    userName,
    onShowTutorial,
    language,
    onToggleLanguage,
    cartCount = 0,
    onOpenCart,
}: NavigationProps) {
    const [logoError, setLogoError] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // ดึงฟังก์ชัน logout และข้อมูล user จาก AuthContext
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const t = translations[language].nav;
    const tCart = translations[language].cart;

    // ฟังก์ชันจัดการการ Logout
    const handleLogout = () => {
        logout(); // ล้างข้อมูล Token และ User ใน localStorage
        navigate("/login"); // ส่งผู้ใช้กลับไปหน้า Login
    };

    const LOGO_ICON = "https://github.com/psu6810110318/-/blob/main/611177844_1219279366819683_4920076292858051338_n-removebg-preview.png?raw=true";
    const LOGO_TEXT = "https://github.com/psu6810110318/-/blob/main/image-removebg-preview.png?raw=true";

    const navItems = [
        { id: "home", label: t.home, icon: <Home className="w-5 h-5" /> },
        { id: "provinces", label: t.provinces, icon: <Map className="w-5 h-5" /> },
        { id: "bookings", label: t.bookings, icon: <Calendar className="w-5 h-5" /> },
    ];

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-20 sm:h-24">
                    
                    {/* LOGO */}
                    <button onClick={() => onNavigate("home")} className="flex items-center gap-3 sm:gap-5 group hover:opacity-95 transition-all">
                        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white border border-gray-100 shadow-md flex items-center justify-center p-1 group-hover:shadow-lg group-hover:border-[#00A699]/30 transition-all duration-300">
                            {!logoError ? (
                                <img src={LOGO_ICON} alt="Logo" className="w-full h-full object-contain" onError={() => setLogoError(true)} />
                            ) : (
                                <span className="text-[10px] font-bold text-gray-400">ROAM</span>
                            )}
                        </div>
                        <img src={LOGO_TEXT} alt="RoamHub Tour" className="hidden lg:block h-[175px] w-auto object-contain drop-shadow-sm" />
                    </button>

                    {/* DESKTOP NAV */}
                    <div className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                                    currentPage === item.id || (item.id === "provinces" && currentPage.startsWith("province"))
                                    ? "bg-white text-[#00A699] shadow-md ring-1 ring-black/5"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-white/60"
                                }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* CART */}
                        <button onClick={onOpenCart} title={tCart.title} className="relative p-3 text-gray-600 hover:text-[#00A699] hover:bg-[#00A699]/5 rounded-2xl transition-all border border-transparent hover:border-[#00A699]/20">
                            <ShoppingBag className="w-6 h-6" />
                            {cartCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 px-1.5 min-w-[1.25rem] h-5 bg-[#FF6B4A] border-2 border-white flex items-center justify-center text-[10px]">
                                    {cartCount}
                                </Badge>
                            )}
                        </button>

                        {/* LANGUAGE */}
                        <button onClick={onToggleLanguage} className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all">
                            <Globe className="w-5 h-5 text-[#00A699]" />
                            <span className="font-bold text-sm text-gray-700">{language.toUpperCase()}</span>
                        </button>

                        {/* USER DROPDOWN */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 pl-2 pr-2 sm:pr-4 py-2 hover:bg-gray-50 rounded-full transition-all group">
                                    <Avatar className="w-11 h-11 border-2 border-white shadow-md group-hover:scale-105 transition-transform">
                                        <AvatarFallback className="bg-gradient-to-br from-[#FF7B4A] to-[#FF9A6A] text-white">
                                            <User className="w-6 h-6" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-left hidden sm:block">
                                        <p className="text-sm font-bold text-gray-900 leading-tight">{userName}</p>
                                        <p className="text-[10px] text-gray-500 font-medium uppercase">{t.viewProfile}</p>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-gray-100">
                                <DropdownMenuLabel className="font-bold text-gray-400 text-[10px] px-3 py-2 uppercase">Account Management</DropdownMenuLabel>
                                
                                {/* แสดง Admin Panel เฉพาะ User ที่มีสิทธิ์ ADMIN */}
                                {user?.role === 'ADMIN' && (
                                    <DropdownMenuItem
                                        onClick={() => onNavigate("admin/dashboard")}
                                        className="rounded-xl p-3 cursor-pointer font-bold text-blue-600 hover:bg-blue-50"
                                    >
                                        <LayoutDashboard className="w-4 h-4 mr-3" /> Admin Panel
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuItem onClick={() => onNavigate("dashboard")} className="rounded-xl p-3 cursor-pointer font-bold">
                                    <User className="w-4 h-4 mr-3" /> Profile
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem onClick={onShowTutorial} className="rounded-xl p-3 cursor-pointer font-bold">
                                    <HelpCircle className="w-4 h-4 mr-3" /> Tutorial
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator className="my-2" />
                                
                                <DropdownMenuItem onClick={handleLogout} className="rounded-xl p-3 cursor-pointer text-red-500 font-bold hover:bg-red-50">
                                    <LogOut className="w-4 h-4 mr-3" /> Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* MOBILE MENU BTN */}
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-3 text-gray-600">
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-2xl py-4 px-4 flex flex-col gap-2 z-50">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { onNavigate(item.id); setIsMobileMenuOpen(false); }}
                            className={`flex items-center gap-4 p-4 rounded-2xl font-bold ${currentPage === item.id ? "bg-[#00A699]/10 text-[#00A699]" : "text-gray-600"}`}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}
                    
                    {/* Mobile Admin Link */}
                    {user?.role === 'ADMIN' && (
                        <button
                            onClick={() => { onNavigate("admin/dashboard"); setIsMobileMenuOpen(false); }}
                            className="flex items-center gap-4 p-4 rounded-2xl font-bold text-blue-600 hover:bg-blue-50"
                        >
                            <LayoutDashboard className="w-5 h-5" /> Admin Panel
                        </button>
                    )}

                    <button onClick={() => { onToggleLanguage(); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 rounded-2xl font-bold text-gray-600 hover:bg-gray-50">
                        <Globe className="w-5 h-5 text-[#00A699]" />
                        {language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
                    </button>

                    {/* Mobile Logout */}
                    <button onClick={handleLogout} className="flex items-center gap-4 p-4 rounded-2xl font-bold text-red-500 hover:bg-red-50">
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>
            )}
        </nav>
    );
}