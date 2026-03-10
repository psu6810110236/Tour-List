import { Entity, PrimaryColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Tour } from './tour.entity';

@Entity()
export class Booking {
  // 🟢 1. เปลี่ยนมาใช้ @PrimaryColumn แบบ varchar เพื่อให้รองรับรหัส BKG-xxx
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @CreateDateColumn()
  bookingDate: Date;

  @Column()
  travelDate: Date;

  @Column()
  travelers: number;

  @Column('float')
  totalPrice: number;

  @Column({ default: 'PENDING' }) 
  status: string;

  @Column({ default: 'PENDING' }) 
  paymentStatus: string;

  @Column({ type: 'text', nullable: true })
  paymentSlip: string;

  @Column()
  tourNameSnapshot: string;

  @Column({ nullable: true })
  tourNameSnapshot_th: string;

  @Column()
  userId: string;

  @Column()
  tourId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Tour)
  @JoinColumn({ name: 'tourId' })
  tour: Tour;
}