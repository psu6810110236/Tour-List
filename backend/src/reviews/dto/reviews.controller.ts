import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Get('tour/:tourId') // เพิ่ม API: GET /reviews/tour/1
  findByTour(@Param('tourId', ParseIntPipe) tourId: number) {
    return this.reviewsService.findByTourId(tourId);
  }
}