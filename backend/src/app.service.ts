import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'; // เพิ่ม Filter สำหรับ Search
import { Role } from './entities/role.entity';
import { Province } from './entities/province.entity';
import { Tour } from './entities/tour.entity';
import { User } from './entities/user.entity'; 
import * as bcrypt from 'bcryptjs'; 

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,
    @InjectRepository(Tour)
    private tourRepository: Repository<Tour>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  //ทำงานอัตโนมัติเมื่อ Start Server
  async onApplicationBootstrap() {
    await this.seedRoles();
    await this.seedUsers();
    const provinces = await this.seedProvinces();
    await this.seedTours(provinces);
  }

  // ======================================================
  // 🟢 ส่วนที่ 1: DATA RETRIEVAL (สำหรับ API เรียกใช้)
  // ======================================================

  // ดึงจังหวัดทั้งหมด
  async getAllProvinces() {
    return await this.provinceRepository.find();
  }

  // ดึงทัวร์ทั้งหมด
  async getAllTours() {
    return await this.tourRepository.find();
  }

  // ดึงรายละเอียดทัวร์รายตัว
  async getTourById(id: number) {
    return await this.tourRepository.findOne({ where: { id } });
  }

  // ระบบ Search & Filter ทัวร์ (รองรับ Price, Province)
  async searchTours(query: { provinceId?: string; maxPrice?: number; minPrice?: number }) {
    const where: any = {};
    
    if (query.provinceId) where.provinceId = query.provinceId;
    if (query.maxPrice) where.price = LessThanOrEqual(query.maxPrice);
    if (query.minPrice) where.price = MoreThanOrEqual(query.minPrice);

    return await this.tourRepository.find({ where });
  }

  // ======================================================
  // 🟡 ส่วนที่ 2: DATA SEEDING (ใส่ข้อมูลเริ่มต้น)
  // ======================================================

  private async seedRoles() {
    const count = await this.roleRepository.count();
    if (count === 0) {
      await this.roleRepository.save([{ name: 'ADMIN' }, { name: 'USER' }]);
      console.log('✅ Seeded Roles: ADMIN, USER');
    }
  }

  private async seedProvinces() {
    const count = await this.provinceRepository.count();
    if (count === 0) {
      const data = await this.provinceRepository.save([
        {
          id: 'bangkok',
          name: 'Bangkok',
          name_th: 'กรุงเทพมหานคร',
          description: 'The capital city of Thailand',
          description_th: 'เมืองหลวงของประเทศไทย',
          image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365',
        },
        {
          id: 'chiang-mai',
          name: 'Chiang Mai',
          name_th: 'เชียงใหม่',
          description: 'Cultural capital of Northern Thailand',
          description_th: 'เมืองหลวงทางวัฒนธรรมของภาคเหนือ',
          image: 'https://github.com/psu6810110318/-/blob/main/imagกหดหกหดe.png',
        },
      ]);
      console.log('✅ Seeded Provinces');
      return data;
    }
    return await this.provinceRepository.find();
  }

  private async seedTours(provinces: Province[]) {
    const count = await this.tourRepository.count();

    if (count === 0 && provinces.length > 0) {
      const cm = provinces.find((p) => p.id === 'chiang-mai');
      if (cm) {
        await this.tourRepository.save([
          {
            provinceId: cm.id,
            name: 'Doi Inthanon National Park One Day Tour',
            name_th: 'ทัวร์ดอยอินทนนท์ 1 วัน',
            description: 'Visit the highest peak of Thailand...',
            description_th: 'เยี่ยมชมจุดสูงสุดของประเทศไทย...',
            price: 1500,
            duration: '8 Hours',
            duration_th: '8 ชั่วโมง',
            image: 'https://github.com/psu6810110318/-/blob/main/imagกหดหกหดe.png',
            rating: 4.8,
            reviewCount: 120,
            highlights: ['Visit Pagodas', 'Wachirathan Waterfall', 'Highest Point'],
            highlights_th: ['ชมพระมหาธาตุ', 'น้ำตกวชิรธาร', 'จุดสูงสุดดอยอินทนนท์'],
            itinerary: [
              { time: '08:00', activity: 'Hotel Pickup' },
              { time: '10:30', activity: 'Reach Doi Inthanon' },
            ],
            included: ['Lunch', 'Insurance', 'Entry Fees'],
            notIncluded: ['Tips', 'Personal Expenses'],
          },
        ]);
        console.log('✅ Seeded Mock Tours');
      }
    }
  }

  private async seedUsers() {
    const adminEmail = 'admin@test.com';
    const userEmail = 'user@test.com';
    const password = 'password123'; 

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminRole = await this.roleRepository.findOne({ where: { name: 'ADMIN' } });
    const userRole = await this.roleRepository.findOne({ where: { name: 'USER' } });

    if (adminRole) {
      const existingAdmin = await this.userRepository.findOne({ where: { email: adminEmail } });
      if (existingAdmin) {
        existingAdmin.passwordHash = hashedPassword;
        await this.userRepository.save(existingAdmin);
        console.log('✅ Updated Admin password to hashed version');
      } else {
        await this.userRepository.save({
          email: adminEmail,
          passwordHash: hashedPassword,
          fullName: 'Admin Tester',
          role: adminRole,
          provider: 'local',
        });
        console.log('✅ Seeded Admin User');
      }
    }

    if (userRole) {
      const existingUser = await this.userRepository.findOne({ where: { email: userEmail } });
      if (existingUser) {
        existingUser.passwordHash = hashedPassword;
        await this.userRepository.save(existingUser);
        console.log('✅ Updated User password to hashed version');
      } else {
        await this.userRepository.save({
          email: userEmail,
          passwordHash: hashedPassword,
          fullName: 'Normal User',
          role: userRole,
          provider: 'local',
        });
        console.log('✅ Seeded Normal User');
      }
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}