import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
// 🌟 1. เปลี่ยนมา Import AuthGuard จาก @nestjs/passport โดยตรง
import { AuthGuard } from '@nestjs/passport'; 

import { CartService } from './entities/cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';

@Controller('cart')
// 🌟 2. ใช้ AuthGuard('jwt') แทน JwtAuthGuard
@UseGuards(AuthGuard('jwt')) 
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // [GET] /cart -> ดึงตะกร้าของตัวเอง
  @Get()
  getCart(@Req() req) {
    const userId = req.user.id; // ดึง User ID จาก Token
    return this.cartService.getCartItemsByUserId(userId);
  }

  // [POST] /cart/add -> เพิ่มลงตะกร้า
  @Post('add')
  addToCart(@Req() req, @Body() createCartItemDto: CreateCartItemDto) {
    const userId = req.user.id;
    return this.cartService.addToCart(userId, createCartItemDto);
  }

  // [DELETE] /cart/:id -> ลบรายชิ้น
  @Delete(':id')
  removeFromCart(@Req() req, @Param('id') cartItemId: string) {
    const userId = req.user.id;
    return this.cartService.removeFromCart(userId, cartItemId);
  }
}