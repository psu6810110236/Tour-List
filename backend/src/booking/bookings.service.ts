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

  async findAll() {
    return this.bookingRepository.find({
      relations: ['tour', 'user'],
      order: { bookingDate: 'DESC' }
    });
  }

  // 🟢 ดึงข้อมูลของตัวเอง + ดึงข้อมูล Tour มาด้วย
  async findMyBookings(userId: string) {
    return this.bookingRepository.find({
      where: { user: { id: userId } }, // ใช้ relation user.id
      relations: ['tour', 'tour.province'], 
      order: { bookingDate: 'DESC' },
    });
  }

  async createBooking(userId: string, bookingData: Partial<Booking>) {
    const bookingId = `BKG-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;

    const newBooking = this.bookingRepository.create({
      ...bookingData,
      id: bookingId,
      status: 'PENDING', 
      // 🟢 ตรวจสอบว่าถ้ามีสลิปแนบมา ให้เปลี่ยนสถานะการจ่ายเงินเป็น "รอตรวจสอบ"
      paymentStatus: bookingData.paymentSlip ? 'VERIFYING' : 'PENDING',
      user: { id: userId }, 
      tour: { id: bookingData.tourId }, // 🟢 สำคัญ: ต้องผูก relation ของ Tour ให้ครบ
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