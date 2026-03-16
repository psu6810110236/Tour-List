import { IsString, IsInt, IsNumber, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateCartItemDto {
  @IsString()
  @IsNotEmpty()
  tourId: string;

  @IsString()
  @IsNotEmpty()
  tourName: string;

  @IsDateString()
  travelDate: string;

  @IsInt()
  pax: number;

  @IsNumber()
  totalPrice: number;
}