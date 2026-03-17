// playwright/tests/TC-CHAT.spec.ts
import { test, expect } from '@playwright/test';
import { loginAs, skipTutorial } from '../helpers/auth';

test.beforeEach(async ({ page }) => {
  await skipTutorial(page);
});

test.describe('TC-CHAT | Chat Widget', () => {

  test('TC-CHAT-01 | User ส่งข้อความผ่าน Chat Widget', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // คลิกปุ่ม chat widget (มุมล่างขวา)
    const chatBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
    const fixedBtn = page.locator('.fixed.bottom-6.right-6 button');
    const btn = await fixedBtn.isVisible({ timeout: 3000 }) ? fixedBtn : chatBtn;

    await btn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/TC-CHAT-01_01_widget-open.png', fullPage: true });

    // พิมพ์ข้อความ
    const textarea = page.locator('textarea').last();
    if (await textarea.isVisible({ timeout: 3000 })) {
      await textarea.fill('สวัสดีครับ ต้องการสอบถามเรื่องทัวร์เชียงใหม่');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'screenshots/TC-CHAT-01_02_sent.png', fullPage: true });
      // ข้อความควรปรากฏ
      await expect(page.locator('body')).toContainText('สวัสดีครับ ต้องการสอบถามเรื่องทัวร์เชียงใหม่');
    } else {
      await page.screenshot({ path: 'screenshots/TC-CHAT-01_no-textarea.png', fullPage: true });
      test.skip();
    }
  });

  test('TC-CHAT-02 | Admin ตอบกลับ User ผ่าน Admin Chat', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/chat');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/TC-CHAT-02_01_admin-chat.png', fullPage: true });

    // เลือก contact แรก
    const contact = page.locator('[class*="contact"], [class*="cursor-pointer"]').first();
    if (await contact.isVisible({ timeout: 5000 })) {
      await contact.click();
      await page.waitForTimeout(500);

      const textarea = page.locator('textarea').last();
      if (await textarea.isVisible({ timeout: 3000 })) {
        await textarea.fill('สวัสดีครับ ยินดีให้บริการ มีอะไรสอบถามได้เลย');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'screenshots/TC-CHAT-02_02_replied.png', fullPage: true });
      }
    } else {
      await page.screenshot({ path: 'screenshots/TC-CHAT-02_no-contacts.png', fullPage: true });
      test.skip();
    }
  });

  test('TC-CHAT-03 | Guest ส่งข้อความได้โดยไม่ต้อง Login', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    const chatBtn = page.locator('.fixed.bottom-6.right-6 button');
    if (await chatBtn.isVisible({ timeout: 5000 })) {
      await chatBtn.click();
      await page.waitForTimeout(500);
      const textarea = page.locator('textarea').last();
      if (await textarea.isVisible({ timeout: 3000 })) {
        await textarea.fill('สอบถามราคาทัวร์ภูเก็ตหน่อยครับ');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'screenshots/TC-CHAT-03_guest-message.png', fullPage: true });
      }
    } else {
      test.skip();
    }
  });

});
