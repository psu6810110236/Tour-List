import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env', 
    }),

    // 2. เชื่อมต่อ Database แบบ Async
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        
        // ✅ ใช้ autoLoadEntities อย่างเดียว ไม่ต้องใส่ entities: [User] ตรงๆ
        // วิธีนี้จะไปดึงไฟล์ที่ใช้ @Entity() มาให้อัตโนมัติ ลดปัญหา Error ตอน Build
        autoLoadEntities: true,
        
        // synchronize: true จะสร้าง/แก้ไข Table ใน DB ให้ตาม Entity อัตโนมัติ (ห้ามใช้บน Production)
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}