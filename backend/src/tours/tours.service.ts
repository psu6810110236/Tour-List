import { Injectable, NotFoundException } from '@nestjs/common';
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

    // กรองตามรหัสจังหวัด
    if (filters.provinceId) {
      query.andWhere('tour.provinceId = :provinceId', { provinceId: filters.provinceId });
    }
    // กรองตามราคาต่ำสุด
    if (filters.minPrice && !isNaN(Number(filters.minPrice))) {
      query.andWhere('tour.price >= :minPrice', { minPrice: Number(filters.minPrice) });
    }
    // กรองตามราคาสูงสุด
    if (filters.maxPrice) {
      query.andWhere('tour.price <= :maxPrice', { maxPrice: Number(filters.maxPrice) });
    }
    // 🟢 เพิ่ม Filter สำหรับค้นหาวันที่เริ่มทัวร์ (ค้นหาตั้งแต่วันที่ระบุเป็นต้นไป)
    if (filters.startDate) {
      query.andWhere('tour.startDate >= :startDate', { startDate: filters.startDate });
    }

    // ระบบจัดเรียง (Sorting)
    if (filters.sort === 'price_asc') query.orderBy('tour.price', 'ASC');
    else if (filters.sort === 'price_desc') query.orderBy('tour.price', 'DESC');
    else query.orderBy('tour.rating', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string) {
    return this.tourRepository.findOne({ where: { id: Number(id) }, relations: ['province'] });
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
    const savedTour = await this.tourRepository.save(newTour); // บันทึก Tour ก่อน
    
    // ถ้าบันทึก Tour สำเร็จ ค่อยมาอัปเดต Province
    if (tourData.provinceId) {
      const province = await this.provinceRepository.findOne({ where: { id: tourData.provinceId }});
      if (province) {
        province.tourCount = (province.tourCount || 0) + 1;
        await this.provinceRepository.save(province);
      }
    }
    return savedTour;
  }

  // 🟢 1. เพิ่มฟังก์ชันสำหรับอัปเดตข้อมูลทัวร์
  async updateTour(id: string, tourData: Partial<Tour>) {
    await this.tourRepository.update(Number(id), tourData);
    return this.tourRepository.findOne({ where: { id: Number(id) } });
  }

  // 🔴 ฟังก์ชันลบทัวร์
  async deleteTour(id: string) {
    const result = await this.tourRepository.delete(Number(id));
    if (result.affected === 0) {
      throw new NotFoundException(`ไม่พบทัวร์รหัส ${id} ที่ต้องการลบ`);
    }
    return { message: 'ลบทัวร์สำเร็จแล้ว' };
  }
}