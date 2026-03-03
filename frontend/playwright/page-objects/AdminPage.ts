import { Page, expect } from '@playwright/test';

export class AdminPage {
  constructor(public page: Page) {}

  async gotoDashboard() {
    await this.page.goto('/admin'); // อ้างอิงจาก AdminRoute.tsx ของคุณ
  }

  async expectDashboardStatsVisible() {
    // เช็คว่าหน้าโหลดข้อมูลสถิติมาแสดงสำเร็จ (เช่น มีคำว่า Revenue หรือ ผู้ใช้งานทั้งหมด)
    await expect(this.page.locator('text=Revenue').or(this.page.locator('text=รายได้'))).toBeVisible();
  }

  async navigateToChat() {
    await this.page.click('a[href="/admin/chat"]');
  }
}