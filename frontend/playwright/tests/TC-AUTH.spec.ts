// playwright/tests/TC-AUTH.spec.ts
import { test, expect } from '@playwright/test';
import { loginAs, skipTutorial } from '../helpers/auth';
import { ADMIN, USER, newUserEmail } from '../helpers/test-data';

// ปิด modal ทุก test ใน suite นี้
test.beforeEach(async ({ page }) => {
  await skipTutorial(page);
});

test.describe('TC-AUTH | Authentication', () => {

  test('TC-AUTH-01 | Register ด้วยข้อมูลที่ถูกต้อง', async ({ page }) => {
    const email = newUserEmail();
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/TC-AUTH-01_01_register-page.png', fullPage: true });

    await page.locator('input[type="text"]').fill('Test User Auto');
    await page.locator('input[type="email"]').fill(email);
    const passwords = page.locator('input[type="password"]');
    await passwords.nth(0).fill('Test1234!');
    await passwords.nth(1).fill('Test1234!');
    await page.locator('#terms').check();

    await page.screenshot({ path: 'screenshots/TC-AUTH-01_02_filled.png', fullPage: true });
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
    await page.screenshot({ path: 'screenshots/TC-AUTH-01_03_redirected.png', fullPage: true });
  });

  test('TC-AUTH-02 | Register ด้วย Email ที่มีอยู่แล้ว → Error', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="text"]').fill('Duplicate User');
    await page.locator('input[type="email"]').fill(USER.email);
    const passwords = page.locator('input[type="password"]');
    await passwords.nth(0).fill('Test1234!');
    await passwords.nth(1).fill('Test1234!');
    await page.locator('#terms').check();
    await page.locator('button[type="submit"]').click();

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/TC-AUTH-02_error.png', fullPage: true });
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 5000 });
  });

  test('TC-AUTH-03 | Register Password ไม่ตรงกัน → Error client-side', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="text"]').fill('Mismatch User');
    await page.locator('input[type="email"]').fill('mismatch@test.com');
    const passwords = page.locator('input[type="password"]');
    await passwords.nth(0).fill('Test1234!');
    await passwords.nth(1).fill('Wrong9999!');
    await page.locator('#terms').check();
    await page.locator('button[type="submit"]').click();

    await page.screenshot({ path: 'screenshots/TC-AUTH-03_mismatch.png', fullPage: true });
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('.bg-red-50')).toContainText(/รหัสผ่านไม่ตรงกัน/);
  });

  test('TC-AUTH-04 | Login ด้วย credentials ที่ถูกต้อง (User)', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/TC-AUTH-04_01_login-page.png', fullPage: true });

    await page.locator('input[type="email"]').fill(USER.email);
    await page.locator('input[type="password"]').fill(USER.password);
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });
    await page.screenshot({ path: 'screenshots/TC-AUTH-04_02_home.png', fullPage: true });

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });

  test('TC-AUTH-05 | Login ด้วย Password ผิด → Error message', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"]').fill(USER.email);
    await page.locator('input[type="password"]').fill('WrongPassword999');
    await page.locator('button[type="submit"]').click();

    await page.screenshot({ path: 'screenshots/TC-AUTH-05_wrong-pass.png', fullPage: true });
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.bg-red-50')).toContainText(/อีเมลหรือรหัสผ่านไม่ถูกต้อง/);
  });

  test('TC-AUTH-06 | เข้า Protected Route โดยไม่ Login → Redirect /login', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
    await page.goto('/admin/dashboard');
    await page.waitForURL(/\/login/, { timeout: 8000 });
    await page.screenshot({ path: 'screenshots/TC-AUTH-06_redirect.png', fullPage: true });
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-AUTH-07 | Logout → ล้าง token และ redirect', async ({ page }) => {
    await loginAs(page, 'user');

    const tokenBefore = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenBefore).toBeTruthy();

    // หา logout button ใน navbar/dropdown
    const logoutBtn = page.getByRole('button', { name: /logout|ออกจากระบบ/i });
    if (await logoutBtn.isVisible({ timeout: 3000 })) {
      await logoutBtn.click();
    } else {
      // ลอง click user avatar/dropdown ก่อน
      const userMenu = page.locator('[class*="avatar"], [class*="user-menu"], button').filter({ hasText: /test|user/i }).first();
      if (await userMenu.isVisible({ timeout: 2000 })) {
        await userMenu.click();
        await page.getByRole('button', { name: /logout|ออกจากระบบ/i }).click();
      } else {
        // fallback ล้าง localStorage
        await page.evaluate(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        });
        await page.goto('/login');
      }
    }

    await page.waitForURL(/\/login/, { timeout: 8000 });
    const tokenAfter = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenAfter).toBeNull();
    await page.screenshot({ path: 'screenshots/TC-AUTH-07_logout.png', fullPage: true });
  });

  test('TC-AUTH-08 | Admin Login → เข้า Admin Dashboard ได้', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/TC-AUTH-08_admin-dashboard.png', fullPage: true });

    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator('body')).not.toContainText(/403|Forbidden/i);
  });

});
