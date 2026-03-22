import { test, expect } from '@playwright/test';
import { loginAs, skipTutorial } from '../helpers/auth';

test.describe('TC-CHAT: ระบบแชทแบบ Real-time', () => {

  test('TC-CHAT-01: ผู้ใช้งานทั่วไปสามารถเปิด Chat Widget และส่งข้อความได้', async ({ page }) => {
    await loginAs(page, 'user'); // ✅ login + skipTutorial ในที เดียว

    // กดปุ่มเปิดแชท
    await page.locator('button.fixed.bottom-6.right-6').click();
    await expect(page.locator('h3').filter({ hasText: 'ฝ่ายบริการลูกค้า' })).toBeVisible({ timeout: 5000 });

    // พิมพ์และส่งข้อความ
    const timestamp = Date.now();
    const myMessage = `สวัสดีครับ สนใจแพ็กเกจทัวร์ครับ [${timestamp}]`;

    const textarea = page.locator('textarea[placeholder="สอบถามข้อมูลเพิ่มเติม..."]');
    await expect(textarea).toBeVisible();
    await textarea.fill(myMessage);
    await page.locator('div.fixed.bottom-6.right-6 button[type="submit"]').click();

    await expect(page.getByText(myMessage)).toBeVisible({ timeout: 10000 });
  });

  test('TC-CHAT-02: ทดสอบการแชทโต้ตอบระหว่าง Admin และ User แบบ Real-time', async ({ browser }) => {
    const userContext = await browser.newContext();
    const adminContext = await browser.newContext();
    const userPage = await userContext.newPage();
    const adminPage = await adminContext.newPage();

    // ✅ ใช้ loginAs แทนการ login เอง
    await loginAs(adminPage, 'admin');
    await adminPage.goto('/admin/chat');
    await expect(adminPage.getByText('กล่องข้อความ')).toBeVisible({ timeout: 10000 });

    await loginAs(userPage, 'user');

    // เปิด Chat Widget
    await userPage.locator('button.fixed.bottom-6.right-6').click();
    const userTextarea = userPage.locator('textarea[placeholder="สอบถามข้อมูลเพิ่มเติม..."]');
    await expect(userTextarea).toBeVisible({ timeout: 10000 });

    const timestamp = Date.now();
    const userMessage = `สอบถามเรื่องทัวร์ดำน้ำครับ มีว่างช่วงเดือนหน้าไหม? [${timestamp}]`;
    await userTextarea.fill(userMessage);
    await userPage.locator('div.fixed.bottom-6.right-6 button[type="submit"]').click();

    await expect(userPage.getByText(userMessage)).toBeVisible({ timeout: 10000 });

    // Admin รับข้อความ
    await adminPage.locator('.overflow-y-auto > div').first().click();
    await expect(adminPage.getByText(userMessage)).toBeVisible({ timeout: 10000 });

    // Admin ตอบกลับ
    const adminReply = `สวัสดีครับ ช่วงเดือนหน้ายังมีที่ว่างครับ [${timestamp}]`;
    await adminPage.getByPlaceholder('พิมพ์ข้อความตอบกลับ...').fill(adminReply);
    await adminPage.locator('button[type="submit"]').click();

    await expect(userPage.getByText(adminReply)).toBeVisible({ timeout: 10000 });

    await userContext.close();
    await adminContext.close();
  });
});