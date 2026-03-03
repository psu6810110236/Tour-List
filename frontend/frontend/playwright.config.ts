import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright/tests',
  /* รันเทสต์แบบคู่ขนาน (Parallel) เพื่อความรวดเร็ว */
  fullyParallel: true,
  /* ถ้ารันบน CI (เช่น GitHub Actions) ห้ามมีเทสต์ที่มี .only ทิ้งไว้ */
  forbidOnly: !!process.env.CI,
  /* บน CI ให้ลองรันซ้ำ 2 รอบถ้าพัง (กัน Flaky tests), ถ้ารันในเครื่องตัวเองไม่ต้องรันซ้ำ */
  retries: process.env.CI ? 2 : 0,
  /* จำนวน Worker ที่ใช้รันพร้อมกัน */
  workers: process.env.CI ? 1 : undefined,
  /* รูปแบบ Report ที่จะออกมาดูผลลัพธ์ */
  reporter: 'html',
  
  use: {
    /* Base URL ทำให้เราเขียน URL ในเทสต์สั้นๆ ได้แค่ '/' หรือ '/login' */
    baseURL: 'http://localhost:5173',
    /* เก็บ Trace (เหมือนบันทึกวิดีโอ+Log) ไว้ดูตอนเทสต์พัง */
    trace: 'on-first-retry',
    /* ถ่ายรูปหน้าจอเสมอถ้าเทสต์พัง */
    screenshot: 'only-on-failure',
  },

  /* เทสต์บนหลายๆ เบราว์เซอร์ */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // สามารถเปิด Firefox หรือ WebKit (Safari) ได้ถ้าต้องการ
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],

});