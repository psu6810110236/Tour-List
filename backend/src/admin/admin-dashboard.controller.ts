import { Controller, Get, Post, Patch, Param, UseGuards } from '@nestjs/common';
import { BookingsService } from '../booking/bookings.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';

// ✅ ป้องกันให้เฉพาะคนที่ Login และมี Role เป็น ADMIN เท่านั้นที่เข้าใช้ API นี้ได้
@UseGuards(AuthGuard('jwt'), RolesGuard) 
@Controller('admin')
export class AdminDashboardController {
  
  // ✅ Inject BookingsService เข้ามาใช้งาน
  constructor(private readonly bookingsService: BookingsService) {}
  
  @Get('dashboard/stats')
  async getDashboardStats() {
    // ดึงข้อมูลการจองทั้งหมดจาก Database
    const bookings = await this.bookingsService.findAll();
    
    const stats = {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
      approvedBookings: bookings.filter(b => b.status === 'APPROVED').length,
      rejectedBookings: bookings.filter(b => b.status === 'REJECTED' || b.status === 'CANCELLED').length,
      totalRevenue: bookings
        .filter(b => b.status === 'APPROVED')
        .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0),
    };

    return stats;
  }

  @Get('bookings')
  async getAllBookings() {
    // ดึงรายการทั้งหมดพร้อม relations (ผู้ใช้, ทัวร์)
    return this.bookingsService.findAll();
  }

  @Patch('bookings/:id/approve')
  async approveBooking(@Param('id') id: string) {
    return this.bookingsService.updateStatus(id, 'APPROVED');
  }

  @Post('bookings/:id/reject')
  async rejectBooking(@Param('id') id: string) {
    return this.bookingsService.updateStatus(id, 'REJECTED');
  }
}