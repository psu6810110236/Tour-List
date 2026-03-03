import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';
import { TourDetailPage } from '../page-objects/TourDetailPage';
import { ApiMocks } from '../utils/api-mocks';

test.describe('Tour Exploration Flow', () => {
  let homePage: HomePage;
  let tourPage: TourDetailPage;
  let apiMocks: ApiMocks;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    tourPage = new TourDetailPage(page);
    apiMocks = new ApiMocks(page);
  });

  test('สามารถคลิกดูรายละเอียดทัวร์จากหน้า Home ได้', async ({ page }) => {
    // 1. Mock ข้อมูลหน้าแรกให้มีทัวร์โผล่มา
    await apiMocks.mockProvincesData();
    await page.route('**/tours', async route => {
      await route.fulfill({ status: 200, json: [{ id: '1', name: 'ดำน้ำเกาะพีพี', province: 'ภูเก็ต', price: 1500 }] });
    });
    
    // 2. Mock ข้อมูลหน้ารายละเอียดทัวร์
    await apiMocks.mockTourDetail('1');

    // 3. เริ่มเทสต์
    await homePage.goto();
    
    // คลิกปุ่ม "ดูรายละเอียดทัวร์"
    await page.locator('button', { hasText: /(ดูรายละเอียด|View Tour)/i }).first().click();

    // ต้องพาไปหน้า Tour Detail และแสดงชื่อทัวร์ถูกต้อง
    await expect(page).toHaveURL(/.*\/tour\/1/);
    await tourPage.expectTourName('ดำน้ำเกาะพีพี');
  });
});