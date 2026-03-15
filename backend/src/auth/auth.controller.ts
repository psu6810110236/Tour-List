import { Controller, Post, UseGuards, Request, Body, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  // Route สำหรับเริ่มล็อคอินด้วย Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Request() req) {}

  // Route รับ Callback จาก Google
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    const authResult = await this.authService.googleLogin(req);
    // Redirect กลับไปที่ Frontend พร้อมแนบ Token และข้อมูลผู้ใช้
    const frontendUrl = 'http://localhost:5173/login';
    res.redirect(`${frontendUrl}?token=${authResult.access_token}&user=${encodeURIComponent(JSON.stringify(authResult.user))}`);
  }
}