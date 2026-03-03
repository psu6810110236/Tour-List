import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';
import { ApiMocks } from '../utils/api-mocks';

test.describe('Home Page & Search', () => {
  let homePage: HomePage;
  let apiMocks: ApiMocks;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    apiMocks = new ApiMocks(page);
    
    // โหลดข้อมูลพื้นฐานหน้าแรก
    await apiMocks.mockProvincesData();
    await apiMocks.mockEmptyTours();
    await homePage.goto();
  });

  test('ควรแสดงข้อมูลจังหวัดที่ดึงจาก API ได้', async () => {
    // ต้องเจอคำว่า "ภูเก็ต" และ "เชียงใหม่" ตามที่เรา Mock ไว้
    await homePage.expectProvinceVisible('ภูเก็ต');
    await homePage.expectProvinceVisible('เชียงใหม่');
  });

  test('ค้นหาจังหวัดที่มีในระบบ ต้องพาไปหน้า Detail ของจังหวัดนั้น', async ({ page }) => {
    await homePage.searchFor('เชียงใหม่');
    
    // prov_2 คือ id ของเชียงใหม่ที่เรา Mock ไว้
    await expect(page).toHaveURL(/.*\/province\/2/); 
  });

  test('ค้นหาจังหวัดที่ไม่มีในระบบ ต้องพาไปหน้ารวมจังหวัด (Provinces)', async ({ page }) => {
    await homePage.searchFor('บึงกาฬ');
    await expect(page).toHaveURL(/.*\/provinces/);
  });
});