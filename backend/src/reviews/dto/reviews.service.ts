// src/reviews/reviews.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './create-review.dto';
import { Review } from 'src/entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  // ฟังก์ชันสร้างรีวิว
  async create(createReviewDto: CreateReviewDto) {
    const review = this.reviewRepository.create(createReviewDto);
    return this.reviewRepository.save(review);
  }

  // ฟังก์ชันดึงรีวิวของทัวร์นั้นๆ
  async findByTourId(tourId: number) {
    return this.reviewRepository.find({
      where: { tourId },
      relations: ['user'], // Join เอาชื่อคนรีวิวมาด้วย
      order: { createdAt: 'DESC' }, // เรียงจากใหม่ไปเก่า
    });
  }
}