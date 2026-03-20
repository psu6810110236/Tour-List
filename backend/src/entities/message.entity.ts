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

  @Column({ nullable: true })
  receiverId: string;

  // createForeignKeyConstraints: false เพื่อรองรับ guest ID ที่ไม่มีใน users table
  // ถ้าไม่ปิด FK constraint → Postgres จะ error ทุกครั้งที่ guest พิมแชท
  @ManyToOne(() => User, { nullable: true, eager: false, createForeignKeyConstraints: false })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => User, { nullable: true, eager: false, createForeignKeyConstraints: false })
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @CreateDateColumn()
  createdAt: Date;
}