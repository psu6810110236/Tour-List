import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tour } from '../entities/tour.entity';
import { Province } from '../entities/province.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable()
export class ToursService {


  constructor(
    @InjectRepository(Tour)
    private tourRepository: Repository<Tour>,
    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,
  ) { }

  // เปลี่ยนมาใช้ CronExpression ของ NestJS เพื่อความชัวร์และอ่านง่าย
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async resetMonthlyPopularity() {
    console.log('--- 📅 กำลังรีเซ็ตยอดจองสะสมประจำเดือน ---');

    // ใช้ queryBuilder ตัวเดิมที่แก้ปัญหา Error ของ TypeORM ได้แล้ว
    await this.tourRepository.createQueryBuilder()
      .update(Tour)
      .set({ historicalBooked: 0 })
      .execute();

    console.log('--- ✅ รีเซ็ตประจำเดือนเสร็จเรียบร้อยแล้ว ---');
  }
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
    if (filters.tripDays) {
      if (filters.tripDays === '5+') {
        // ถ้าเลือก "มากกว่า 4 วัน" ให้หาทัวร์ที่มีจำนวนวันมากกว่า 4
        query.andWhere('tour.tripDays > 4');
      } else {
        // ถ้าเลือก 1, 2, 3, 4 ให้หาแบบตรงตัวเป๊ะๆ
        query.andWhere('tour.tripDays = :tripDays', { tripDays: Number(filters.tripDays) });
      }
    }

    // ระบบจัดเรียง (Sorting)
    // ระบบจัดเรียง (Sorting)
    if (filters.sort === 'price_asc') query.orderBy('tour.price', 'ASC');
    else if (filters.sort === 'price_desc') query.orderBy('tour.price', 'DESC');
    else if (filters.sort === 'popular') query.orderBy('tour.bookedSeats', 'DESC'); // 🟢 เพิ่มบรรทัดนี้: เรียงยอดจองมากไปน้อย
    else query.orderBy('tour.rating', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string) {
    const tour = await this.tourRepository.findOne({ where: { id: Number(id) }, relations: ['province'] });
    if (!tour) throw new NotFoundException(`ไม่พบทัวร์รหัส ${id}`);
    return tour;
  }

  async findAllProvinces() {
    return this.provinceRepository.find();
  }

  // 🟢 ฟังก์ชันที่แก้ไขแล้ว
  async findProvinceById(id: string) {
    const province = await this.provinceRepository.findOne({
      where: { id: id }
    });

    if (!province) {
      throw new NotFoundException(`ไม่พบข้อมูลจังหวัดรหัส ${id}`);
    }

    return province;
  }

  async createProvince(provinceData: Partial<Province>) {
    const newProvince = this.provinceRepository.create(provinceData);
    return await this.provinceRepository.save(newProvince);
  }

  async updateProvince(id: string, updateData: any) {
    const province = await this.provinceRepository.findOne({ where: { id: id as any } });
    if (!province) {
      throw new NotFoundException(`ไม่พบจังหวัดรหัส ${id}`);
    }
    
    // เอาข้อมูลใหม่มาทับข้อมูลเดิม
    Object.assign(province, updateData);
    return this.provinceRepository.save(province);
  }

  async createTour(tourData: Partial<Tour>) {
    const newTour = this.tourRepository.create(tourData);
    const savedTour = await this.tourRepository.save(newTour); // บันทึก Tour ก่อน

    // ถ้าบันทึก Tour สำเร็จ ค่อยมาอัปเดต Province
    if (tourData.provinceId) {
      const province = await this.provinceRepository.findOne({ where: { id: tourData.provinceId } });
      if (province) {
        province.tourCount = (province.tourCount || 0) + 1;
        await this.provinceRepository.save(province);
      }
    }
    return savedTour;
  }

  // 🟢 1. เพิ่มฟังก์ชันสำหรับอัปเดตข้อมูลทัวร์
  async updateTour(id: string, tourData: Partial<Tour>) {
    const result = await this.tourRepository.update(Number(id), tourData);
    if (result.affected === 0) throw new NotFoundException(`ไม่พบทัวร์รหัส ${id} ที่ต้องการแก้ไข`);
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