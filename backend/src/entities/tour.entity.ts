import { Entity, PrimaryColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Province } from './province.entity';

@Entity()
export class Tour {
  @PrimaryColumn()
  id: string; // เช่น 'cm-001'

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

  @Column()
  image: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column('float', { default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  // ข้อมูลที่เป็นรายการ (Array) เราจะเก็บเป็น JSON ใน Database
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

  // --- Relations ---
  
  @Column()
  provinceId: string;

  @ManyToOne(() => Province)
  @JoinColumn({ name: 'provinceId' })
  province: Province;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}