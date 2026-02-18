import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
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
}