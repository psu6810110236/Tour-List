import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Tour } from './tour.entity';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  tourId: string;

  @ManyToOne(() => Tour)
  @JoinColumn({ name: 'tourId' })
  tour: Tour;

  @Column('date')
  travelDate: Date;

  @Column()
  travelers: number;

  @Column('float')
  totalPrice: number;

  @Column('json', { nullable: true })
  contactInfo: any; // เก็บข้อมูลติดต่อเบื้องต้น
}