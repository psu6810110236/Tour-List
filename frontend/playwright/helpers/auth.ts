// playwright/helpers/auth.ts
import { Page } from '@playwright/test';
import { ADMIN, USER } from './test-data';

// ปิด Tutorial/Language Modal โดย set localStorage ก่อนโหลดหน้า
// key มาจาก App.tsx: localStorage.getItem("roamhub_tutorial_seen_v1")
export async function skipTutorial(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('roamhub_tutorial_seen_v1', 'true');
  });
}

export async function loginAs(page: Page, role: 'admin' | 'user' = 'user') {
  const cred = role === 'admin' ? ADMIN : USER;

  // ปิด modal ก่อนโหลดหน้าใดๆ
  await skipTutorial(page);

  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="email"]').fill(cred.email);
  await page.locator('input[type="password"]').fill(cred.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/$/, { timeout: 10000 });
}

export async function logout(page: Page) {
  const logoutBtn = page.getByRole('button', { name: /logout|ออกจากระบบ/i });
  if (await logoutBtn.isVisible({ timeout: 3000 })) {
    await logoutBtn.click();
  } else {
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
    await page.goto('/login');
  }
}