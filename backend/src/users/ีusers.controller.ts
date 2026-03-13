import { Controller, Patch, Body, Req, UseGuards } from '@nestjs/common';
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

  // PATCH /users/me — อัปเดตโปรไฟล์
  @Patch('me')
  async updateMe(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  // PATCH /users/me/password — เปลี่ยนรหัสผ่าน
  @Patch('me/password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    await this.usersService.changePassword(req.user.id, dto.oldPassword, dto.newPassword);
    return { message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
  }
}