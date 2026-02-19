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

  async search(filters: any) {
    const query = this.tourRepository.createQueryBuilder('tour')
      .leftJoinAndSelect('tour.province', 'province');

    if (filters.provinceId) query.andWhere('tour.provinceId = :provinceId', { provinceId: filters.provinceId });
    if (filters.minPrice) query.andWhere('tour.price >= :minPrice', { minPrice: Number(filters.minPrice) });
    if (filters.maxPrice) query.andWhere('tour.price <= :maxPrice', { maxPrice: Number(filters.maxPrice) });

    if (filters.sort === 'price_asc') query.orderBy('tour.price', 'ASC');
    else if (filters.sort === 'price_desc') query.orderBy('tour.price', 'DESC');
    else query.orderBy('tour.rating', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string) {
    return this.tourRepository.findOne({ where: { id }, relations: ['province'] });
  }

  async findAllProvinces() {
    return this.provinceRepository.find();
  }

  async createProvince(provinceData: Partial<Province>) {
    const newProvince = this.provinceRepository.create(provinceData);
    return await this.provinceRepository.save(newProvince);
  }

  async createTour(tourData: Partial<Tour>) {
    const newTour = this.tourRepository.create(tourData);
    if (tourData.provinceId) {
      const province = await this.provinceRepository.findOne({ where: { id: tourData.provinceId }});
      if (province) {
        province.tourCount = (province.tourCount || 0) + 1;
        await this.provinceRepository.save(province);
      }
    }
    return await this.tourRepository.save(newTour);
  }

  // 🟢 1. เพิ่มฟังก์ชันสำหรับอัปเดตข้อมูลทัวร์
  async updateTour(id: string, tourData: Partial<Tour>) {
    await this.tourRepository.update(id, tourData);
    return this.tourRepository.findOne({ where: { id } });
  }
}