// backend/src/users/users.service.ts
import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity'; // ✅ อย่าลืม import Role
import { CreateUserDto } from '../auth/dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Role) // ✅ Inject Role Repository เพื่อหา Role 'user'
    private roleRepository: Repository<Role>,
  ) { }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  // ✅ ฟังก์ชันสร้าง User ใหม่แบบถูกต้อง
  async create(createUserDto: CreateUserDto, passwordHash: string): Promise<User> {
    const { email, fullName } = createUserDto;

    // 1. หา Role 'user' จาก Database
    const userRole = await this.roleRepository.findOne({ where: { name: 'user' } });

    // (Optional) ถ้าไม่มี Role user ให้ใช้ ID มั่วๆ หรือสร้างใหม่ (กัน Error)
    // แต่ควรมี Role 'user' ใน DB อยู่แล้วนะ
    if (!userRole) {
      throw new InternalServerErrorException('Default role "user" not found.');
    }

    // 2. สร้าง User Object
    const newUser = this.usersRepository.create({
      email,
      fullName,
      passwordHash,
      role: userRole, // ใส่ Role ที่หามาได้
      provider: 'local',
    });

    try {
      return await this.usersRepository.save(newUser);
    } catch (error) {
      if (error.code === '23505') { // รหัส Error ของ Postgres เวลามีข้อมูลซ้ำ
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException();
    }
  }
}