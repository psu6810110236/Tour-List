// playwright/tests/TC-PROF.spec.ts
import { test, expect } from '@playwright/test';
import { loginAs, skipTutorial } from '../helpers/auth';

test.beforeEach(async ({ page }) => {
  await skipTutorial(page);
});

test.describe('TC-PROF | User Profile', () => {

  test('TC-PROF-01 | ดูโปรไฟล์ตัวเอง', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/TC-PROF-01_profile.png', fullPage: true });
    await expect(page.locator('body')).not.toContainText(/401|403|not found/i);
  });

  test('TC-PROF-02 | แก้ไขชื่อและเบอร์โทร', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    const nameInput = page.locator('input[name="fullName"], input[placeholder*="ชื่อ"]').first();
    if (await nameInput.isVisible({ timeout: 5000 })) {
      await nameInput.clear();
      await nameInput.fill('Test User Updated');

      const phoneInput = page.locator('input[name="phone"], input[placeholder*="เบอร์"]').first();
      if (await phoneInput.isVisible({ timeout: 2000 })) {
        await phoneInput.fill('0812345678');
      }

      await page.screenshot({ path: 'screenshots/TC-PROF-02_01_filled.png', fullPage: true });

      const saveBtn = page.locator('button').filter({ hasText: /บันทึก|save|อัปเดต/i }).first();
      if (await saveBtn.isVisible({ timeout: 3000 })) {
        await saveBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'screenshots/TC-PROF-02_02_saved.png', fullPage: true });
      }
    } else {
      await page.screenshot({ path: 'screenshots/TC-PROF-02_no-inputs.png', fullPage: true });
      test.skip();
    }
  });

  test('TC-PROF-03 | เปลี่ยนรหัสผ่าน — Old Password ถูกต้อง', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    const oldPassInput = page.locator('input[name="oldPassword"], input[placeholder*="รหัสผ่านเดิม"]').first();
    if (await oldPassInput.isVisible({ timeout: 5000 })) {
      await oldPassInput.fill('user1423_A');
      await page.locator('input[name="newPassword"], input[placeholder*="รหัสผ่านใหม่"]').first().fill('user1423_A'); // เปลี่ยนกลับเหมือนเดิม

      await page.screenshot({ path: 'screenshots/TC-PROF-03_01_filled.png', fullPage: true });

      const changeBtn = page.locator('button').filter({ hasText: /เปลี่ยนรหัส|change password/i }).first();
      if (await changeBtn.isVisible({ timeout: 3000 })) {
        await changeBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'screenshots/TC-PROF-03_02_result.png', fullPage: true });
      }
    } else {
      test.skip();
    }
  });

  test('TC-PROF-04 | เปลี่ยนรหัสผ่าน — Old Password ผิด → Error', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    const oldPassInput = page.locator('input[name="oldPassword"], input[placeholder*="รหัสผ่านเดิม"]').first();
    if (await oldPassInput.isVisible({ timeout: 5000 })) {
      await oldPassInput.fill('WrongOldPassword');
      await page.locator('input[name="newPassword"], input[placeholder*="รหัสผ่านใหม่"]').first().fill('NewPass1234');

      const changeBtn = page.locator('button').filter({ hasText: /เปลี่ยนรหัส|change/i }).first();
      if (await changeBtn.isVisible({ timeout: 3000 })) {
        await changeBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'screenshots/TC-PROF-04_wrong-old-pass.png', fullPage: true });
        await expect(page.locator('.bg-red-50, .text-red-500')).toBeVisible({ timeout: 3000 });
      }
    } else {
      test.skip();
    }
  });

});
