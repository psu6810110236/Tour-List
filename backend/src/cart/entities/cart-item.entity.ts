import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // รหัสของ User ที่เป็นเจ้าของตะกร้านี้ (ดึงจาก Token ตอน Login)
  @Column()
  userId: string;

  @Column()
  tourId: string;

  @Column()
  tourName: string;

  @Column({ type: 'date' })
  travelDate: string;

  @Column({ type: 'int' })
  pax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @CreateDateColumn()
  createdAt: Date;
}