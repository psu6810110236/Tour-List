import { Page, expect } from '@playwright/test';

export class HomePage {
  constructor(public page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async searchFor(keyword: string) {
    await this.page.locator('.search-bar input[type="text"]').fill(keyword);
    await this.page.locator('.search-bar button[type="submit"]').click();
  }

  async expectProvinceVisible(provinceName: string) {
    await expect(this.page.getByText(provinceName).first()).toBeVisible();
  }
}