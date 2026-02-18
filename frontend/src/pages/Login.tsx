// frontend/src/pages/Login.tsx
import { useState } from "react";
import { Mail, Lock, Globe } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// ตรวจสอบ path นี้ว่าตรงกับไฟล์ของคุณ (ถ้าใช้ alias @ ไม่ได้ ให้ใช้ ../data/translations)
import { translations } from "../data/translations";
import type { Language } from "../data/translations";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [language, setLanguage] = useState<Language>("th"); // Default ภาษาไทย
    const [error, setError] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();
    const t = translations[language].auth;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }), // Backend คุณใช้ email หรือ username เช็คดีๆ นะครับ (ในโค้ดเก่าคุณใช้ email)
            });

            if (!response.ok) throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");

            const data = await response.json();
            login(data.access_token, data.user);
            navigate("/"); // เข้าสู่ระบบสำเร็จ ไปหน้าแรก
        } catch (err) {
            setError("Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="min-h-scresn bg-gradient-to-br from-[#00A699] to-[#007AFF] flex items-center justify-center p-4 relative">
            {/* Language Toggle Button */}
            <div className="absolute top-6 right-6 z-50">
                <button
                    onClick={() => setLanguage(language === "th" ? "en" : "th")}
                    className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-full shadow-lg transition-all flex items-center gap-2 font-semibold hover:bg-white/30 hover:scale-105"
                >
                    <Globe className="w-4 h-4" />
                    <span>{language === "th" ? "EN" : "TH"}</span>
                </button>
            </div>

            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">RoamHub Tour</h1>
                    <p className="text-white/90">
                        {language === "th" ? "ค้นพบทัวร์ที่น่าตื่นเต้นในประเทศไทย" : "Discover Amazing Thailand Tours"}
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t.loginTitle}</h2>
                        <p className="text-gray-600">
                            {language === "th" ? "เข้าสู่ระบบเพื่อดำเนินการต่อ" : "Sign in to your account to continue"}
                        </p>
                    </div>

                    {error && <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100 text-center">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00A699] focus:border-transparent transition"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.password}</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00A699] focus:border-transparent transition"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="button" className="text-sm text-[#00A699] hover:text-[#008c81] font-medium transition">
                                {language === "th" ? "ลืมรหัสผ่าน?" : "Forgot Password?"}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#FF6B4A] hover:bg-[#ff5232] text-white py-4 rounded-2xl font-semibold transition transform hover:scale-[1.02] shadow-lg"
                        >
                            {t.loginBtn}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">{t.noAccount}</span>
                        </div>
                    </div>

                    {/* Register Link */}
                    <Link to="/register">
                        <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-4 rounded-2xl font-semibold transition border border-gray-200">
                            {t.registerLink}
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}