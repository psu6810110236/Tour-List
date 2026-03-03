import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { RegisterPage } from '../page-objects/RegisterPage';
import { ApiMocks } from '../utils/api-mocks';

test.describe('Authentication Flow', () => {
  let loginPage: LoginPage;
  let registerPage: RegisterPage;
  let apiMocks: ApiMocks;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
    apiMocks = new ApiMocks(page);
  });

  test('ควรเปลี่ยนภาษาในหน้า Login ได้ถูกต้อง', async ({ page }) => {
    await loginPage.goto();
    
    // Test switch to EN
    await loginPage.switchLanguageTo('EN');
    await expect(page.getByText('Sign in to continue')).toBeVisible();

    // Test switch back to TH
    await loginPage.switchLanguageTo('TH');
    await expect(page.getByText('เข้าสู่ระบบเพื่อดำเนินการต่อ')).toBeVisible();
  });

  test('ควรสมัครสมาชิกสำเร็จและพาไปหน้า Login', async ({ page }) => {
    await apiMocks.mockSuccessfulRegister();
    
    await registerPage.goto();
    await registerPage.fillForm('John Doe', 'john@test.com', 'Pass123!', 'Pass123!');
    await registerPage.acceptTerms();
    await registerPage.submit();

    await expect(page).toHaveURL(/.*\/login/);
  });

  test('ควรเข้าสู่ระบบสำเร็จและพาไปหน้า Home', async ({ page }) => {
    await apiMocks.mockSuccessfulLogin();
    await apiMocks.mockProvincesData();
    await apiMocks.mockEmptyTours();

    await loginPage.goto();
    await loginPage.fillCredentials('test@roamhub.com', 'Pass123!');
    await loginPage.submit();

    await expect(page).toHaveURL(/.*\/$/);
  });
});