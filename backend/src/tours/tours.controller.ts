import { Controller, Get, Post, Delete, Patch, Put, Body, Query, Param, NotFoundException } from '@nestjs/common';
import { ToursService } from './tours.service'; // ตรวจสอบ path ให้ตรงกับไฟล์ของคุณ

export class CreateTourDto {
  name: string;
  price: number;
  // เพิ่มฟิลด์อื่นๆ ตาม Entity ของคุณ
}

export class CreateProvinceDto {
  name: string;
  // เพิ่มฟิลด์อื่นๆ ตาม Entity ของคุณ
}


@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get('search')
  async search(
    @Query('provinceId') provinceId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('startDate') startDate?: string, // 🟢 1. รับค่า startDate จาก Query URL
    @Query('sort') sort?: string,
    @Query('tripDays') tripDays?: string,
  ) {
    // 🟢 2. ส่งค่า startDate เข้าไปใน Service
    const parsedMin = minPrice ? Number(minPrice) : undefined;
    const parsedMax = maxPrice ? Number(maxPrice) : undefined;
    return this.toursService.search({ 
      provinceId, 
      minPrice: parsedMin, 
      maxPrice: parsedMax, 
      startDate, 
      sort,
      tripDays
    });
  }

  @Get('provinces')
  async getProvinces() {
    return this.toursService.findAllProvinces();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tour = await this.toursService.findOne(id);
    if (!tour) throw new NotFoundException('Tour not found');
    return tour;
  }

  @Post('provinces')
  async createProvince(@Body() provinceData: any) {
    return this.toursService.createProvince(provinceData);
  }

  // 🟢 API สำหรับอัปเดตจังหวัด
  @Patch('provinces/:id')
  async updateProvince(@Param('id') id: string, @Body() updateData: any) {
    return this.toursService.updateProvince(id, updateData); // เปลี่ยนชื่อ Service ตามที่เพื่อนตั้ง
  }

  @Post()
  async createTour(@Body() tourData: any) {
    return this.toursService.createTour(tourData);
  }

  // 🟢 2. เพิ่มช่องทางรับข้อมูลแบบ PUT (ใช้สำหรับแก้ไข)
  @Put(':id')
  async updateTour(@Param('id') id: string, @Body() tourData: any) {
    return this.toursService.updateTour(id, tourData);
  }

  // 🔴 เพิ่มช่องทางรับข้อมูลแบบ DELETE (ใช้สำหรับลบ)
  @Delete(':id')
  async deleteTour(@Param('id') id: string) {
    return this.toursService.deleteTour(id);
  }
}