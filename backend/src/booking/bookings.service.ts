import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/entities/booking.entity';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto'; // 🟢 Import ระบบสร้าง UUID ของ Node.js เข้ามา

const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async findAll() {
    return this.bookingRepository.find({
      relations: ['tour', 'user'],
      order: { bookingDate: 'DESC' }
    });
  }

  async findMyBookings(userId: string) {
    return this.bookingRepository.find({
      where: { user: { id: userId } },
      relations: ['tour', 'tour.province'], 
      order: { bookingDate: 'DESC' },
    });
  }

  async createBooking(userId: string, bookingData: any) {
    // 🟢 สร้างรหัสเป็น UUID แท้ๆ ไปเลย เพื่อแก้ปัญหา Database ไม่ยอมรับรหัส BKG
    const bookingId = randomUUID();

    let numericTourId = Number(String(bookingData.tourId).replace(/\D/g, ''));
    if (!numericTourId || isNaN(numericTourId)) numericTourId = 1;

    const newBooking = this.bookingRepository.create({
      ...bookingData,
      id: bookingId, // 🟢 ใช้รหัส UUID ที่เพิ่งสร้าง
      status: 'PENDING', 
      paymentStatus: bookingData.paymentSlip ? 'VERIFYING' : 'PENDING',
      user: { id: userId }, 
      tour: { id: numericTourId }, 
      bookingDate: new Date(),
    });
    
    return this.bookingRepository.save(newBooking);
  }

  async updateStatus(id: string, status: string) {
    const upperStatus = status.toUpperCase();
    if (!VALID_STATUSES.includes(upperStatus)) {
      throw new BadRequestException(`สถานะ ${status} ไม่ถูกต้อง`);
    }

    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) throw new NotFoundException(`ไม่พบการจองรหัส ${id}`);
    
    booking.status = upperStatus;
    return this.bookingRepository.save(booking);
  }

  async deleteBooking(id: string) {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) throw new NotFoundException(`ไม่พบการจองรหัส ${id}`);
    return this.bookingRepository.remove(booking);
  }
}