import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  senderId: string;

  // 👇 เพิ่มคอลัมน์นี้: เพื่อระบุคนรับ (Admin หรือ User)
  @Column({ nullable: true })
  receiverId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @CreateDateColumn()
  createdAt: Date;
}