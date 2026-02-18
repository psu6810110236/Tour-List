import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CreateReviewDto } from './create-review.dto';
import { ReviewsService } from '../reviews.service';


@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @Post()
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }
  @Get('tour/:id')
  findAllByTour(@Param('id', ParseIntPipe) tourId: number) {
    return this.reviewsService.findByTourId(tourId);
  }
}