import { useState } from "react";
import { Mail, Lock, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { translations } from "../../data/translations";
import type { Language } from "../../data/translations";
import { api } from "../../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState<Language>("th");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const t = translations[language].auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      // เรียกใช้ api.post แทน fetch
      const response = await api.post("/auth/login", { email, password });
      
      // Axios จะเก็บข้อมูลไว้ใน response.data
      const data = response.data;
      
      // บันทึก Token ลง LocalStorage ด้วยเพื่อให้อนาคต api.ts ดึงไปใช้ได้ (สัมพันธ์กับข้อ 3)
      localStorage.setItem('access_token', data.access_token);
      
      login(data.access_token, data.user);
      navigate("/");
    } catch (err) {
      setError(language === "th" ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" : "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-main-gradient">
      {/*ปุ่มเปลี่ยนภาษาขวาวน*/}
      <div className="absolute top-6 right-6">
        <button onClick={() => setLanguage(prev => prev === 'th' ? 'en' : 'th')} className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/30 transition-all">
          <Globe className="w-4 h-4" />
          <span className="font-bold">{language.toUpperCase()}</span>
        </button>
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">RoamHub Tour</h1>
          <p className="text-white/80">{language === 'th' ? 'ค้นพบทัวร์ที่น่าตื่นเต้นในประเทศไทย' : 'Discover Amazing Thailand Tours'}</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">{t.loginTitle}</h2>
          <p className="text-gray-500 text-sm text-center mb-8">{language === 'th' ? 'เข้าสู่ระบบเพื่อดำเนินการต่อ' : 'Sign in to continue'}</p>

          {error && <div className="mb-6 p-3 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100 text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative">
                {/* 🟢 แก้ไขตรงนี้: ใช้กรอบ Flex ครอบไอคอนไว้ */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-gray-400 w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder={t.email} 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00A699] outline-none transition-all" 
                  required 
                />
              </div>
            </div>
            

            {/* 🔵 ช่อง Password */}
            <div>
              <div className="relative">
                {/* 🟢 แก้ไขตรงนี้: ใช้กรอบ Flex ครอบไอคอนไว้ */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-gray-400 w-5 h-5" />
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder={t.password} 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00A699] outline-none transition-all" 
                  required 
                />
              </div>
              <div className="text-right mt-2">
                <button type="button" className="text-xs text-[#00A699] font-semibold tracking-wide uppercase">
                 
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full mt-6 bg-[#FF6B4A] hover:bg-[#ff5232] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-[#FF6B4A]/30 hover:shadow-[#FF6B4A]/50 transition-all active:scale-95"
            >
              {language === 'th' ? 'เข้าสู่ระบบ' : 'Login'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-gray-400 text-sm">{t.noAccount}</p>
            <button onClick={() => navigate("/register")} className="w-full py-4 border-2 border-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all">
              {t.registerLink}
            </button>
          </div>
        </div>
        <p className="mt-8 text-center text-white/50 text-[10px] uppercase tracking-widest">This is a high-fidelity UI prototype for academic purposes</p>
      </div>
    </div>
  );
}