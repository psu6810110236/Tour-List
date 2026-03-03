import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/entities/booking.entity';
import { Repository } from 'typeorm';

const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  // ดึงข้อมูลการจองทั้งหมด
  async findAll() {
    return this.bookingRepository.find();
  }

  // อัปเดตสถานะ (อนุมัติ/ปฏิเสธ)
  async updateStatus(id: string, status: string) {
    // ป้องกันการใส่ Status แปลกๆ เข้า Database
    if (!VALID_STATUSES.includes(status.toUpperCase())) {
      throw new BadRequestException(`สถานะ ${status} ไม่ถูกต้อง`);
    }

    const booking = await this.bookingRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException(`ไม่พบการจองรหัส ${id}`);
    }
    booking.status = status.toUpperCase();
    return this.bookingRepository.save(booking);
  }
// ฟังก์ชันสร้างการจอง
async createBooking(bookingData: Partial<Booking>) {
    const newBooking = this.bookingRepository.create(bookingData);
    return this.bookingRepository.save(newBooking);
  }
// ฟังก์ชันลบการจอง
  async deleteBooking(id: string) {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`ไม่พบการจองรหัส ${id}`);
    }
    return this.bookingRepository.remove(booking);
  }
}