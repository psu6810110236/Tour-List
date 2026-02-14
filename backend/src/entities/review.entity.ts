import { Entity, PrimaryColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Tour } from './tour.entity';

@Entity()
export class Review {
  @PrimaryColumn()
  id: string;

  @Column('float')
  rating: number; // คะแนน 1-5

  @Column('text')
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

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