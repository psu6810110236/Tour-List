// frontend/src/pages/Register.tsx
import { useState } from "react";
import { Mail, Lock, User, ArrowLeft, Globe } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { translations, type Language } from "../data/translations";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [language, setLanguage] = useState<Language>("th");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const t = translations[language].auth;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError(language === "th" ? "รหัสผ่านไม่ตรงกัน" : "Passwords do not match");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // ส่ง fullName, email, password ตามที่ Backend ต้องการ (เช็ค DTO หรือ Entity ว่าใช้ชื่อฟิลด์อะไร)
                body: JSON.stringify({ fullName: name, email, password }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Registration failed");
            }

            // สมัครเสร็จแล้วไปหน้า Login
            alert(language === "th" ? "สมัครสมาชิกสำเร็จ!" : "Registration Successful!");
            navigate("/login");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#007AFF] to-[#00A699] flex items-center justify-center p-4 relative">
            {/* Language Toggle */}
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
                {/* Back Button */}
                <Link to="/login" className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition">
                    <ArrowLeft className="w-5 h-5" />
                    <span>{language === "th" ? "กลับไปหน้าเข้าสู่ระบบ" : "Back to Login"}</span>
                </Link>

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Join RoamHub</h1>
                    <p className="text-white/90">
                        {language === "th" ? "เริ่มต้นการผจญภัยของคุณวันนี้" : "Start your Thailand adventure today"}
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t.registerTitle}</h2>
                        <p className="text-gray-600">
                            {language === "th" ? "กรอกข้อมูลเพื่อเริ่มต้นใช้งาน" : "Fill in your details to get started"}
                        </p>
                    </div>

                    {error && <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100 text-center">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.fullName}</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00A699] focus:border-transparent transition"
                                    required
                                />
                            </div>
                        </div>

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

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {language === "th" ? "ยืนยันรหัสผ่าน" : "Confirm Password"}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00A699] focus:border-transparent transition"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#FF6B4A] hover:bg-[#ff5232] text-white py-4 rounded-2xl font-semibold transition transform hover:scale-[1.02] shadow-lg"
                        >
                            {t.registerBtn}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}