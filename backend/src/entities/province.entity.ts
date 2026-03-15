import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Province {
  @PrimaryColumn()
  id: string; // เช่น 'chiang-mai'

  @Column()
  name: string;

  @Column({ nullable: true })
  name_th: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  description_th: string;

  @Column()
  image: string;

  @Column({ default: 0 })
  tourCount: number;

  @Column({ nullable: true })
  region: string; // north, central, northeast, east, west, south
}