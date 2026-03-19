import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 🟢 1. อย่าลืม Import TypeOrmModule
import { ReviewService } from './reviews.service';
import { ReviewController } from './dto/reviews.controller';
import { Review } from '../entities/review.entity';
import { AuthModule } from '../auth/auth.module';
import { Tour } from '../entities/tour.entity';



@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Tour]), 
    AuthModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}