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

  @Column({ nullable: true })
  tripType: string;

  // 🌟 [เพิ่มใหม่] จำนวนวันเดินทางของทริปนี้
  @Column('int', { default: 1 })
  tripDays: number;

  @Column('json', { nullable: true })
  availableDates: string[];

  @Column()
  image: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column('float', { default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

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

  @Column({ type: 'date', nullable: true })
  startDate: Date; 

  // --- Relations ---
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

  // ประเภททัวร์ (oneday หรือ package)
  @Column({ type: 'varchar', length: 50, default: 'oneday' })
  tourType: string;

  // ชื่อที่พัก (nullable = true เพราะ one day trip จะไม่มีที่พัก)
  @Column({ type: 'varchar', length: 255, nullable: true })
  accommodation: string;

  // จำนวนรับสูงสุด (Max Capacity)
  @Column({ type: 'int', default: 10 })
  maxCapacity: number;

  // จำนวนคนที่จองและจ่ายเงินแล้ว (เพื่อเอาไว้ทำระบบตัดยอด)
  @Column({ type: 'int', default: 0 })
  bookedSeats: number;
}