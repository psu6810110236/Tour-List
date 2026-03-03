import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth & AdminGuard System (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // 1. ลอง Login เป็น Admin เพื่อเอา Token
  it('/auth/login (Admin) - should return token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' }) // User ที่เรา Seed ไว้
      .expect(201);

    adminToken = response.body.access_token; // เก็บ Token ไว้ใช้
    expect(adminToken).toBeDefined();
  });

  // 2. ลอง Login เป็น User ธรรมดา เพื่อเอา Token
  it('/auth/login (User) - should return token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@test.com', password: 'password123' })
      .expect(201);

    userToken = response.body.access_token;
    expect(userToken).toBeDefined();
  });

  // 3. เอา Token Admin ไปเข้าหน้า Admin (ต้องเข้าได้)
  it('/admin-only (GET) - Admin should pass', () => {
    return request(app.getHttpServer())
      .get('/admin-only')
      .set('Authorization', `Bearer ${adminToken}`) // แนบ Token
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toEqual('Hello Admin!');
      });
  });

  // 4. เอา Token User ธรรมดา ไปเข้าหน้า Admin (ต้องโดนถีบออกมา 403)
  it('/admin-only (GET) - Normal User should be Forbidden', () => {
    return request(app.getHttpServer())
      .get('/admin-only')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403); // คาดหวังว่าต้อง Error 403 Forbidden
  });

  afterAll(async () => {
    await app.close();
  });
});