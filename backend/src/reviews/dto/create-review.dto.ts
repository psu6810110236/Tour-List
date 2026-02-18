
import { IsInt, Min, Max, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1) @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsNumber()
  tourId: number;

  @IsString()
  userId: number; // รับมาตรงๆ ก่อนเพราะยังไม่มี Auth Token
  
}