import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from '../entities/review.entity'; 

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async create(createReviewDto: CreateReviewDto) {
    const { tourId, userId, ...reviewData } = createReviewDto;

    const review = this.reviewRepository.create({
      ...reviewData,    
      tour: { id: tourId } as any,
      user: { id: userId } as any,
    });
    return await this.reviewRepository.save(review);
  }
  async findByTourId(tourId: number) {
    return await this.reviewRepository.find({
      where: {
        tour: { id: tourId } 
      },
      relations: ['user'],    
      order: { createdAt: 'DESC' },
    });
  }
}