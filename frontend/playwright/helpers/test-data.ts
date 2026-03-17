// playwright/helpers/test-data.ts
// ──────────────────────────────────────────────────────────────────
// แก้ค่าพวกนี้ให้ตรงกับ seed data ในระบบจริง
// ──────────────────────────────────────────────────────────────────

export const ADMIN = {
  email: 'admin@yourdomain.com',
  password: 'admin4123_A',
};

export const USER = {
  email: 'user@yourdomain.com',
  password: 'user1423_A',
};

// สำหรับ register test ใช้ email แบบ random กันซ้ำ
export const newUserEmail = () =>
  `testuser_${Date.now()}@test.com`;

export const API = 'http://localhost:3000';
export const BASE = 'http://localhost:5173';