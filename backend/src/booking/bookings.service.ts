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

  async findMyBookings(userId: string) {
    return this.bookingRepository.find({
      where: { user: { id: userId } },
      relations: ['tour', 'tour.province'], 
      order: { bookingDate: 'DESC' },
    });
  }

  // 🟢 1. ตอนสร้างการจอง (บังคับให้ travelers เป็นตัวเลข)
  async createBooking(userId: string, bookingData: any) {
    const bookingId = randomUUID();

    // 1. ตรวจสอบว่ามี tourId และเป็นตัวเลขจริง (ห้าม Force เป็น 1)
    const numericTourId = Number(bookingData.tourId);
    if (!numericTourId || isNaN(numericTourId)) {
      throw new BadRequestException('รหัสทัวร์ไม่ถูกต้อง');
    }

    // 2. ตรวจสอบว่าทัวร์มีอยู่จริง
    const tour = await this.tourRepository.findOne({ where: { id: numericTourId as any } });
    if (!tour) throw new NotFoundException('ไม่พบทัวร์ที่ระบุ');

    // 3. ตรวจสอบจำนวนผู้เดินทาง (ห้ามเป็น 0 หรือติดลบ)
    const travelers = Number(bookingData.travelers);
    if (!travelers || travelers <= 0) {
      throw new BadRequestException('จำนวนผู้เดินทางต้องมากกว่า 0');
    }

    const newBooking = this.bookingRepository.create({
      ...bookingData,
      travelers: travelers,
      id: bookingId,
      status: 'PENDING', 
      paymentStatus: bookingData.paymentSlip ? 'VERIFYING' : 'PENDING',
      user: { id: userId }, 
      tour: { id: numericTourId }, 
      bookingDate: new Date(),
    });
    
    return this.bookingRepository.save(newBooking);
  }

  // 🟢 2. ตอนอนุมัติสถานะ (บังคับแปลค่าให้เป็นตัวเลขก่อนบวก/ลบ)
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

    // 🌟 แปลงค่าเป็น Number ป้องกันบั๊ก String Concatenation
    const travelersCount = Number(booking.travelers) || 1;
    const maxCap = Number(tour.maxCapacity) || 10;

    // นับที่นั่งเฉพาะวันเดียวกัน (travelDate) ไม่รวมทุกวัน
    const sameDay = booking.travelDate
      ? new Date(booking.travelDate).toISOString().slice(0, 10)
      : null;

    const bookedSameDay = sameDay
      ? await this.bookingRepository
          .createQueryBuilder('b')
          .select('SUM(b.travelers)', 'total')
          .where('b.tourId = :tourId', { tourId: booking.tourId })
          .andWhere('b.status = :status', { status: 'APPROVED' })
          .andWhere('CAST(b.travelDate AS DATE) = :date', { date: sameDay })
          .andWhere('b.id != :id', { id: booking.id })
          .getRawOne()
          .then((r) => Number(r?.total) || 0)
      : Number(tour.bookedSeats) || 0;

    const currentBooked = bookedSameDay;

    // ระบบตัดยอด / คืนยอด
    if (newStatus === 'APPROVED' && oldStatus !== 'APPROVED') {
      if (currentBooked + travelersCount > maxCap) {
        throw new BadRequestException(
          `ไม่สามารถอนุมัติได้: ทัวร์นี้รับได้สูงสุด ${maxCap} คน (เหลือที่ว่าง ${maxCap - currentBooked} ที่)`
        );
      }
      tour.bookedSeats = currentBooked + travelersCount; // 🌟 บวกตัวเลข
      tour.historicalBooked = (Number(tour.historicalBooked) || 0) + travelersCount;
      await this.tourRepository.save(tour);
      
    } else if (oldStatus === 'APPROVED' && newStatus !== 'APPROVED') {
      tour.bookedSeats = currentBooked - travelersCount; // 🌟 ลบตัวเลข
      if (tour.bookedSeats < 0) {
        tour.bookedSeats = 0;
      }
      await this.tourRepository.save(tour);
    }

    booking.status = newStatus as any;
    if (reason) (booking as any).rejectReason = reason;

    return this.bookingRepository.save(booking);
  }

  // อัปเดตสถานะชำระเงิน
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

  // 🟢 3. ตอนลบบิล (คืนยอด ต้องเป็นตัวเลขเช่นกัน)
  async deleteBooking(id: string) {
    const booking = await this.bookingRepository.findOne({ where: { id: id as any } });
    if (!booking) {
      throw new NotFoundException(`ไม่พบการจองรหัส ${id}`);
    }
    
    if (booking.status && booking.status.toUpperCase() === 'APPROVED') {
      const tour = await this.tourRepository.findOne({ where: { id: booking.tourId as any } });
      if (tour) {
        // 🌟 แปลงเป็นตัวเลขก่อนลบเสมอ
        tour.bookedSeats = (Number(tour.bookedSeats) || 0) - (Number(booking.travelers) || 1);
        if (tour.bookedSeats < 0) tour.bookedSeats = 0;
        await this.tourRepository.save(tour);
      }
    }

    return this.bookingRepository.remove(booking);
  }
}