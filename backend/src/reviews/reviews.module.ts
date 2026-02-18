import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { Review } from '../entities/review.entity'; 
import { ReviewsController } from './dto/reviews.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Review])], 
  controllers: [ReviewsController], 
  providers: [ReviewsService],      
})
export class ReviewsModule {}