import { Entity, PrimaryColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm'
import { User } from './user.entity';
import { Tour } from './tour.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  bookingDate: Date;

  @Column()
  travelDate: Date;

  @Column()
  travelers: number;

  @Column('float')
  totalPrice: number;

  @Column({ default: 'PENDING' }) // pending, confirmed, cancelled
  status: string;

  @Column({ default: 'PENDING' }) // pending, completed, failed
  paymentStatus: string;

  @Column({ type: 'text', nullable: true })
  paymentSlip: string;

  // Snapshot Data (เก็บข้อมูล ณ วันจอง)
  @Column()
  tourNameSnapshot: string;

  @Column({ nullable: true })
  tourNameSnapshot_th: string;

  // --- Relations ---

  @Column()
  userId: string;

  @Column()
  tourId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Tour)
  @JoinColumn({ name: 'tourId' })
  tour: Tour;
  
}

