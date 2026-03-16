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
import * as bcrypt from 'bcrypt';

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

  async getProfile(id: string): Promise<Partial<User>> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'fullName', 'email', 'phone', 'provider', 'createdAt'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: string, data: { fullName?: string; phone?: string }): Promise<Partial<User>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (data.fullName) user.fullName = data.fullName;
    if (data.phone !== undefined) user.phone = data.phone;
    await this.usersRepository.save(user);
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
    };
  }

  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) throw new BadRequestException('Incorrect current password');
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.save(user);
  }

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
        fullName: `${profile.firstName} ${profile.lastName}`,
        provider: 'google',
        role: userRole,
      });
      user = await this.usersRepository.save(user);
    }

    return user;
  }
}