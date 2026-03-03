import { Controller, Get, Patch, Param, Body, Post, Delete } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  async findAll() {
    return this.bookingsService.findAll();
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string, 
    @Body('status') status: string
  ) {
    return this.bookingsService.updateStatus(id, status);
  }

  @Post()
async createBooking(@Body() bookingData: any) {
  return this.bookingsService.createBooking(bookingData);
}

  @Delete(':id')
  async deleteBooking(@Param('id') id: string) {
    return this.bookingsService.deleteBooking(id);
  }
}