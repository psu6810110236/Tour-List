import { Controller, Get, Patch, Param, Body, Post, Delete, UseGuards, Request } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AuthGuard } from '@nestjs/passport';

//@UseGuards(AuthGuard('jwt'))
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  async findAll() {
    return this.bookingsService.findAll();
  }

  //@UseGuards(AuthGuard('jwt'))
  @Get('my')
  async getMyBookings(@Request() req) {
    const userId = req.user?.id || req.user?.userId;
    return this.bookingsService.findMyBookings(userId);
  }

  //@UseGuards(AuthGuard('jwt'))
  @Post()
  async createBooking(@Body() bookingData: any, @Request() req) {
    const userId = req.user?.id || req.user?.userId || bookingData.userId;
    return this.bookingsService.createBooking(userId, bookingData);
  }

  // 🟢 รับ reason เพิ่ม
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string, @Body('reason') reason?: string) {
    return this.bookingsService.updateStatus(id, status, reason);
  }

  // 🟢 รับ reason เพิ่ม
  @Patch(':id/payment-status')
  async updatePaymentStatus(@Param('id') id: string, @Body('paymentStatus') paymentStatus: string, @Body('reason') reason?: string) {
    return this.bookingsService.updatePaymentStatus(id, paymentStatus, reason);
  }

  @Delete(':id')
  async deleteBooking(@Param('id') id: string) {
    return this.bookingsService.deleteBooking(id);
  }
}