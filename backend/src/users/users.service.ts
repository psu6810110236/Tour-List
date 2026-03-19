import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email }, relations: ['role'] });
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id }, relations: ['role'] });
  }

  async create(createUserDto: CreateUserDto, passwordHash: string): Promise<User> {
    const { email, fullName } = createUserDto;
    const userRole = await this.roleRepository.findOne({ where: { name: 'USER' } });

    if (!userRole) {
      throw new InternalServerErrorException('Default role "USER" not found.');
    }

    const newUser = this.usersRepository.create({
      email,
      fullName,
      passwordHash,
      role: userRole,
      provider: 'local',
    });

    try {
      return await this.usersRepository.save(newUser);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException();
    }
  }

  // ✅ ดึงข้อมูลโปรไฟล์ (รวม phone)
  async getProfile(id: string): Promise<Partial<User>> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'fullName', 'email', 'phone', 'provider', 'createdAt'],
    });
    if (!user) throw new NotFoundException('ไม่พบผู้ใช้');
    return user;
  }

  // ✅ อัปเดตโปรไฟล์ (ชื่อ + เบอร์) — แก้ให้ใช้ phone แบบ typed
  async updateProfile(id: string, data: { fullName?: string; phone?: string }): Promise<Partial<User>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('ไม่พบผู้ใช้');
    if (data.fullName) user.fullName = data.fullName;
    if (data.phone !== undefined) user.phone = data.phone;  // ✅ ไม่ต้อง cast แล้ว
    await this.usersRepository.save(user);
    // คืนเฉพาะ field ที่จำเป็น (ไม่ส่ง passwordHash กลับ)
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
    };
  }

  // ✅ เปลี่ยนรหัสผ่าน
  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('ไม่พบผู้ใช้');
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) throw new BadRequestException('รหัสผ่านเดิมไม่ถูกต้อง');
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.save(user);
  }

  // ✅ จัดการ Google OAuth
  async findOrCreateGoogleUser(profile: any): Promise<User> {
    let user = await this.usersRepository.findOne({
      where: { email: profile.email },
      relations: ['role'],
    });

    if (!user) {
      const userRole = await this.roleRepository.findOne({ where: { name: 'USER' } });
      if (!userRole) throw new InternalServerErrorException('Default role "USER" not found.');

      user = this.usersRepository.create({
        email: profile.email,
        fullName: [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email,
        provider: 'google',
        role: userRole,
      });
      user = await this.usersRepository.save(user);
    }

    return user;
  }
}