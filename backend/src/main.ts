import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 🟢 เพิ่มบรรทัดนี้เพื่ออนุญาตให้ Frontend เรียก API ได้
  app.enableCors({
    origin: true, // หรือใส่ 'http://localhost:5173'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();