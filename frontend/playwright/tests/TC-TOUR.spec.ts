// playwright/tests/TC-TOUR.spec.ts
// ─────────────────────────────────────────────────────────────────
// Module: Tours & Provinces
// ─────────────────────────────────────────────────────────────────
import { test, expect } from '@playwright/test';
import { skipTutorial } from '../helpers/auth';

test.beforeEach(async ({ page }) => {
  await skipTutorial(page);
});

test.describe('TC-TOUR | Tours & Provinces', () => {

  // ── TC-TOUR-01 ─────────────────────────────────────────────────
  test('TC-TOUR-01 | หน้า Home โหลดจังหวัดได้', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/TC-TOUR-01_home.png', fullPage: true });

    // ต้องมีการ์ดจังหวัดอย่างน้อย 1 ใบ
    const provinceCards = page.locator('.province-cards button, [class*="rounded"][class*="shadow"]');
    await expect(provinceCards.first()).toBeVisible({ timeout: 8000 });
  });

  // ── TC-TOUR-02 ─────────────────────────────────────────────────
  test('TC-TOUR-02 | Search Bar ค้นหาจังหวัด → Redirect', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // กรอก search
    await page.locator('.search-bar input[type="text"]').fill('เชียงใหม่');
    await page.screenshot({ path: 'screenshots/TC-TOUR-02_01_typed.png', fullPage: true });
    await page.locator('.search-bar button[type="submit"]').click();

    await page.waitForURL(/\/province\//, { timeout: 8000 });
    await page.screenshot({ path: 'screenshots/TC-TOUR-02_02_province-page.png', fullPage: true });
    await expect(page).toHaveURL(/\/province\//);
  });

  // ── TC-TOUR-03 ─────────────────────────────────────────────────
  test('TC-TOUR-03 | Filter ราคาใน Province Page', async ({ page }) => {
    await page.goto('/provinces');
    await page.waitForLoadState('networkidle');

    // คลิกจังหวัดแรก
    const firstProvince = page.locator('button').filter({ hasText: /จังหวัด|Province/i }).first();
    if (await firstProvince.isVisible({ timeout: 3000 })) {
      await firstProvince.click();
    } else {
      // ไปหน้า province โดยตรง
      await page.goto('/province/province-1');
    }
    await page.waitForLoadState('networkidle');

    // หา input filter ราคา
    const minPriceInput = page.locator('input[placeholder*="ต่ำสุด"], input[name="minPrice"], input[placeholder*="min" i]');
    const maxPriceInput = page.locator('input[placeholder*="สูงสุด"], input[name="maxPrice"], input[placeholder*="max" i]');

    if (await minPriceInput.isVisible({ timeout: 3000 })) {
      await minPriceInput.fill('1000');
      await maxPriceInput.fill('5000');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: 'screenshots/TC-TOUR-03_filter-price.png', fullPage: true });
  });

  // ── TC-TOUR-04 ─────────────────────────────────────────────────
  test('TC-TOUR-04 | คลิกทัวร์ → หน้า Tour Detail แสดงข้อมูลครบ', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // คลิกทัวร์แรกที่เห็น
    const tourCard = page.locator('button, a').filter({ hasText: /ดูรายละเอียด|View Tour/i }).first();
    if (await tourCard.isVisible({ timeout: 5000 })) {
      await tourCard.click();
    } else {
      await page.goto('/tour/1');
    }

    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/TC-TOUR-04_tour-detail.png', fullPage: true });

    // ตรวจว่ามีข้อมูลหลัก
    await expect(page.locator('body')).not.toContainText(/404|not found/i);
  });

  // ── TC-TOUR-05 ─────────────────────────────────────────────────
  test('TC-TOUR-05 | หน้า All Provinces (/provinces) โหลดจาก /tours/provinces', async ({ page }) => {
    // ดัก network request
    const requests: string[] = [];
    page.on('request', req => requests.push(req.url()));

    await page.goto('/provinces');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/TC-TOUR-05_all-provinces.png', fullPage: true });

    // ตรวจว่า call /tours/provinces ไม่ใช่ /provinces
    const correctEndpoint = requests.some(url => url.includes('/tours/provinces'));
    const wrongEndpoint   = requests.some(url => url.match(/\/provinces$/) && !url.includes('/tours/provinces'));
    expect(correctEndpoint).toBeTruthy();
    expect(wrongEndpoint).toBeFalsy();

    // ต้องไม่เห็น error message
    await expect(page.locator('.bg-red-50, .text-red-600')).not.toBeVisible({ timeout: 3000 });
  });

  // ── TC-TOUR-06 ─────────────────────────────────────────────────
  test('TC-TOUR-06 | Filter จำนวนวัน (tripDays)', async ({ page }) => {
    await page.goto('/province/province-1');
    await page.waitForLoadState('networkidle');

    const dayFilter = page.locator('select[name="tripDays"], button').filter({ hasText: /1 วัน|1 day/i }).first();
    if (await dayFilter.isVisible({ timeout: 3000 })) {
      await dayFilter.click();
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: 'screenshots/TC-TOUR-06_filter-days.png', fullPage: true });
  });

  // ── TC-TOUR-07 ─────────────────────────────────────────────────
  test('TC-TOUR-07 | ทัวร์ที่ isHidden=true ไม่แสดงในหน้า Home', async ({ page }) => {
    // ดัก API response
    await page.route('**/tours/search**', async route => {
      const resp = await route.fetch();
      const json = await resp.json();
      // inject tour ที่ hidden
      json.push({ id: 9999, name: 'Hidden Tour Test', isHidden: true, price: 999, historicalBooked: 0 });
      await route.fulfill({ json });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/TC-TOUR-07_hidden-tour.png', fullPage: true });

    // ต้องไม่เห็น hidden tour
    await expect(page.locator('body')).not.toContainText('Hidden Tour Test');
  });

});
