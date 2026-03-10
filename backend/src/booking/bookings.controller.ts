import { Controller, Get, Patch, Param, Body, Post, Delete, UseGuards, Request } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  async findAll() {
    return this.bookingsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  async getMyBookings(@Request() req) {
    // ใช้ req.user.userId ให้ตรงกับ Strategy ของคุณ
    return this.bookingsService.findMyBookings(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createBooking(@Body() bookingData: any, @Request() req) {
    // 🟢 ส่ง userId แยกออกมาเป็น Parameter แรกตาม Service ใหม่
    return this.bookingsService.createBooking(req.user.userId, bookingData);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.bookingsService.updateStatus(id, status);
  }

  @Delete(':id')
  async deleteBooking(@Param('id') id: string) {
    return this.bookingsService.deleteBooking(id);
  }
}