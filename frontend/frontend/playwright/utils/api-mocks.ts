import { Page } from '@playwright/test';

export class ApiMocks {
  constructor(public page: Page) {}

  // 1. Mock การเข้าสู่ระบบ (อัปเดตให้รองรับ Role user/admin)
  async mockSuccessfulLogin(role: 'user' | 'admin' = 'user') {
    await this.page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          access_token: `mock_prod_jwt_token_${role}`, 
          user: { email: `${role}@roamhub.com`, name: role === 'admin' ? 'Admin' : 'Test User', role: role } 
        })
      });
    });
  }

  // 2. Mock การสมัครสมาชิก
  async mockSuccessfulRegister() {
    await this.page.route('**/auth/register', async route => {
      await route.fulfill({ status: 201, json: { message: "Created" } });
    });
  }

  // 3. Mock ข้อมูลจังหวัดหน้า Home
  async mockProvincesData() {
    await this.page.route('**/provinces', async route => {
      await route.fulfill({ 
        status: 200, 
        json: [
          { id: '1', name: 'Phuket', name_th: 'ภูเก็ต', tourCount: 15, image: 'mock.jpg', description: '', description_th: '' },
          { id: '2', name: 'Chiang Mai', name_th: 'เชียงใหม่', tourCount: 10, image: 'mock.jpg', description: '', description_th: '' }
        ] 
      });
    });
  }

  // 4. Mock ทัวร์ว่างเปล่า (กัน error ตอนโหลดหน้า Home)
  async mockEmptyTours() {
    await this.page.route('**/tours', async route => {
      await route.fulfill({ status: 200, json: [] });
    });
  }

  // 5. Mock รายละเอียดทัวร์ (Tour Detail)
  async mockTourDetail(tourId: string) {
    await this.page.route(`**/tours/${tourId}`, async route => {
      await route.fulfill({
        status: 200,
        json: {
          id: tourId,
          name: 'ดำน้ำเกาะพีพี 1 วันเต็ม',
          province: 'ภูเก็ต',
          price: 1500,
          description: 'สัมผัสประสบการณ์ดำน้ำสุดพิเศษ...',
          images: ['mock-tour.jpg']
        }
      });
    });
  }

  // 6. Mock การจองทัวร์ (Booking)
  async mockCreateBooking() {
    await this.page.route('**/bookings', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          json: { message: 'Booking successful', bookingId: 'B-12345' }
        });
      } else {
        await route.continue(); // ถ้าเป็น GET ให้ผ่านไป
      }
    });
  }

  // 7. Mock ข้อมูล Admin Dashboard
  async mockAdminDashboard() {
    await this.page.route('**/admin/stats', async route => {
      await route.fulfill({
        status: 200,
        json: { totalUsers: 150, totalBookings: 45, revenue: 150000 }
      });
    });
  }
}