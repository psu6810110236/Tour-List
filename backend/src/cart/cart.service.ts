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
    let cart = await this.cartRepo.findOne({ where: { userId }, relations: ['items'] });
    if (!cart) {
      cart = this.cartRepo.create({ userId });
      await this.cartRepo.save(cart);
    }

    const existingItem = cart.items?.find(
      item => item.tourId === dto.tourId && item.selectedDate === dto.selectedDate
    );

    if (existingItem) {
      existingItem.pax += dto.pax;
      existingItem.totalPrice = Number(existingItem.totalPrice) + Number(dto.totalPrice);
      return this.cartItemRepo.save(existingItem);
    }

    const newItem = this.cartItemRepo.create({ ...dto, cart });
    return this.cartItemRepo.save(newItem);
  }

  // ✅ เปลี่ยนชื่อจาก getCart → getCartItemsByUserId ให้ตรงกับ controller
  async getCartItemsByUserId(userId: string) {
    const cart = await this.cartRepo.findOne({
      where: { userId },
      relations: ['items'],
    });
    return cart?.items ?? [];
  }

  // ✅ เพิ่ม removeFromCart ที่หายไป
  async removeFromCart(userId: string, cartItemId: string) {
    const item = await this.cartItemRepo.findOne({
      where: { id: cartItemId },
      relations: ['cart'],
    });

    if (!item) throw new NotFoundException('Cart item not found');
    if (item.cart.userId !== userId) throw new NotFoundException('Cart item not found');

    await this.cartItemRepo.remove(item);
    return { message: 'Removed successfully' };
  }
}