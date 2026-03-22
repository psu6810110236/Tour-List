import { test, expect } from '@playwright/test';

test('TC1: Verify successful booking a tour', async ({ page }) => {

  await page.addInitScript(() => {
    localStorage.setItem('roamhub_tutorial_seen_v1', 'true');
  });

  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');

  await page.getByPlaceholder('อีเมล').fill('punyawee.chiew@gmail.com');
  await page.getByPlaceholder('รหัสผ่าน').fill('password123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('http://localhost:5173/');

  await page.goto('http://localhost:5173/tour/1');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /จองเลย/i }).click();

  await page.waitForURL(/\/booking\//);
  await page.waitForLoadState('networkidle');

  // 1. คลิกเลือกวันที่
  const dateButton = page.getByRole('button').filter({ hasText: /^(?:[1-9]|[12][0-9]|3[01])$/ }).first();
  await dateButton.click();

  // 2. คลิกปุ่มยืนยันใน Popup
  const confirmDateButton = page.getByRole('button', { name: 'ตกลงเลือกวันนี้' });
  await confirmDateButton.click();

  // 3. สั่งให้บอทเลื่อนหน้าจอลงมา
  await page.mouse.wheel(0, 500); 
  await page.waitForTimeout(1000);

  // 4. คลิกปุ่ม +
  const plusButton = page.locator('button').filter({ hasText: '+' }).first();
  if (await plusButton.isVisible()) {
    await plusButton.click({ force: true });
    await plusButton.click({ force: true });
  }

  // 5. กดปุ่มดำเนินการชำระเงิน
  const checkoutBtn = page.getByRole('button', { name: 'ดำเนินการชำระเงิน' });
  await expect(checkoutBtn).toBeVisible({ timeout: 5000 });
  await checkoutBtn.click();

  // 🌟 ส่วนที่เพิ่มเข้าไปใหม่: จัดการหน้า Step 3 "ข้อมูลติดต่อ" 🌟
  
  // รอให้ส่วนของข้อมูลติดต่อปรากฏขึ้นมา
  await expect(page.getByText('ข้อมูลติดต่อ')).toBeVisible({ timeout: 10000 });

  // กรอกข้อมูลผู้ติดต่อ (ใช้ placeholder เพื่อความแม่นยำ)
  await page.getByPlaceholder(/ชื่อ-นามสกุล|ชื่อ/i).fill('Punyavee Test');
  await page.getByPlaceholder(/อีเมล/i).fill('punyawee.chiew@gmail.com');
  await page.getByPlaceholder(/เบอร์โทร|โทรศัพท์/i).fill('0812345678');

  // กดปุ่มยืนยันการจอง/ชำระเงิน ขั้นตอนสุดท้าย
  // ปรับชื่อปุ่มให้ตรงกับในหน้าเว็บของคุณ (เช่น "ยืนยันการจอง" หรือ "ดำเนินการต่อ")
  const finalBtn = page.getByRole('button', { name: /ยืนยัน|ดำเนินการต่อ|จอง/i }).last();
  await finalBtn.click();

 // ... โค้ดส่วนก่อนหน้าที่กรอกข้อมูลและกดปุ่ม finalBtn ไปแล้ว ...



  // 🌟 ขั้นตอนที่ 6: ตรวจสอบผลลัพธ์ (แก้ไขเพื่อหลบ Strict Mode)
// ... โค้ดส่วนก่อนหน้า ...
// ... โค้ดส่วนก่อนหน้า ...

  // 1. รอให้ URL เปลี่ยนไปหน้า my-bookings
  await page.waitForURL(/.*my-bookings/);

  // 2. เช็คหัวข้อ "การจองของฉัน" (ระบุว่าเป็น heading เพื่อความแม่นยำ)
  await expect(page.getByRole('heading', { name: 'การจองของฉัน' })).toBeVisible({ timeout: 10000 });

  // 🌟 3. เช็คชื่อทัวร์ โดยใช้ .first() เพื่อเลือกตัวแรกที่เจอในลิสต์
  // วิธีนี้จะแก้ปัญหา Strict Mode Violation ที่เจอหลายอันครับ
  await expect(page.getByText('ทัวร์ดอยอินทนนท์ 1 วัน').first()).toBeVisible();

  // 4. เช็คสถานะ "รอดำเนินการ" ตัวแรกที่เจอ
  await expect(page.getByText(/รอดำเนินการ|Pending/i).first()).toBeVisible();

});