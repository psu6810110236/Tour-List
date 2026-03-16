import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity'; 
import { Tour } from './tour.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number; 

  @Column()
  tourId: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Tour, (tour) => tour.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tourId' }) 
  tour: Tour;  

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' }) 
  user: User;
  
  @Column()
  userId: string;

}