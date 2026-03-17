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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Request() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    const authResult = await this.authService.googleLogin(req);

    const frontendUrl = process.env.FRONTEND_URL ;

    // แก้ #6: ส่ง token ผ่าน httpOnly cookie แทน URL query string
    // เพื่อไม่ให้ token ติดอยู่ใน browser history / server logs
    res.cookie('auth_token', authResult.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only ใน production
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 วัน
    });

    res.redirect(
    `${frontendUrl}/login?token=${authResult.access_token}&user=${encodeURIComponent(JSON.stringify(authResult.user))}`
  );
}
}