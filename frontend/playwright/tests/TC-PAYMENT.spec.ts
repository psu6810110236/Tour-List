// playwright/tests/TC-PAYMENT.spec.ts
// ─────────────────────────────────────────────────────────────────
// Module: Payment
// ─────────────────────────────────────────────────────────────────
import { test, expect } from '@playwright/test';
import { skipTutorial } from '../helpers/auth';

// ── helper: ฉีด mock user เข้า localStorage + sessionStorage ──────
//    ใช้แทน loginAs() เพื่อไม่พึ่ง backend credential จริง
async function injectAuthAndBooking(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    // mock token + user (เลียนแบบ payload ที่ AuthContext อ่าน)
    localStorage.setItem('token', 'mock_jwt_token_user');
    localStorage.setItem('user', JSON.stringify({
      id: 99,
      email: 'testuser@mock.com',
      name: 'Test User',
      role: 'user',
    }));
    localStorage.setItem('roamhub_tutorial_seen_99', 'true');
    localStorage.setItem('roamhub_tutorial_seen_guest', 'true');

    // booking data ที่ PaymentPage อ่านจาก sessionStorage
    sessionStorage.setItem('bookingData', JSON.stringify({
      tourId: 1,
      tourName: 'ดำน้ำเกาะพีพี 1 วัน',
      tourName_th: 'ดำน้ำเกาะพีพี 1 วัน',
      date: '2026-06-01',
      travelers: 2,
      totalPrice: 3000,
      tour: { id: 1, name: 'ดำน้ำเกาะพีพี 1 วัน', name_th: 'ดำน้ำเกาะพีพี 1 วัน' },
    }));
  });
}

// ── helper: สร้าง PNG buffer 1×1px จำลองสลิป ─────────────────────
function mockSlipBuffer() {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
}

test.beforeEach(async ({ page }) => {
  await skipTutorial(page);
});

test.describe('TC-PAYMENT | Payment', () => {

  // ── TC-PAYMENT-01 ──────────────────────────────────────────────
  test('TC-PAYMENT-01 | หน้า Payment แสดงข้อมูลสรุปคำสั่งและ QR Code', async ({ page }) => {
    await injectAuthAndBooking(page);
    await page.goto('/payment');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/TC-PAYMENT-01_payment-page.png', fullPage: true });

    // ตรวจหัวข้อ "ชำระเงิน" แสดง
    const heading = page.locator('h1, h2').filter({ hasText: /ชำระเงิน|payment|QR/i }).first();
    await expect(heading).toBeVisible({ timeout: 8000 });

    // ตรวจ QR Code image แสดง
    const qrImg = page.locator('img[alt*="QR"], img[alt*="Payment"]');
    await expect(qrImg).toBeVisible({ timeout: 5000 });

    // ตรวจสรุปยอดราคาถูกต้อง
    const priceText = page.locator('text=฿3,000').first();
    await expect(priceText).toBeVisible({ timeout: 5000 });
  });

  // ── TC-PAYMENT-02 ──────────────────────────────────────────────
  test('TC-PAYMENT-02 | กดชำระเงินโดยไม่อัปโหลดสลิป → แสดง Warning', async ({ page }) => {
    await injectAuthAndBooking(page);
    await page.goto('/payment');
    await page.waitForLoadState('networkidle');

    // กดปุ่มชำระเงินทันทีโดยยังไม่อัปโหลดสลิป
    const payBtn = page.locator('button').filter({ hasText: /ชำระเงิน|Pay Now/i }).last();
    await expect(payBtn).toBeVisible({ timeout: 8000 });
    await payBtn.click();

    await page.screenshot({ path: 'screenshots/TC-PAYMENT-02_no-slip-warning.png', fullPage: true });

    // ตรวจ modal warning ข้อมูลไม่ครบ / สลิป
    const modal = page.locator('div').filter({ hasText: /สลิป|slip|ข้อมูลไม่ครบ|Missing/i }).first();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  // ── TC-PAYMENT-03 ──────────────────────────────────────────────
  test('TC-PAYMENT-03 | อัปโหลดสลิป → ปุ่มเปลี่ยน state และ preview แสดง', async ({ page }) => {
    await injectAuthAndBooking(page);
    await page.goto('/payment');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="file"]').setInputFiles({
      name: 'slip.png',
      mimeType: 'image/png',
      buffer: mockSlipBuffer(),
    });

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/TC-PAYMENT-03_slip-uploaded.png', fullPage: true });

    // ตรวจ preview สลิปแสดง
    const slipPreview = page.locator('img[alt*="Slip"], img[alt*="slip"]');
    await expect(slipPreview).toBeVisible({ timeout: 5000 });

    // ตรวจปุ่มเปลี่ยน state เป็น "อัปโหลดสลิปสำเร็จ"
    const uploadedLabel = page.getByText(/อัปโหลดสลิปสำเร็จ|Slip Uploaded/i);
    await expect(uploadedLabel).toBeVisible({ timeout: 5000 });
  });

  // ── TC-PAYMENT-04 ──────────────────────────────────────────────
  test('TC-PAYMENT-04 | อัปโหลดสลิปและชำระเงินสำเร็จ → ไปหน้า Confirmation', async ({ page }) => {
    await injectAuthAndBooking(page);

    // Mock bookings API ให้ตอบ 201
    await page.route('**/bookings', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'BK-TEST-001',
            tourNameSnapshot: 'ดำน้ำเกาะพีพี 1 วัน',
            travelDate: '2026-06-01',
            travelers: 2,
            totalPrice: 3000,
            tour: { id: 1, name: 'ดำน้ำเกาะพีพี 1 วัน', name_th: 'ดำน้ำเกาะพีพี 1 วัน' },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/payment');
    await page.waitForLoadState('networkidle');

    // อัปโหลดสลิป
    await page.locator('input[type="file"]').setInputFiles({
      name: 'slip.png',
      mimeType: 'image/png',
      buffer: mockSlipBuffer(),
    });
    await page.waitForTimeout(500);

    // กดชำระเงิน
    const payBtn = page.locator('button').filter({ hasText: /ชำระเงิน|Pay Now/i }).last();
    await payBtn.click();

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/TC-PAYMENT-04_confirmation.png', fullPage: true });

    // ตรวจ heading ยืนยันการจองปรากฏ
    const confirmHeading = page.locator('h1, h2').filter({ hasText: /สำเร็จ|Confirmed|ยืนยัน|Booking/i }).first();
    await expect(confirmHeading).toBeVisible({ timeout: 10000 });
  });

  // ── TC-PAYMENT-05 ──────────────────────────────────────────────
  test('TC-PAYMENT-05 | ไม่ได้ Login → เข้าหน้า payment → แสดง warning กรุณาเข้าสู่ระบบ', async ({ page }) => {
    // ไม่ inject user — เอาออกให้ชัดเจน
    await page.addInitScript(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.setItem('roamhub_tutorial_seen_guest', 'true');
      sessionStorage.setItem('bookingData', JSON.stringify({
        tourId: 1,
        tourName: 'ทัวร์ทดสอบ',
        tourName_th: 'ทัวร์ทดสอบ',
        date: '2026-06-01',
        travelers: 1,
        totalPrice: 1500,
        tour: { id: 1, name: 'ทัวร์ทดสอบ', name_th: 'ทัวร์ทดสอบ' },
      }));
    });

    await page.goto('/payment');
    await page.waitForLoadState('networkidle');

    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible({ timeout: 5000 })) {
      // อัปโหลดสลิปแล้วกดชำระเงิน
      await fileInput.setInputFiles({
        name: 'slip.png',
        mimeType: 'image/png',
        buffer: mockSlipBuffer(),
      });
      await page.waitForTimeout(500);

      const payBtn = page.locator('button').filter({ hasText: /ชำระเงิน|Pay Now/i }).last();
      await payBtn.click();

      await page.screenshot({ path: 'screenshots/TC-PAYMENT-05_no-login-warning.png', fullPage: true });

      // ตรวจ modal แจ้งให้ login
      const loginWarning = page.locator('div').filter({ hasText: /เข้าสู่ระบบ|Login Required/i }).first();
      await expect(loginWarning).toBeVisible({ timeout: 5000 });
    } else {
      // ถ้า redirect ไป /login เลย ก็ถือว่า pass
      await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
    }
  });

});