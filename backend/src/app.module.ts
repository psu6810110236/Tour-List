if (!global.crypto) {
  Object.defineProperty(global, 'crypto', {
    value: require('crypto').webcrypto,
    writable: true,
    configurable: true,
  });
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Role } from './entities/role.entity';
import { Province } from './entities/province.entity';
import { Tour } from './entities/tour.entity';
import { User } from './entities/user.entity'; 
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ToursModule } from './tours/tours.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        // ✅ ตรวจสอบว่าใน .env ค่า DB_HOST=postgres (ถ้าใช้ Docker)
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // พัฒนาอยู่ให้เปิดไว้เพื่อสร้าง Table อัตโนมัติ
      }),
    }),
    TypeOrmModule.forFeature([Role, Province, Tour, User]), 
    UsersModule,
    AuthModule,
    ChatModule,
    ToursModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}