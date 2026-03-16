import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  CreateDateColumn, 
  JoinColumn 
} from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  // 🔒 เพิ่ม select: false เพื่อความปลอดภัย ป้องกันรหัสผ่านหลุดไปกับ API อื่น
  @Column({ nullable: true, select: false })
  passwordHash: string;

  @Column()
  fullName: string;

  // ✅ เพิ่ม phone field
  @Column({ nullable: true })
  phone: string;

  @Column({ default: 'local' })
  provider: string;

  @Column()
  roleId: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isEmailVerified: boolean;

  // 🔒 ซ่อน Token ต่างๆ เพื่อความปลอดภัยเช่นกัน
  @Column({ nullable: true, select: false })
  verificationToken: string;

  @Column({ nullable: true, select: false })
  resetPasswordToken: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date;

  // 🔒 ซ่อน Refresh Token
  @Column({ nullable: true, select: false })
  hashedRefreshToken: string;
}