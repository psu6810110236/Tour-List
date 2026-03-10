import { Module } from '@nestjs/common';
import { AdminDashboardController } from './admin-dashboard.controller';
import { BookingsModule } from '../booking/bookings.module'; // ✅ Import BookingsModule

@Module({
  imports: [BookingsModule], // ✅ เพิ่มเข้าไปใน imports
  controllers: [AdminDashboardController],
})
export class AdminModule {}