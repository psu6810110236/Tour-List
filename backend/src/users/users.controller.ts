import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

class UpdateProfileDto {
  fullName?: string;
  phone?: string;
}

// แก้ #5: เพิ่ม validation ให้ ChangePasswordDto
class ChangePasswordDto {
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่านเดิม' })
  @IsString()
  oldPassword: string;

  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่านใหม่' })
  @IsString()
  @MinLength(8, { message: 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัวอักษร' })
  @MaxLength(128, { message: 'รหัสผ่านยาวเกินไป' })
  newPassword: string;
}

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: any) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Patch('me')
  async updateMe(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }

  @Patch('me/password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    await this.usersService.changePassword(req.user.userId, dto.oldPassword, dto.newPassword);
    return { message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
  }
}