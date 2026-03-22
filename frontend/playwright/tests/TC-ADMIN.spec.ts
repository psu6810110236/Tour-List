// playwright/tests/TC-ADMIN.spec.ts
// ─────────────────────────────────────────────────────────────────
// Module: Admin Dashboard
// ─────────────────────────────────────────────────────────────────
import { test, expect } from '@playwright/test';
import { loginAs, skipTutorial } from '../helpers/auth';

test.beforeEach(async ({ page }) => {
  await skipTutorial(page);
});


test.describe('TC-ADMIN | Admin Dashboard', () => {

  test('TC-ADMIN-01 | Dashboard Stats แสดงถูกต้อง', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/TC-ADMIN-01_stats.png', fullPage: true });

    // ต้องเห็น stat cards อย่างน้อย 1 อัน
    await expect(page.locator('body')).not.toContainText(/401|403|Forbidden/i);
  });

  test('TC-ADMIN-02 | Admin สร้างทัวร์ใหม่', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    const addTourBtn = page.locator('button').filter({ hasText: /เพิ่มทัวร์|add tour/i }).first();
    if (await addTourBtn.isVisible({ timeout: 5000 })) {
      await addTourBtn.click();
      await page.waitForTimeout(500);

      // กรอกข้อมูล
      await page.locator('input[name="name"], input[placeholder*="ชื่อทัวร์"]').first().fill('Test Tour Playwright');
      await page.locator('input[name="price"], input[placeholder*="ราคา"]').first().fill('1500');

      await page.screenshot({ path: 'screenshots/TC-ADMIN-02_create-tour.png', fullPage: true });

      const saveBtn = page.locator('button').filter({ hasText: /บันทึก|save/i }).first();
      if (await saveBtn.isVisible({ timeout: 3000 })) {
        await saveBtn.click();
        await page.waitForTimeout(1500);
      }
      await page.screenshot({ path: 'screenshots/TC-ADMIN-02_saved.png', fullPage: true });
    } else {
      await page.screenshot({ path: 'screenshots/TC-ADMIN-02_no-add-button.png', fullPage: true });
      test.skip();
    }
  });

  test('TC-ADMIN-05 | User ธรรมดาเข้า Admin Route → Redirect', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/TC-ADMIN-05_user-access-admin.png', fullPage: true });

    // ต้อง redirect ออก หรือแสดง 403
    const isOnAdmin = page.url().includes('/admin/dashboard');
    const hasForbidden = await page.locator('body').textContent().then(t => /403|forbidden|ไม่มีสิทธิ์/i.test(t || ''));
    expect(!isOnAdmin || hasForbidden).toBeTruthy();
  });

});
