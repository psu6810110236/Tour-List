import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright/tests',
  fullyParallel: false,   // รันทีละอัน เพื่อไม่ให้ DB conflict กัน
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: 'https://wd04.pupasoft.com:5173',
    locale: 'th-TH',        
  timezoneId: 'Asia/Bangkok', 
    trace: 'retain-on-failure',
    screenshot: 'on',          // ถ่ายทุก step เลย
    video: 'retain-on-failure',
    headless: true,
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});