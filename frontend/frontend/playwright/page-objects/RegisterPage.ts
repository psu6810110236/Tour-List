import { Page } from '@playwright/test';

export class RegisterPage {
  constructor(public page: Page) {}

  async goto() {
    await this.page.goto('/register');
  }

  async fillForm(name: string, email: string, pass: string, confirmPass: string) {
    await this.page.locator('input[type="text"]').fill(name);
    await this.page.locator('input[type="email"]').fill(email);
    await this.page.locator('input[type="password"]').first().fill(pass);
    await this.page.locator('input[type="password"]').nth(1).fill(confirmPass);
  }

  async acceptTerms() {
    await this.page.locator('input[type="checkbox"]#terms').check();
  }

  async submit() {
    await this.page.locator('button[type="submit"]').click();
  }
}