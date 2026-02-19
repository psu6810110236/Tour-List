import { Controller, Get, Post, Delete, Put, Body, Query, Param, NotFoundException } from '@nestjs/common';
import { ToursService } from './tours.service';

@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get('search')
  async search(
    @Query('provinceId') provinceId?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('sort') sort?: string,
  ) {
    return this.toursService.search({ provinceId, minPrice, maxPrice, sort });
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