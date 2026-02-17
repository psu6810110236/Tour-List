import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity'; // อ้างอิง User entity ที่มีอยู่แล้ว

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: String;

  @ManyToOne(() => User, (user) => user.id) 
  sender: User;

  // กรณีเป็นห้องแชทรวม หรือแชทส่วนตัว อาจจะเก็บ roomId หรือ receiverId เพิ่มเติมได้
  // ในตัวอย่างนี้ขอทำแบบห้องแชทรวมง่ายๆ ก่อนนะครับ

  @CreateDateColumn()
  createdAt: Date;
}