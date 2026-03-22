// playwright/helpers/auth.ts
import { Page } from '@playwright/test';
import { ADMIN, USER } from './test-data';

export async function skipTutorial(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('roamhub_tutorial_seen_guest', 'true');
  });
}

export async function loginAs(page: Page, role: 'admin' | 'user' = 'user') {
  const cred = role === 'admin' ? ADMIN : USER;

  // เซ็ต guest key ก่อน load
  await page.addInitScript(() => {
    localStorage.setItem('roamhub_tutorial_seen_guest', 'true');
  });

  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="email"]').fill(cred.email);
  await page.locator('input[type="password"]').fill(cred.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/$/, { timeout: 10000 });

  // หลัง login เซ็ต key ด้วย user id จริง
  await page.evaluate(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      localStorage.setItem(`roamhub_tutorial_seen_${user.id}`, 'true');
    }
  });
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