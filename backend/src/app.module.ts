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
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    // เพิ่ม User เข้าไปในลิสต์นี้เพื่อให้ TypeORM รู้จักความสัมพันธ์
    TypeOrmModule.forFeature([Role, Province, Tour, User]), 
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}