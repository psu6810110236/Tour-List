import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';

// Mock data for testing without database
const mockBookings = [
  {
    id: 'BK-TEST-001',
    bookingDate: new Date(),
    travelDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    travelers: 2,
    totalPrice: 5000,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    paymentSlip: '/uploads/test-slip.jpg',
    tourNameSnapshot: 'Bangkok City Tour',
    tourNameSnapshot_th: 'ทัวร์กรุงเทพมหา',
    userId: 'user-001',
    tourId: 'tour-001'
  }
];

@Controller('admin')
export class AdminDashboardController {
  
  @Get('dashboard/stats')
  async getDashboardStats() {
    const stats = {
      totalBookings: mockBookings.length,
      pendingBookings: mockBookings.filter(b => b.status === 'PENDING').length,
      approvedBookings: mockBookings.filter(b => b.status === 'APPROVED').length,
      rejectedBookings: mockBookings.filter(b => b.status === 'REJECTED').length,
      totalRevenue: mockBookings
        .filter(b => b.status === 'APPROVED')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0),
    };

    return stats;
  }

  @Get('bookings')
  async getAllBookings() {
    return mockBookings;
  }

  @Patch('bookings/:id/approve')
  async approveBooking(@Param('id') id: string) {
    const booking = mockBookings.find(b => b.id === id);
    if (booking) {
      booking.status = 'APPROVED';
    }
    return { id, status: 'APPROVED' };
  }

  @Post('bookings/:id/reject')
  async rejectBooking(@Param('id') id: string) {
    const booking = mockBookings.find(b => b.id === id);
    if (booking) {
      booking.status = 'REJECTED';
    }
    return { id, status: 'REJECTED' };
  }
}
