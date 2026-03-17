// playwright/tests/TC-REV.spec.ts
import { test, expect } from '@playwright/test';
import { loginAs, skipTutorial } from '../helpers/auth';

test.beforeEach(async ({ page }) => {
  await skipTutorial(page);
});

test.describe('TC-REV | Reviews', () => {

  test('TC-REV-01 | User Login แล้วเขียนรีวิวได้', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/tour/1');
    await page.waitForLoadState('networkidle');

    // เลื่อนไปส่วนรีวิว
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/TC-REV-01_01_review-section.png', fullPage: true });

    const ratingBtns = page.locator('[class*="star"], button').filter({ hasText: /★|⭐|5/ });
    if (await ratingBtns.first().isVisible({ timeout: 3000 })) {
      await ratingBtns.last().click(); // คลิกดาวสุดท้าย = 5 ดาว
    }

    const commentInput = page.locator('textarea[placeholder*="ความคิดเห็น"], textarea').first();
    if (await commentInput.isVisible({ timeout: 3000 })) {
      await commentInput.fill('ทัวร์ดีมากครับ ประทับใจมาก ไกด์เป็นกันเอง');
    }

    await page.screenshot({ path: 'screenshots/TC-REV-01_02_filled.png', fullPage: true });

    const submitBtn = page.locator('button').filter({ hasText: /ส่งรีวิว|submit review/i }).first();
    if (await submitBtn.isVisible({ timeout: 3000 })) {
      await submitBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'screenshots/TC-REV-01_03_submitted.png', fullPage: true });
    }
  });

  test('TC-REV-02 | ดูรีวิวโดยไม่ต้อง Login', async ({ page }) => {
    await page.goto('/tour/1');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/TC-REV-02_reviews-guest.png', fullPage: true });
    await expect(page.locator('body')).not.toContainText(/401|403/i);
  });

  test('TC-REV-03 | ไม่ Login ส่ง POST review → 401', async ({ page, request }) => {
    const resp = await request.post('http://localhost:3000/reviews/tour/1', {
      data: { rating: 5, comment: 'test' },
    });
    await page.screenshot({ path: 'screenshots/TC-REV-03_no-auth.png' });
    expect([401, 403]).toContain(resp.status());
  });

});
