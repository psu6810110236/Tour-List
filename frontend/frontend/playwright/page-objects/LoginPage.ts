import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(public page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async switchLanguageTo(lang: 'TH' | 'EN') {
    const currentLangText = await this.page.locator('.absolute.top-6.right-6 button span').innerText();
    if (currentLangText !== lang) {
      await this.page.locator('.absolute.top-6.right-6 button').click();
    }
  }

  async fillCredentials(email: string, pass: string) {
    await this.page.locator('input[type="email"]').fill(email);
    await this.page.locator('input[type="password"]').fill(pass);
  }

  async submit() {
    await this.page.locator('button[type="submit"]').click();
  }

  async expectLoginError() {
    await expect(this.page.locator('.bg-red-50.text-red-500')).toBeVisible();
  }
}