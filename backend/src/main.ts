import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ✅ Global prefix: ทุก route จะเริ่มด้วย /api
  // เช่น /tours/provinces → /api/tours/provinces
  // ตรงกับที่ VITE_API_URL=https://wd04.pupasoft.com/api
  app.setGlobalPrefix('api');

  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(3000);
  console.log('🚀 Application is running on: https://wd04.pupasoft.com:3000/api');
}
bootstrap();
