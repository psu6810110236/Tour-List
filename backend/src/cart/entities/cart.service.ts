import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart-item.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
  ) {}

  // 1. ดึงรายการในตะกร้าทั้งหมดของ User คนนั้น
  async getCartItemsByUserId(userId: string): Promise<CartItem[]> {
    return this.cartRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }, // เรียงจากใหม่ไปเก่า
    });
  }

  // 2. เพิ่มสินค้าลงตะกร้า
  async addToCart(userId: string, createCartItemDto: CreateCartItemDto): Promise<CartItem> {
    const newItem = this.cartRepository.create({
      userId,
      ...createCartItemDto,
    });
    return this.cartRepository.save(newItem);
  }

  // 3. ลบสินค้าออกจากตะกร้า
  async removeFromCart(userId: string, cartItemId: string): Promise<{ message: string }> {
    const item = await this.cartRepository.findOne({ where: { id: cartItemId, userId } });
    if (!item) {
      throw new NotFoundException('ไม่พบรายการนี้ในตะกร้า หรือคุณไม่มีสิทธิ์ลบ');
    }
    await this.cartRepository.remove(item);
    return { message: 'ลบรายการออกจากตะกร้าสำเร็จ' };
  }
}