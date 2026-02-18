import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Province } from './entities/province.entity';
import { Tour } from './entities/tour.entity';
import { User } from './entities/user.entity'; 
import * as bcrypt from 'bcrypt'; 

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

  async onApplicationBootstrap() {

    await this.seedRoles();
    await this.seedUsers();
    const provinces = await this.seedProvinces();
    await this.seedTours(provinces);
  }

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
          image: 'https://images.unsplash.com/photo-1585123334904-845d60e97b29',
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
            image: 'https://images.unsplash.com/photo-1596390314481-98782084c59a',
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

    if (adminRole && !(await this.userRepository.findOne({ where: { email: adminEmail } }))) {
      await this.userRepository.save({
        email: adminEmail,
        passwordHash: hashedPassword,
        fullName: 'Admin Tester',
        role: adminRole,
        // roleId: adminRole.id, 
        provider: 'local',
      });
      console.log('✅ Seeded Admin User');
    }

    if (userRole && !(await this.userRepository.findOne({ where: { email: userEmail } }))) {
      await this.userRepository.save({
        email: userEmail,
        passwordHash: hashedPassword,
        fullName: 'Normal User',
        role: userRole,
        // roleId: userRole.id,
        provider: 'local',
      });
      console.log('✅ Seeded Normal User');
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}