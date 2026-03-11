import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/entities/booking.entity';
import { Tour } from 'src/entities/tour.entity';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
const VALID_PAYMENT_STATUSES = ['PENDING', 'VERIFYING', 'COMPLETED', 'FAILED']; 

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,

    @InjectRepository(Tour)
    private tourRepository: Repository<Tour>,
  ) {}

  async findAll() {
    return this.bookingRepository.find({
      relations: ['tour', 'user'],
      order: { bookingDate: 'DESC' }
    });
  }

  // 🟢 ค้นหาการจองของ User คนนั้นๆ (ของเพื่อน)
  async findMyBookings(userId: string) {
    return this.bookingRepository.find({
      where: { user: { id: userId } },
      relations: ['tour', 'tour.province'], 
      order: { bookingDate: 'DESC' },
    });
  }

  // 🟢 รวมร่างฟังก์ชันสร้างการจอง (ใช้แบบของเพื่อนที่มี UUID และ userId)
  async createBooking(userId: string, bookingData: any) {
    const bookingId = randomUUID();

    // ดึงตัวเลขออกมาจาก tourId
    let numericTourId = Number(String(bookingData.tourId).replace(/\D/g, ''));
    if (!numericTourId || isNaN(numericTourId)) numericTourId = 1;

    const newBooking = this.bookingRepository.create({
      ...bookingData,
      id: bookingId,
      status: 'PENDING', 
      paymentStatus: bookingData.paymentSlip ? 'VERIFYING' : 'PENDING',
      user: { id: userId }, 
      tour: { id: numericTourId }, 
      bookingDate: new Date(),
    });
    
    return this.bookingRepository.save(newBooking);
  }

  // 🟢 รวมร่างฟังก์ชันอัปเดตสถานะ (ได้ทั้งระบบ "ตัดยอด" ของคุณ และ "เซฟ reason" ของเพื่อน)
  async updateStatus(id: string, status: string, reason?: string) {
    const newStatus = status.toUpperCase();

    if (!VALID_STATUSES.includes(newStatus)) {
      throw new BadRequestException(`สถานะ ${status} ไม่ถูกต้อง`);
    }

    const booking = await this.bookingRepository.findOne({ where: { id: id as any } });
    if (!booking) {
      throw new NotFoundException(`ไม่พบการจองรหัส ${id}`);
    }

    const tour = await this.tourRepository.findOne({ where: { id: booking.tourId as any } });
    if (!tour) {
      throw new NotFoundException(`ไม่พบข้อมูลทัวร์ที่เกี่ยวข้องกับการจองนี้`);
    }

    const oldStatus = booking.status ? booking.status.toUpperCase() : '';

    // ระบบตัดยอด / คืนยอด
    if (newStatus === 'APPROVED' && oldStatus !== 'APPROVED') {
      if (tour.bookedSeats + booking.travelers > tour.maxCapacity) {
        throw new BadRequestException(
          `ไม่สามารถอนุมัติได้: ทัวร์นี้รับได้สูงสุด ${tour.maxCapacity} คน (เหลือที่ว่าง ${tour.maxCapacity - tour.bookedSeats} ที่)`
        );
      }
      tour.bookedSeats += booking.travelers;
      await this.tourRepository.save(tour);
    } else if (oldStatus === 'APPROVED' && newStatus !== 'APPROVED') {
      tour.bookedSeats -= booking.travelers;
      if (tour.bookedSeats < 0) {
        tour.bookedSeats = 0;
      }
      await this.tourRepository.save(tour);
    }

    // เซฟสถานะ และเหตุผล (ถ้ามี)
    booking.status = newStatus as any;
    if (reason) (booking as any).rejectReason = reason;

    return this.bookingRepository.save(booking);
  }

  // 🟢 อัปเดตสถานะการชำระเงิน (ของเพื่อน)
  async updatePaymentStatus(id: string, paymentStatus: string, reason?: string) {
    const upperStatus = paymentStatus.toUpperCase();
    if (!VALID_PAYMENT_STATUSES.includes(upperStatus)) {
      throw new BadRequestException(`สถานะชำระเงิน ${paymentStatus} ไม่ถูกต้อง`);
    }

    const booking = await this.bookingRepository.findOne({ where: { id: id as any } });
    if (!booking) throw new NotFoundException(`ไม่พบการจองรหัส ${id}`);
    
    booking.paymentStatus = upperStatus as any;
    if (reason) (booking as any).rejectReason = reason;

    return this.bookingRepository.save(booking);
  }

  // 🟢 รวมร่างฟังก์ชันลบการจอง (ใช้แบบของคุณที่มีระบบ "คืนยอดก่อนลบ")
  async deleteBooking(id: string) {
    const booking = await this.bookingRepository.findOne({ where: { id: id as any } });
    if (!booking) {
      throw new NotFoundException(`ไม่พบการจองรหัส ${id}`);
    }
    
    // คืนยอดถ้าลบบิลที่เคย APPROVED ไปแล้ว
    if (booking.status && booking.status.toUpperCase() === 'APPROVED') {
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