import { Controller, Get, Post, Body, Res, HttpStatus, UseGuards, Request, Param, Query, BadRequestException } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './auth/roles.guard';
// ✅ Import exec เพิ่มเข้ามาเพื่อใช้สั่งรันคำสั่ง Terminal


import { exec } from 'child_process'; 

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // ==========================================
  // 🔴 API สำหรับระบบ Authentication / Admin
  // ==========================================
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('admin-only')
  getAdminData(@Request() req) {
    return { message: 'Hello Admin!', user: req.user };
  }

  // ==========================================
  // 🟢 API สำหรับหน้าเว็บ Frontend (ดึงข้อมูล)
  // ==========================================

  // 1. ดึงข้อมูลจังหวัดทั้งหมด (ใช้ในหน้า AllProvincesPage)
  @Get('provinces')
  async getProvinces() {
    return await this.appService.getAllProvinces();
  }

  // 2. ดึงข้อมูลทัวร์ทั้งหมด (ใช้ในหน้า HomePage ส่วนทัวร์แนะนำ)
  @Get('tours')
  async getTours() {
    return await this.appService.getAllTours();
  }

  // 3. ระบบค้นหาและตัวกรอง (ใช้ในหน้า ProvincePage)
  @Get('api/tours/search')
  async searchTours(
    @Query('provinceId') provinceId?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minPrice') minPrice?: string,
  ) {
    return await this.appService.searchTours({
      provinceId,
      maxPrice: maxPrice ? +maxPrice : undefined,
      minPrice: minPrice ? +minPrice : undefined,
    });
  }

  // 4. ดึงรายละเอียดทัวร์ตาม ID (ใช้ในหน้า TourDetailPage)
  @Get('tours/:id')
async getTourDetail(@Param('id') id: string) {
  const tourId = parseInt(id, 10);
  if (isNaN(tourId)) {
    throw new BadRequestException('Invalid Tour ID');
  }
  return this.appService.getTourById(tourId);
}

  // ==========================================
  // 🛠 API สำหรับรีเซ็ตฐานข้อมูล (Mock / Clean Data)
  // ==========================================
  @Post('admin/reset-db')
  resetDatabase(@Body('mode') mode: string, @Res() res) {
    // เช็คว่าส่ง mode มาถูกต้องไหม
    if (mode !== 'clean' && mode !== 'mock') {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'โหมดไม่ถูกต้อง กรุณาส่ง clean หรือ mock' });
    }

    // สั่งรันคำสั่ง npm ใน Terminal ผ่าน Node.js
    exec(`npm run db:${mode}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`เกิดข้อผิดพลาด: ${error.message}`);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'รีเซ็ตข้อมูลไม่สำเร็จ' });
      }
      return res.status(HttpStatus.OK).json({ 
        message: `รีเซ็ตฐานข้อมูลโหมด ${mode} สำเร็จ!`,
        details: stdout 
      });
    });
  }
}