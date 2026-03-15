import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity'; // ✅ 1. Import Role Entity
import { UsersController } from './ีusers.controller';

@Module({
  // ✅ 2. เพิ่ม Role เข้าไปใน list นี้
  imports: [TypeOrmModule.forFeature([User, Role])],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule { }