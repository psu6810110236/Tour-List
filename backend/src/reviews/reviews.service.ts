import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from 'src/entities/review.entity';
import { Tour } from 'src/entities/tour.entity'; // 🟢 1. Import Tour Entity เข้ามาด้วย
import { Repository } from 'typeorm';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,

    @InjectRepository(Tour)
    private tourRepository: Repository<Tour>,
  ) {}

  async findByTourId(tourId: string) {
    return this.reviewRepository.find({
      where: { tourId },
      order: { createdAt: 'DESC' },
      relations: ['user'], 
    });
  }

 async create(tourId: string, userId: string, data: { rating: number; comment: string }) {
    const newReview = await this.reviewRepository.save(
      this.reviewRepository.create({
        tourId: tourId, 
        userId,
        rating: data.rating,
        comment: data.comment,
      }),
    );
    const allReviews = await this.reviewRepository.find({ where: { tourId } });
    const count = allReviews.length;
    const average = allReviews.reduce((sum, r) => sum + r.rating, 0) / count;

    await this.tourRepository.update(Number(tourId), {
      rating: Number(average.toFixed(1)), 
      reviewCount: count,
    });

    return newReview;
  }
}