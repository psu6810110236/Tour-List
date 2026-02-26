const crypto = require('crypto');
if (!global.crypto) {
  global.crypto = crypto;
}
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { AllExceptionsFilter } from './common/filters/http-exception.filter'; // ถูกคอมเมนต์ไว้ตามของเดิม
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 🟢 เปิดใช้งาน CORS แบบละเอียด (อนุญาตให้ Frontend เรียก API ได้)
  app.enableCors({
    origin: true, // อนุญาตทุกโดเมน (เหมาะสำหรับตอน Develop) หรือจะเจาะจงเป็น 'http://localhost:5173' ก็ได้
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // เปิดใช้งาน Validation สำหรับตรวจสอบข้อมูลที่ส่งเข้ามา
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // จัดการ Error format ให้เป็นมาตรฐานเดียวกันทั้งระบบ (ตอนนี้ปิดไว้อยู่)
  // app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(3000);
  console.log('🚀 Application is running on: http://localhost:3000');
}
bootstrap();