import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity'; // Import Entity ของคุณ

@Module({
  imports: [TypeOrmModule.forFeature([User])], // เชื่อมต่อ Entity User
  providers: [UsersService],
  exports: [UsersService], // Export เพื่อให้ AuthModule เรียกใช้ได้ในอนาคต
})
export class UsersModule {}