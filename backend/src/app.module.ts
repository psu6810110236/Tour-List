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
import { MailerModule } from '@nestjs-modules/mailer';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Role } from './entities/role.entity';
import { Province } from './entities/province.entity';
import { Tour } from './entities/tour.entity';
import { User } from './entities/user.entity';
import { Review } from './entities/review.entity';
import { CartItem } from './cart/entities/cart-item.entity';
import { CartModule } from './cart/cart.module';
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ReviewModule } from './reviews/reviews.module';
import { ToursModule } from './tours/tours.module';
import { BookingsModule } from './booking/bookings.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
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
    // ✅ Single consolidated forFeature call
    TypeOrmModule.forFeature([Role, Province, Tour, User, Review, CartItem]),
    UsersModule,
    AuthModule,
    ReviewModule,
    ChatModule,
    ToursModule,
    BookingsModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}