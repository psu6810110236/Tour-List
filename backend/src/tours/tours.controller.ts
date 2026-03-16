import { Controller, Get, Post, Delete, Patch, Put, Body, Query, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { ToursService } from './tours.service';

export class CreateTourDto {
  name: string;
  price: number;
}

export class CreateProvinceDto {
  name: string;
}

@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  // ── Public endpoints (ไม่ต้อง login) ──────────────────────────────────────
  @Get('search')
  async search(
    @Query('provinceId') provinceId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('startDate') startDate?: string,
    @Query('sort') sort?: string,
    @Query('tripDays') tripDays?: string,
  ) {
    const parsedMin = minPrice ? Number(minPrice) : undefined;
    const parsedMax = maxPrice ? Number(maxPrice) : undefined;
    return this.toursService.search({ provinceId, minPrice: parsedMin, maxPrice: parsedMax, startDate, sort, tripDays });
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

  // ── Admin-only endpoints (ต้อง login + role ADMIN) ─────────────────────────
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('provinces')
  async createProvince(@Body() provinceData: any) {
    return this.toursService.createProvince(provinceData);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch('provinces/:id')
  async updateProvince(@Param('id') id: string, @Body() updateData: any) {
    return this.toursService.updateProvince(id, updateData);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  async createTour(@Body() tourData: any) {
    return this.toursService.createTour(tourData);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put(':id')
  async updateTour(@Param('id') id: string, @Body() tourData: any) {
    return this.toursService.updateTour(id, tourData);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  async deleteTour(@Param('id') id: string) {
    return this.toursService.deleteTour(id);
  }
}