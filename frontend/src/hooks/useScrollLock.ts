// src/hooks/useScrollLock.ts
import { useEffect } from 'react';

export function useScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // ล็อคหน้าจอ
    } else {
      document.body.style.overflow = 'auto';   // ปลดล็อคหน้าจอ
    }

    // เผื่อ Component ถูกทำลายให้คืนค่าเดิมเสมอ
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
}