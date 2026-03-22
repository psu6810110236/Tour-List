import { test, expect } from '@playwright/test';
const BACKDROP_CLICK_COORDINATES = { x: 10, y: 10 };
test.describe('Admin Workflow Test - RoamHub', () => {
  test('TC- workflow-1: แอดมินล็อกอิน, จัดการ Tutorial, และลบทัวร์รายการแรกได้', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.getByPlaceholder(/อีเมล|Email/i).fill('admin@test.com');
    await page.getByPlaceholder(/รหัสผ่าน|Password/i).fill('password123');
    await page.getByRole('button', { name: /เข้าสู่ระบบ|Login|Sign In/i }).first().click();
    await page.waitForTimeout(1000); 
    await page.waitForTimeout(1500); 
    console.log('Trying to click outside to close tutorial...');
    await page.mouse.click(BACKDROP_CLICK_COORDINATES.x, BACKDROP_CLICK_COORDINATES.y);
    await page.waitForTimeout(500); 
    const profileDropdown = page.getByText('Admin Tester').first();
    await profileDropdown.click();
    await page.waitForTimeout(500); 
    const adminPanelMenu = page.getByText('Admin Panel', { exact: true }).first();
    await expect(adminPanelMenu).toBeVisible(); 
    await adminPanelMenu.click();
    await expect(page).toHaveURL(/admin/i);
    const toursTab = page.getByText('ทัวร์', { exact: true }).first();
    await toursTab.click();
    const addTourBtn = page.getByText(/เพิ่มทัวร์ใหม่/i).first();
    await expect(addTourBtn).toBeVisible();
    await page.waitForTimeout(1500);
    try {
      const deleteBtn = page.locator('button').filter({ 
        has: page.locator('svg[class*="red"], svg.text-red-500, path[class*="red"]') 
      }).first();
      
      await deleteBtn.click({ timeout: 3000 });
      console.log('ลบด้วยท่าที่ 1 สำเร็จ (หาสีแดง)');
      
    } catch (error) {
      const firstRow = page.locator('tbody tr').first();
      const lastButtonInRow = firstRow.locator('button').last();
      
      await lastButtonInRow.click();
      console.log('ลบด้วยท่าที่ 2 สำเร็จ (จิ้มปุ่มขวาสุดของตาราง)');
    }
    const confirmPopup = page.getByText(/ยืนยัน|Confirm/i).first();
    await expect(confirmPopup).toBeVisible(); 
    const confirmButton = page.locator('button', { hasText: /ยืนยัน|Confirm/i }).first();
    await confirmButton.click();
    const successText = page.getByText('สำเร็จ', { exact: true }).first();
    await expect(successText).toBeVisible({ timeout: 5000 });
    const okButton = page.getByRole('button', { name: 'ตกลง' }).first();
    await okButton.click();

    console.log('ลบทัวร์สำเร็จ');
  });

});