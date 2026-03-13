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
import { ThrottlerModule } from '@nestjs/throttler';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Role } from './entities/role.entity';
import { Province } from './entities/province.entity';
import { Tour } from './entities/tour.entity';
import { User } from './entities/user.entity'; 
import { Review } from './entities/review.entity';

// 🌟 1. นำเข้า CartItem และ CartModule
import { CartItem } from './cart/entities/cart-item.entity';
import { CartModule } from './cart/cart.module';

import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ToursModule } from './tours/tours.module';
import { BookingsModule } from './booking/bookings.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
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
        autoLoadEntities: true,
        synchronize: true, 
      }),
    }),
    // ตั้งค่าป้องกันการยิง Request รัวๆ จำกัด 10 ครั้งใน 60 วินาที
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    // ตั้งค่าระบบส่งอีเมล
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST') || 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASS'),
          },
        },
        defaults: {
          from: '"RoamHub Tour" <noreply@roamhub.com>',
        },
      }),
    }),
    TypeOrmModule.forFeature([Role, Province, Tour, User, Review]), 
    // 🌟 2. เพิ่ม CartItem ลงใน Array ของ forFeature
    TypeOrmModule.forFeature([Role, Province, Tour, User, Review, CartItem]), 
    UsersModule,
    AuthModule,
    ReviewsModule,
    ChatModule,
    ToursModule,
    BookingsModule,
    // 🌟 3. เพิ่ม CartModule ลงใน imports ของ AppModule
    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}