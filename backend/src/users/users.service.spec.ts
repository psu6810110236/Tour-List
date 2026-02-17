// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt'; 

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // ฟังก์ชันสร้าง User ใหม่ (Hash Password)
  async createUser(email: string, plainPassword: string, fullName: string, roleId: string) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    const newUser = this.usersRepository.create({
      email,
      passwordHash: hashedPassword,
      fullName,
      roleId,
      provider: 'local',
    });

    return await this.usersRepository.save(newUser);
  }

  // ฟังก์ชันหา User ด้วย Email (ใช้ตอน Login)
  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }
}