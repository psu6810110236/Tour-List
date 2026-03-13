// src/cart/cart.controller.ts
import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from './cart.service';
import { AddToCartDto } from './add-to-cart.dto';

@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req) {
    return this.cartService.getCartItemsByUserId(req.user.id);
  }

  @Post('add')
  addToCart(@Req() req, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, dto);
  }

  @Delete(':id')
  removeFromCart(@Req() req, @Param('id') cartItemId: string) {
    return this.cartService.removeFromCart(req.user.id, cartItemId);
  }
}