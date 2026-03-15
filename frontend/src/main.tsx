import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const FALLBACK_IMAGE_URL = 'https://raw.githubusercontent.com/psu6810110318/-/main/611177844_1219279366819683_4920076292858051338_n-removebg-preview.png';

window.addEventListener(
  'error',
  (e) => {
    const target = e.target as HTMLImageElement;
    
    if (target && target.tagName === 'IMG') {
      if (target.src !== FALLBACK_IMAGE_URL) {
        target.src = FALLBACK_IMAGE_URL;
        
        // --- แก้ไขสไตล์ใหม่ให้เนียนเข้ากับ Layout เดิม ---
        target.style.width = '100%';              // ให้กว้างเต็มกรอบเดิมของรูป
        target.style.height = '100%';             // ให้สูงเต็มกรอบเดิม
        target.style.objectFit = 'contain';       // ให้โลโก้คงสัดส่วนเดิม ไม่โดนตัด
        target.style.backgroundColor = '#00A699'; // (ทางเลือก) ใส่สีพื้นหลังเทาอ่อนให้ดูเป็น Placeholder 
        target.style.padding = '1.5rem';          // ดันขอบเข้ามา ทำให้โลโก้ดูเล็กลงแต่อยู่กึ่งกลางพอดี
      }
    }
  },
  true 
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);