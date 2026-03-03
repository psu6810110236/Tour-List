import { Controller, Get, UseGuards, Request, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './auth/roles.guard';

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
  @Get('api/tours/:id')
  async getTourDetail(@Param('id') id: string) {
    return await this.appService.getTourById(+id);
  }
}