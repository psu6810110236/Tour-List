// src/components/ScrollToTop.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // เลื่อนหน้าจอกลับไปที่จุดซ้ายสุด (0) และบนสุด (0) ทันทีที่เปลี่ยนหน้า
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}