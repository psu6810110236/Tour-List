import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Booking } from './booking.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bookingId: string;

  @OneToOne(() => Booking)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column()
  method: string; // BANK_TRANSFER, CREDIT_CARD

  @Column({ nullable: true })
  slipUrl: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, VERIFIED, FAILED

  @Column({ nullable: true })
  paidAt: Date;
}