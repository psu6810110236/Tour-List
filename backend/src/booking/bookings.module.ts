import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from '../entities/booking.entity';
import { Tour } from '../entities/tour.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Tour])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService], // ✅ เพิ่มบรรทัดนี้เพื่อให้ Module อื่นเรียกใช้ Service ได้
})
export class BookingsModule {}