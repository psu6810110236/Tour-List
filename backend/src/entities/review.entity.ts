// backend/src/entities/review.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity'; // ✅ ใช้ ./ เพราะอยู่โฟลเดอร์เดียวกันแล้ว
import { Tour } from './tour.entity'; // ✅ ใช้ ./ เพราะอยู่โฟลเดอร์เดียวกันแล้ว

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number; 

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()ห
  createdAt: Date;

  @Column()
  tourId: number;

  @Column()
  userId: number;

}