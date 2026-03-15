// src/cart/cart.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string; // เก็บ ID ของ User ที่เป็นเจ้าของตะกร้านี้

  // เชื่อมความสัมพันธ์กลับไปยังตาราง CartItem (1 ตะกร้า มีได้หลาย Item)
  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  items: CartItem[];
}