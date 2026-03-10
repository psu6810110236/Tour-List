import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  OneToMany, 
  CreateDateColumn, 
  UpdateDateColumn, 
  JoinColumn 
} from 'typeorm';
import { Province } from './province.entity';
import { Review } from './review.entity'; 

@Entity()
export class Tour {
  @PrimaryGeneratedColumn()
  id: number; 

  @Column()
  name: string;

  @Column({ nullable: true })
  name_th: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  description_th: string;

  // ✅ ฟิลด์นี้ใช้สำหรับทำ Filter Price (ราคา) มีอยู่แล้ว
  @Column('float')
  price: number;

  @Column()
  duration: string;

  @Column({ nullable: true })
  duration_th: string;

  @Column({ nullable: true })
  vehicleType: string;

  @Column('int', { default: 10 })
  maxCapacity: number;

  @Column()
  image: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column('float', { default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  // ข้อมูลที่เป็นรายการ (Array) เก็บเป็น JSON
  @Column('json')
  highlights: string[];

  @Column('json', { nullable: true })
  highlights_th: string[];

  @Column('json')
  itinerary: any[];

  @Column('json')
  included: string[];

  @Column('json', { nullable: true })
  included_th: string[];

  @Column('json')
  notIncluded: string[];

  @Column('json', { nullable: true })
  notIncluded_th: string[];

  // 🌟 [เพิ่มใหม่] ฟิลด์นี้ใช้สำหรับทำ Filter Date (วันที่เริ่มทัวร์)
  @Column({ type: 'date', nullable: true })
  startDate: Date; 

  // --- Relations ---
  
  // ✅ ฟิลด์นี้ใช้สำหรับทำ Filter Province (จังหวัด) มีอยู่แล้ว
  @Column()
  provinceId: string; 

  @ManyToOne(() => Province)
  @JoinColumn({ name: 'provinceId' })
  province: Province;

  @OneToMany(() => Review, (review) => review.tour)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}