import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  // แก้ไขให้ nullable: true สำหรับ Google Login
  @Column({ nullable: true })
  passwordHash: string;

  @Column()
  fullName: string;

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

  @Column({ nullable: true })
  verificationToken: string;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date;

  @Column({ nullable: true })
  hashedRefreshToken: string;
}