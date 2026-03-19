// backend/src/cart/cart.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { Tour } from '../entities/tour.entity';




@Module({
  imports: [
    // 🟢 2. เติมคำว่า Tour เข้าไปใน Array นี้ครับ!
    TypeOrmModule.forFeature([Cart, CartItem, Tour]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule { }