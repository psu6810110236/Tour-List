import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local')) // เรียกใช้ LocalStrategy
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // ตัวอย่าง API ที่ต้อง Login ก่อนถึงจะเข้าได้
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}