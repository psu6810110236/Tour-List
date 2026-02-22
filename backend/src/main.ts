const crypto = require('crypto');
if (!global.crypto) {
  global.crypto = crypto;
}
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // จัดการ Error format ให้เป็นมาตรฐานเดียวกันทั้งระบบ
  //app.useGlobalFilters(new AllExceptionsFilter());
  // 🟢 เพิ่มบรรทัดนี้เพื่ออนุญาตให้ Frontend เรียก API ได้
  app.enableCors({
    origin: true, // หรือใส่ 'http://localhost:5173'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();