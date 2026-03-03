// backend/src/auth/auth.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto'; // ✅ Import DTO

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // ... validateUser (คงเดิม)
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  // ... login (คงเดิม)
  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role?.name };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role?.name,
      }
    };
  }

  // ✅ ฟังก์ชัน Register แบบรับ DTO
  async register(createUserDto: CreateUserDto) {
    // 1. ตรวจสอบว่ามีอีเมลนี้หรือยัง
    const existingUser = await this.usersService.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    // 3. ส่งต่อให้ UsersService บันทึก
    const newUser = await this.usersService.create(createUserDto, passwordHash);

    // 4. ส่งค่ากลับ (ไม่ส่ง passwordHash)
    const { passwordHash: p, ...result } = newUser;
    return result;
  }
}