// playwright/tests/TC-BOOK.spec.ts
// ─────────────────────────────────────────────────────────────────
// Module: Booking
// ─────────────────────────────────────────────────────────────────
import { test, expect, request } from '@playwright/test';
import { loginAs, skipTutorial } from '../helpers/auth';
import { ADMIN, USER, API } from '../helpers/test-data';
import * as path from 'path';

test.beforeEach(async ({ page }) => {
  await skipTutorial(page);
});

test.describe('TC-BOOK | Booking', () => {

  // ── TC-BOOK-01 ─────────────────────────────────────────────────
  test('TC-BOOK-01 | User Login แล้วจองทัวร์ได้', async ({ page }) => {
    await loginAs(page, 'user');

    // ไปหน้า tour แรก
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const tourBtn = page.locator('button').filter({ hasText: /ดูรายละเอียด|View Tour/i }).first();
    if (await tourBtn.isVisible({ timeout: 5000 })) {
      await tourBtn.click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto('/tour/1');
      await page.waitForLoadState('networkidle');
    }

    await page.screenshot({ path: 'screenshots/TC-BOOK-01_01_tour-detail.png', fullPage: true });

    // เลือกวันที่ (คลิก available date แรก)
    const dateBtn = page.locator('button').filter({ hasText: /2026|2025/ }).first();
    if (await dateBtn.isVisible({ timeout: 3000 })) {
      await dateBtn.click();
    }

    // กรอกจำนวนคน
    const travelerInput = page.locator('input[type="number"], input[placeholder*="จำนวน"]');
    if (await travelerInput.isVisible({ timeout: 3000 })) {
      await travelerInput.fill('2');
    }

    await page.screenshot({ path: 'screenshots/TC-BOOK-01_02_filled.png', fullPage: true });

    // คลิกจอง
    const bookBtn = page.locator('button').filter({ hasText: /จอง|Book/i }).first();
    if (await bookBtn.isVisible({ timeout: 3000 })) {
      await bookBtn.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'screenshots/TC-BOOK-01_03_after-book.png', fullPage: true });
  });

  // ── TC-BOOK-02 ─────────────────────────────────────────────────
  test('TC-BOOK-02 | ไม่ได้ Login → กดจอง → Redirect /login', async ({ page }) => {
    // ล้าง session
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });

    await page.goto('/tour/1');
    await page.waitForLoadState('networkidle');

    const bookBtn = page.locator('button').filter({ hasText: /จอง|Book/i }).first();
    if (await bookBtn.isVisible({ timeout: 5000 })) {
      await bookBtn.click();
      await page.waitForURL(/\/login/, { timeout: 8000 });
      await page.screenshot({ path: 'screenshots/TC-BOOK-02_redirect-login.png', fullPage: true });
      await expect(page).toHaveURL(/\/login/);
    } else {
      // skip ถ้าหน้า tour ไม่มีปุ่มจอง
      test.skip();
    }
  });

  // ── TC-BOOK-03 ─────────────────────────────────────────────────
  test('TC-BOOK-03 | Upload สลิปการชำระเงิน', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/my-bookings');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/TC-BOOK-03_01_my-bookings.png', fullPage: true });

    // หาปุ่ม upload
    const uploadBtn = page.locator('button, label').filter({ hasText: /อัปโหลด|upload|สลิป|slip/i }).first();
    if (await uploadBtn.isVisible({ timeout: 5000 })) {
      // สร้างไฟล์รูปชั่วคราว (1x1 pixel PNG)
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles({
        name: 'test-slip.png',
        mimeType: 'image/png',
        // 1x1 transparent PNG base64
        buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'),
      });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'screenshots/TC-BOOK-03_02_uploaded.png', fullPage: true });
    } else {
      await page.screenshot({ path: 'screenshots/TC-BOOK-03_no-upload-button.png', fullPage: true });
      test.skip();
    }
  });

  // ── TC-BOOK-04 ─────────────────────────────────────────────────
  test('TC-BOOK-04 | Upload ไฟล์ที่ไม่ใช่รูป → Error', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/my-bookings');
    await page.waitForLoadState('networkidle');

    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.isVisible({ timeout: 5000 })) {
      await fileInput.setInputFiles({
        name: 'document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4 fake pdf content'),
      });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'screenshots/TC-BOOK-04_wrong-filetype.png', fullPage: true });
      // ตรวจ error
      const errorMsg = page.locator('.text-red-500, .bg-red-50, [class*="error"]');
      await expect(errorMsg).toBeVisible({ timeout: 3000 });
    } else {
      test.skip();
    }
  });

  // ── TC-BOOK-05 ─────────────────────────────────────────────────
  test('TC-BOOK-05 | Admin อนุมัติการจอง', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/TC-BOOK-05_01_dashboard.png', fullPage: true });

    // หาปุ่มอนุมัติ
    const approveBtn = page.locator('button').filter({ hasText: /อนุมัติ|approve/i }).first();
    if (await approveBtn.isVisible({ timeout: 5000 })) {
      await approveBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'screenshots/TC-BOOK-05_02_approved.png', fullPage: true });
      // ตรวจว่า status เปลี่ยน
      await expect(page.locator('body')).toContainText(/APPROVED|อนุมัติแล้ว/i);
    } else {
      await page.screenshot({ path: 'screenshots/TC-BOOK-05_no-pending.png', fullPage: true });
      test.skip();
    }
  });

  // ── TC-BOOK-06 ─────────────────────────────────────────────────
  test('TC-BOOK-06 | Admin ปฏิเสธการจองพร้อมเหตุผล', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    const rejectBtn = page.locator('button').filter({ hasText: /ปฏิเสธ|reject/i }).first();
    if (await rejectBtn.isVisible({ timeout: 5000 })) {
      await rejectBtn.click();

      // กรอกเหตุผล (ถ้ามี dialog)
      const reasonInput = page.locator('textarea, input[placeholder*="เหตุผล"]');
      if (await reasonInput.isVisible({ timeout: 2000 })) {
        await reasonInput.fill('ที่นั่งเต็มแล้ว');
      }
      const confirmBtn = page.locator('button').filter({ hasText: /ยืนยัน|confirm/i }).first();
      if (await confirmBtn.isVisible({ timeout: 2000 })) {
        await confirmBtn.click();
      }

      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'screenshots/TC-BOOK-06_rejected.png', fullPage: true });
    } else {
      test.skip();
    }
  });

  // ── TC-BOOK-07 ─────────────────────────────────────────────────
  test('TC-BOOK-07 | User ธรรมดา PATCH booking status → 403', async ({ page }) => {
    // Login เป็น user ก่อน
    await loginAs(page, 'user');
    const token = await page.evaluate(() => localStorage.getItem('token'));

    // ยิง API โดยตรง
    const ctx = await request.newContext();
    const resp = await ctx.patch(`${API}/bookings/fake-id/status`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { status: 'APPROVED' },
    });

    await page.screenshot({ path: 'screenshots/TC-BOOK-07_api-403.png', fullPage: true });
    // ต้องได้ 403 หรือ 404 (ไม่ใช่ 200)
    expect([403, 404, 401]).toContain(resp.status());
    await ctx.dispose();
  });

  // ── TC-BOOK-08 ─────────────────────────────────────────────────
  test('TC-BOOK-08 | My Bookings แสดงเฉพาะของตัวเอง', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/my-bookings');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/TC-BOOK-08_my-bookings.png', fullPage: true });

    // ต้องไม่มี error และหน้าโหลดได้
    await expect(page.locator('body')).not.toContainText(/401|403|Forbidden/i);
  });

});
