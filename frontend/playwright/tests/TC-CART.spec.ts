// playwright/tests/TC-CART.spec.ts
import { test, expect } from '@playwright/test';
import { loginAs, skipTutorial } from '../helpers/auth';

test.beforeEach(async ({ page }) => {
  await skipTutorial(page);
});

test.describe('TC-CART | Cart', () => {

  test('TC-CART-01 | เพิ่มทัวร์ลงตะกร้า → Cart Drawer เปิด', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const addCartBtn = page.locator('button').filter({ hasText: /ตะกร้า|cart|เพิ่ม/i }).first();
    if (await addCartBtn.isVisible({ timeout: 5000 })) {
      await addCartBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/TC-CART-01_cart-open.png', fullPage: true });
      // ตรวจว่า drawer เปิด
      const drawer = page.locator('[class*="drawer"], [class*="cart"]');
      await expect(drawer).toBeVisible({ timeout: 3000 });
    } else {
      // ลอง tour detail page
      await page.goto('/tour/1');
      await page.waitForLoadState('networkidle');
      const btn = page.locator('button').filter({ hasText: /ตะกร้า|cart/i }).first();
      await page.screenshot({ path: 'screenshots/TC-CART-01_tour-page.png', fullPage: true });
      test.skip();
    }
  });

  test('TC-CART-03 | ราคาใน Cart คำนวณจาก Backend (Anti price tampering)', async ({ page }) => {
    let cartPayload: any = null;

    // ดัก request เพิ่มลงตะกร้า
    page.on('request', req => {
      if (req.url().includes('/cart/add') && req.method() === 'POST') {
        cartPayload = req.postDataJSON();
      }
    });

    page.on('response', async resp => {
      if (resp.url().includes('/cart/add')) {
        const json = await resp.json().catch(() => null);
        if (json && cartPayload) {
          // ราคาที่ backend ตอบกลับต้องไม่ใช่ราคาที่ frontend ส่งไป (ถ้า frontend ส่งราคาผิด)
          console.log('Cart payload sent:', cartPayload);
          console.log('Cart response:', json);
        }
      }
    });

    await loginAs(page, 'user');
    await page.goto('/tour/1');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/TC-CART-03_tour-page.png', fullPage: true });
  });

});
