import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { TourDetailPage } from '../page-objects/TourDetailPage';
import { ApiMocks } from '../utils/api-mocks';

test.describe('Booking Flow', () => {
  test('สมาชิกสามารถทำการจองทัวร์ได้สำเร็จ', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const tourPage = new TourDetailPage(page);
    const apiMocks = new ApiMocks(page);

    // 1. เตรียม Mocks ทั้งหมดที่ต้องใช้ใน Flow นี้
    await apiMocks.mockSuccessfulLogin('user');
    await apiMocks.mockTourDetail('99');
    await apiMocks.mockCreateBooking();

    // 2. ผู้ใช้ทำการ Login ก่อน
    await loginPage.goto();
    await loginPage.fillCredentials('user@test.com', 'Pass123!');
    await loginPage.submit();

    // 3. ผู้ใช้ไปที่หน้าทัวร์เพื่อทำการจอง
    await tourPage.goto('99');
    await tourPage.expectTourName('ดำน้ำเกาะพีพี 1 วันเต็ม');

    // 4. กดจองและกรอกข้อมูล
    await tourPage.clickBookNow();
    await tourPage.fillBookingDetails(2, '2026-12-25'); // จอง 2 คน วันคริสต์มาส
    await tourPage.confirmBooking();

    // 5. คาดหวังว่าต้องขึ้นข้อความสำเร็จ หรือถูก Redirect ไปหน้า Success/History
    await expect(page.locator('text=Booking successful').or(page.locator('text=จองสำเร็จ'))).toBeVisible();
  });
});