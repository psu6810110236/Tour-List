import { Controller, Get, Patch, Param, Body, Post, Delete, UseGuards, Request } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
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
    const userId = req.user?.id || req.user?.userId;
    return this.bookingsService.findMyBookings(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createBooking(@Body() bookingData: any, @Request() req) {
    // 🟢 ดึง ID ให้ชัวร์ที่สุด ไม่ว่า Token จะแนบมาเป็นชื่อไหน
    const userId = req.user?.id || req.user?.userId || bookingData.userId;
    return this.bookingsService.createBooking(userId, bookingData);
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