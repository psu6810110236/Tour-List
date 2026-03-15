// cart-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cart } from './cart.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tourId: string;

  @Column({ type: 'date' })
  selectedDate: string;

  @Column({ type: 'int' })
  pax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  // เชื่อมกับตาราง Cart หลัก
  @ManyToOne(() => Cart, cart => cart.items, { onDelete: 'CASCADE' })
  cart: Cart;
}