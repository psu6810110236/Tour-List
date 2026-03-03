import { Page, expect } from '@playwright/test';

export class TourDetailPage {
  constructor(public page: Page) {}

  async goto(tourId: string) {
    await this.page.goto(`/tour/${tourId}`);
  }

  async expectTourName(name: string) {
    await expect(this.page.getByRole('heading', { name })).toBeVisible();
  }

  async clickBookNow() {
    // สมมติว่าปุ่มจองมีคำว่า 'จองเลย' หรือ 'Book Now'
    await this.page.locator('button', { hasText: /(จองเลย|Book Now)/i }).click();
  }

  async fillBookingDetails(guests: number, date: string) {
    // 💡 ตัวอย่าง: เปลี่ยนไปหาช่องกรอกด้วย Placeholder หรือ Label แทน
    // สมมติว่าช่องกรอกวันที่ มี placeholder คำว่า "เลือกวันที่"
    await this.page.getByPlaceholder(/เลือกวันที่|Select Date/i).fill(date);
    
    // สมมติว่าช่องจำนวนคน มี placeholder คำว่า "จำนวนผู้เดินทาง"
    await this.page.getByPlaceholder(/จำนวนผู้เดินทาง|Guests/i).fill(guests.toString());
  }

  async confirmBooking() {
    await this.page.locator('button', { hasText: /(ยืนยันการจอง|Confirm)/i }).click();
  }
}