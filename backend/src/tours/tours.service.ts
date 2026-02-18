import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tour } from '../entities/tour.entity';
import { Province } from '../entities/province.entity';

@Injectable()
export class ToursService {
  constructor(
    @InjectRepository(Tour)
    private tourRepository: Repository<Tour>,
    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,
  ) {}

  // ฟังก์ชันค้นหาทัวร์ พร้อมตัวกรอง (Filter)
  async search(filters: any) {
    const query = this.tourRepository.createQueryBuilder('tour')
      .leftJoinAndSelect('tour.province', 'province'); // Join เพื่อเอาข้อมูลจังหวัดมาด้วย

    // 1. กรองตามจังหวัด (Province ID)
    if (filters.provinceId) {
      query.andWhere('tour.provinceId = :provinceId', { provinceId: filters.provinceId });
    }

    // 2. กรองตามราคา (Min - Max)
    if (filters.minPrice) {
      query.andWhere('tour.price >= :minPrice', { minPrice: Number(filters.minPrice) });
    }
    if (filters.maxPrice) {
      query.andWhere('tour.price <= :maxPrice', { maxPrice: Number(filters.maxPrice) });
    }

    // 3. เรียงลำดับข้อมูล
    if (filters.sort === 'price_asc') {
      query.orderBy('tour.price', 'ASC');
    } else if (filters.sort === 'price_desc') {
      query.orderBy('tour.price', 'DESC');
    } else {
      query.orderBy('tour.rating', 'DESC'); // ค่าเริ่มต้น: เรียงตามคะแนนนิยม
    }

    return await query.getMany();
  }

  // ดึงรายละเอียดทัวร์ตาม ID
  async findOne(id: string) {
    return this.tourRepository.findOne({ 
      where: { id },
      relations: ['province'] 
    });
  }

  // ดึงข้อมูลจังหวัดทั้งหมด (สำหรับหน้า HomePage)
  async findAllProvinces() {
    return this.provinceRepository.find();
  }
}