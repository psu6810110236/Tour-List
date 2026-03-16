// add-to-cart.dto.ts
import { IsString, IsInt, IsDateString, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  tourId: string;

  @IsDateString()
  selectedDate: string; // เช่น '2026-03-26'

  @IsInt()
  @Min(1)
  pax: number; // จำนวนผู้เดินทาง

  @IsNumber()
  @Min(0)
  totalPrice: number; // ราคารวม
}