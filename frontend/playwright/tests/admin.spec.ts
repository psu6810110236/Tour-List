import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { AdminPage } from '../page-objects/AdminPage';
import { ApiMocks } from '../utils/api-mocks';

test.describe('Admin Flow', () => {
  test('Admin สามารถเข้าสู่ระบบและดูหน้า Dashboard ได้', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    const apiMocks = new ApiMocks(page);

    // 1. Login ด้วยสิทธิ์ Admin
    await loginPage.submit();
    await expect(page).toHaveURL(/.*\/$/);

    await test.step('3. คลิกเมนูเพื่อเข้าสู่หน้า Admin Dashboard', async () => {
      // 1. คลิกที่ปุ่ม Dropdown โปรไฟล์ผู้ใช้ (หาปุ่มที่มีไอคอน User/Avatar)
      await page.locator('button').filter({ has: page.locator('svg.lucide-user') }).first().click();
      
      // 2. รอให้เมนูกางออก แล้วคลิก "Admin Panel"
      await page.getByText('Admin Panel').click(); 
    });
    // 3. ตรวจสอบว่าเข้ามาหน้า Admin สำเร็จและเจอสถิติ
    await expect(page).toHaveURL(/.*\/admin/);
    await adminPage.expectDashboardStatsVisible();
    
  });
});