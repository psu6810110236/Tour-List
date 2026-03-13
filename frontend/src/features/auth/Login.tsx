import { useState, useEffect } from "react";
import { Mail, Lock, Globe } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { translations } from "../../data/translations";
import type { Language } from "../../data/translations";
import { api } from "../../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState<Language>("th");
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();

  const { login } = useAuth();
  const navigate = useNavigate();
  const t = translations[language].auth;

  // ดักจับ Token ตอน Google Redirect กลับมา
  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        
        // เซ็ตค่าลง LocalStorage ให้ครบ เพื่อป้องกันระบบเช็คสิทธิ์อ่านค่าไม่เจอ
        localStorage.setItem('access_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // อัปเดต Context
        login(token, user);

        // บังคับเปลี่ยนหน้าไปที่หน้า Home และล้าง History ของ URL ที่มี Token ยาวๆ ทิ้ง
        window.location.replace("/");
        
      } catch (err) {
        console.error("Failed to parse user info from URL", err);
      }
    }
  }, [searchParams, login]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("/auth/login", { email, password });
      const data = response.data;
      
      localStorage.setItem('access_token', data.access_token);
      login(data.access_token, data.user);
      navigate("/");
    } catch (err) {
      setError(language === "th" ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" : "Invalid email or password");
    }
  };

  const handleGoogleLogin = () => {
    // ให้ Redirect ไปยัง Backend Endpoint เพื่อคุยกับ Google
    window.location.href = "http://localhost:3000/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-main-gradient">
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
          
            <div>
              <div className="relative">
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
            </div>
            
            <button 
              type="submit" 
              className="w-full mt-6 bg-[#FF6B4A] hover:bg-[#ff5232] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-[#FF6B4A]/30 hover:shadow-[#FF6B4A]/50 transition-all active:scale-95"
            >
              {language === 'th' ? 'เข้าสู่ระบบ' : 'Login'}
            </button>
          </form>

          {/* ส่วนตัวแบ่งและปุ่ม Google Login */}
          <div className="my-6 flex items-center justify-center">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="px-4 text-sm text-gray-400">{language === 'th' ? 'หรือ' : 'OR'}</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-4 border-2 border-gray-100 bg-white text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {language === 'th' ? 'เข้าสู่ระบบด้วย Google' : 'Continue with Google'}
          </button>

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