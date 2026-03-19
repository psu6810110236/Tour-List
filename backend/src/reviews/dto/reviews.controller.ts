import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewService } from '../reviews.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('reviews') // 🟢 ชื่อประตูหลักคือ /reviews
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}
  @Get('tour/:tourId')
  async getReviewsByTour(@Param('tourId') tourId: string) {
    return this.reviewService.findByTourId(tourId);
  }
  @Post('tour/:tourId')
@UseGuards(JwtAuthGuard) 
async createReview(
  @Param('tourId') tourId: string,
  @Body() createReviewDto: { rating: number; comment: string },
  @Request() req: any,
) {
  // ดึง ID จาก Token ที่ผ่านการ Login มาแล้ว
  const userId = req.user.userId;
  return this.reviewService.create(tourId, userId, createReviewDto);
}
}