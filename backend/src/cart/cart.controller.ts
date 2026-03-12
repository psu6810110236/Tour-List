// src/cart/cart.controller.ts
import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // 1. เปลี่ยนมา import ตัวนี้แทน
import { CartService } from './cart.service';
import { AddToCartDto } from './add-to-cart.dto';

@Controller('cart')
@UseGuards(AuthGuard('jwt')) // 2. เปลี่ยนมาใช้ AuthGuard('jwt') ตรงนี้
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  async addToCart(@Req() req, @Body() dto: AddToCartDto) {
    // ดึง userId มาจาก Token ของคนที่ Login
    const userId = req.user.id; 
    return this.cartService.addToCart(userId, dto);
  }

  @Get()
  async getMyCart(@Req() req) {
    return this.cartService.getCart(req.user.id);
  }
}