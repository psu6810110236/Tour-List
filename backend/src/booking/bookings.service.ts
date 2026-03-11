import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/entities/booking.entity';
import { Tour } from 'src/entities/tour.entity';
import { Repository } from 'typeorm';

const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,

    @InjectRepository(Tour)
    private tourRepository: Repository<Tour>,
  ) {}

  // ดึงข้อมูลการจองทั้งหมด
  async findAll() {
    return this.bookingRepository.find();
  }

  // อัปเดตสถานะ (อนุมัติ/ปฏิเสธ) พร้อมระบบตัดยอดที่นั่ง
  async updateStatus(id: string, status: string) {
    const newStatus = status.toUpperCase();

    if (!VALID_STATUSES.includes(newStatus)) {
      throw new BadRequestException(`สถานะ ${status} ไม่ถูกต้อง`);
    }

    // 🟢 แก้ไข: ใช้ as any เพื่อไม่ให้ TypeScript ขีดแดง ไม่ว่า Entity จะเป็น String หรือ Number
    const booking = await this.bookingRepository.findOne({ where: { id: id as any } });
    if (!booking) {
      throw new NotFoundException(`ไม่พบการจองรหัส ${id}`);
    }

    // 🟢 แก้ไข: ใช้ as any เช่นเดียวกัน
    const tour = await this.tourRepository.findOne({ where: { id: booking.tourId as any } });
    if (!tour) {
      throw new NotFoundException(`ไม่พบข้อมูลทัวร์ที่เกี่ยวข้องกับการจองนี้`);
    }

    const oldStatus = booking.status ? booking.status.toUpperCase() : '';

    // ตัดยอด
    if (newStatus === 'APPROVED' && oldStatus !== 'APPROVED') {
      if (tour.bookedSeats + booking.travelers > tour.maxCapacity) {
        throw new BadRequestException(
          `ไม่สามารถอนุมัติได้: ทัวร์นี้รับได้สูงสุด ${tour.maxCapacity} คน (เหลือที่ว่าง ${tour.maxCapacity - tour.bookedSeats} ที่)`
        );
      }
      tour.bookedSeats += booking.travelers;
      await this.tourRepository.save(tour);
    }
    // คืนยอด
    else if (oldStatus === 'APPROVED' && newStatus !== 'APPROVED') {
      tour.bookedSeats -= booking.travelers;
      if (tour.bookedSeats < 0) {
        tour.bookedSeats = 0;
      }
      await this.tourRepository.save(tour);
    }

    booking.status = newStatus as any;
    return this.bookingRepository.save(booking);
  }

  // ฟังก์ชันสร้างการจอง
  async createBooking(bookingData: Partial<Booking>) {
    const newBooking = this.bookingRepository.create(bookingData);
    return this.bookingRepository.save(newBooking);
  }

  // ฟังก์ชันลบการจอง
  async deleteBooking(id: string) {
    // 🟢 แก้ไข: ใช้ as any
    const booking = await this.bookingRepository.findOne({ where: { id: id as any } });
    if (!booking) {
      throw new NotFoundException(`ไม่พบการจองรหัส ${id}`);
    }
    
    // คืนยอดถ้าลบบิลที่เคย APPROVED ไปแล้ว
    if (booking.status && booking.status.toUpperCase() === 'APPROVED') {
      // 🟢 แก้ไข: ใช้ as any
      const tour = await this.tourRepository.findOne({ where: { id: booking.tourId as any } });
      if (tour) {
        tour.bookedSeats -= booking.travelers;
        if (tour.bookedSeats < 0) tour.bookedSeats = 0;
        await this.tourRepository.save(tour);
      }
    }

    return this.bookingRepository.remove(booking);
  }
}