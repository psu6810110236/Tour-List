import { Entity, PrimaryColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Tour } from './tour.entity';

@Entity()
export class Booking {
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

  // 🟢 เพิ่มคอลัมน์เก็บเหตุผลที่ปฏิเสธ
  @Column({ type: 'text', nullable: true })
  rejectReason: string;

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

  @Column({ nullable: true })
  contactName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  specialRequests: string;
}