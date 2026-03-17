import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Post,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(AuthGuard('jwt'))
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // เฉพาะ Admin เท่านั้นดูการจองทั้งหมดได้
  @UseGuards(RolesGuard)
  @Get()
  async findAll() {
    return this.bookingsService.findAll();
  }

  @Get('my')
  async getMyBookings(@Request() req) {
    const userId = req.user?.id || req.user?.userId;
    return this.bookingsService.findMyBookings(userId);
  }

  @Post()
  async createBooking(@Body() bookingData: any, @Request() req) {
    // ดึง userId จาก Token เท่านั้น ห้ามเชื่อ bookingData.userId จาก client
    const userId = req.user?.id || req.user?.userId;
    return this.bookingsService.createBooking(userId, bookingData);
  }

  // เฉพาะ Admin เท่านั้นเปลี่ยนสถานะการจองได้
  @UseGuards(RolesGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingsService.updateStatus(id, status, reason);
  }

  // เฉพาะ Admin เท่านั้นเปลี่ยนสถานะการชำระเงินได้
  @UseGuards(RolesGuard)
  @Patch(':id/payment-status')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingsService.updatePaymentStatus(id, paymentStatus, reason);
  }

  // เฉพาะ Admin เท่านั้นลบการจองได้
  @UseGuards(RolesGuard)
  @Delete(':id')
  async deleteBooking(@Param('id') id: string) {
    return this.bookingsService.deleteBooking(id);
  }
}