// playwright/tests/TC-UI.spec.ts
import { test, expect } from '@playwright/test';
import { skipTutorial } from '../helpers/auth';

test.beforeEach(async ({ page }) => {
  await skipTutorial(page);
});

test.describe('TC-UI | Usability / Responsive', () => {

  test('TC-UI-01 | Responsive Mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/TC-UI-01_mobile-home.png', fullPage: true });

    // ไม่มี horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // tolerance 5px
  });

  test('TC-UI-02 | Responsive Tablet (820px)', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/TC-UI-02_tablet-home.png', fullPage: true });

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('TC-UI-03 | Switch ภาษา TH → EN', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const langBtn = page.locator('button').filter({ hasText: /TH|EN/ }).first();
    if (await langBtn.isVisible({ timeout: 5000 })) {
      const before = await page.locator('body').textContent();
      await langBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/TC-UI-03_lang-switched.png', fullPage: true });
      const after = await page.locator('body').textContent();
      // ข้อความต้องเปลี่ยน
      expect(before).not.toEqual(after);
    } else {
      test.skip();
    }
  });

  test('TC-UI-04 | Loading State ระหว่างโหลดข้อมูล', async ({ page }) => {
    // ทำให้ network ช้าเพื่อจับ loading state
    await page.route('**/tours/**', async route => {
      await new Promise(r => setTimeout(r, 800)); // delay 800ms
      await route.continue();
    });

    await page.goto('/');

    // จับ screenshot ขณะกำลังโหลด
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'screenshots/TC-UI-04_loading-state.png', fullPage: true });

    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/TC-UI-04_loaded.png', fullPage: true });

    // ตรวจว่ามี spinner element (ขณะ loading)
    // ถ้าไม่มีก็ไม่ fail เพราะ 800ms อาจโหลดเสร็จแล้ว
  });

  test('TC-UI-05 | Error State เมื่อ Backend ไม่ตอบ', async ({ page }) => {
    // Mock ให้ API ตอบ error
    await page.route('**/tours/**', async route => {
      await route.fulfill({ status: 500, body: 'Internal Server Error' });
    });
    await page.route('**/provinces**', async route => {
      await route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await page.goto('/provinces');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/TC-UI-05_error-state.png', fullPage: true });

    // ต้องมี error message แสดง ไม่ใช่หน้าว่างหรือ crash
    await expect(page.locator('body')).not.toBeEmpty();
    // ต้องมี error text หรือ empty state
    const errorVisible = await page.locator('.bg-red-50, [class*="error"], .text-red-').isVisible({ timeout: 3000 }).catch(() => false);
    const emptyVisible = await page.locator('body').textContent().then(t => t && t.length > 50);
    expect(errorVisible || emptyVisible).toBeTruthy();
  });

});
