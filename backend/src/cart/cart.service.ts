// cart.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { AddToCartDto } from './add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private cartItemRepo: Repository<CartItem>,
  ) {}

  async addToCart(userId: string, dto: AddToCartDto) {
    // 1. หาตะกร้าของ User คนนี้ (ถ้าไม่มีให้สร้างใหม่)
    let cart = await this.cartRepo.findOne({ where: { userId }, relations: ['items'] });
    if (!cart) {
      cart = this.cartRepo.create({ userId });
      await this.cartRepo.save(cart);
    }

    // 2. เช็คว่าเลือกทัวร์และวันที่ซ้ำกับในตะกร้าไหม
    const existingItem = cart.items?.find(
      item => item.tourId === dto.tourId && item.selectedDate === dto.selectedDate
    );

    if (existingItem) {
      // ถ้าซ้ำ ให้อัปเดตจำนวนคนและราคา
      existingItem.pax += dto.pax;
      existingItem.totalPrice = Number(existingItem.totalPrice) + Number(dto.totalPrice);
      return this.cartItemRepo.save(existingItem);
    }

    // 3. ถ้าไม่ซ้ำ ให้สร้าง Item ใหม่ใส่ตะกร้า
    const newItem = this.cartItemRepo.create({
      ...dto,
      cart: cart,
    });
    
    return this.cartItemRepo.save(newItem);
  }

  async getCart(userId: string) {
    return this.cartRepo.findOne({ 
      where: { userId }, 
      relations: ['items'] 
    });
  }
}