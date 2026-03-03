import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { CreateUserDto } from '../auth/dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) { }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  async create(createUserDto: CreateUserDto, passwordHash: string): Promise<User> {
    const { email, fullName } = createUserDto;

    // ✅ แก้ไข: เปลี่ยนจาก 'user' เป็น 'USER' ให้ตรงกับที่ Seed ไว้ใน AppService
    const userRole = await this.roleRepository.findOne({ where: { name: 'USER' } });

    if (!userRole) {
      // ถ้าหาไม่เจอจริงๆ ให้ลองหาแบบ Case-insensitive หรือ Throw Error ที่ชัดเจน
      throw new InternalServerErrorException('Default role "USER" not found in database. Please run seed script.');
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
    } catch (error) {
      if (error.code === '23505') { // Error code สำหรับข้อมูลซ้ำใน Postgres
        throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว');
      }
      console.error('Error creating user:', error); // Log error เพื่อให้เห็นสาเหตุใน Terminal
      throw new InternalServerErrorException('ไม่สามารถสร้างผู้ใช้ได้');
    }
  }
}