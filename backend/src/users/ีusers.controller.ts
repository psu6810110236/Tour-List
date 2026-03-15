import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

class UpdateProfileDto {
  fullName?: string;
  phone?: string;
}

class ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/me — ดึงโปรไฟล์ (รวม phone) ใช้สำหรับ autofill ในหน้า Booking
  @Get('me')
  async getMe(@Req() req: any) {
    return this.usersService.getProfile(req.user.userId); // JWT strategy คืน userId
  }

  // PATCH /users/me — อัปเดต fullName + phone
  @Patch('me')
  async updateMe(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }

  // PATCH /users/me/password — เปลี่ยนรหัสผ่าน
  @Patch('me/password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    await this.usersService.changePassword(req.user.userId, dto.oldPassword, dto.newPassword);
    return { message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
  }
}