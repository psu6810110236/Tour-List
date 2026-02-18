import { useState } from "react";
import { Mail, Lock, User, ArrowLeft, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { translations } from "../data/translations";
import type { Language } from "../data/translations";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [language, setLanguage] = useState<Language>("th");
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const navigate = useNavigate();
  const t = translations[language].auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError(language === "th" ? "รหัสผ่านไม่ตรงกัน" : "Passwords do not match");
      return;
    }
    if (!acceptedTerms) {
      setError(language === "th" ? "กรุณายอมรับเงื่อนไข" : "Please accept terms");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name, email, password }),
      });
      if (!response.ok) throw new Error("Registration failed");
      navigate("/login");
    } catch (err) {
      setError(language === "th" ? "ไม่สามารถสมัครสมาชิกได้" : "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-main-gradient">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button onClick={() => navigate("/login")} className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-all font-medium">
          <ArrowLeft size={18} /> {language === 'th' ? 'กลับไปหน้าเข้าสู่ระบบ' : 'Back to Login'}
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{t.registerTitle}</h2>
            <p className="text-gray-500 text-sm mt-1">{language === 'th' ? 'กรอกข้อมูลเพื่อเริ่มต้นใช้งาน' : 'Fill in your details'}</p>
          </div>

          {error && <div className="mb-6 p-3 bg-red-50 text-red-500 text-xs rounded-xl text-center border border-red-100">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.fullName} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00A699] outline-none transition-all" required />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.email} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00A699] outline-none transition-all" required />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.password} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00A699] outline-none transition-all" required />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={language === 'th' ? 'ยืนยันรหัสผ่าน' : 'Confirm Password'} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00A699] outline-none transition-all" required />
            </div>

            <div className="flex items-start gap-3 px-1">
              <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1 w-4 h-4 rounded border-gray-300 text-[#00A699] focus:ring-[#00A699]" id="terms" />
              <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed">
                {language === 'th' ? 'ฉันยอมรับเงื่อนไขการให้บริการและนโยบายความเป็นส่วนตัว' : 'I agree to the Terms of Service and Privacy Policy'}
              </label>
            </div>

            <button type="submit" className="w-full bg-[#FF6B4A] hover:bg-[#ff5232] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-100 transition-all transform hover:scale-[1.02]">
              {t.registerBtn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}