import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsBoolean, 
  IsArray 
} from 'class-validator';

export class CreateTourDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  name_th?: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  description_th?: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  duration: string;

  @IsOptional()
  @IsString()
  duration_th?: string;

  // 🌟 ฟิลด์ใหม่ที่เราเพิ่งเพิ่มไป
  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsOptional()
  @IsNumber()
  maxCapacity?: number;

  @IsOptional()
  @IsString()
  tripType?: string;

  @IsOptional()
  @IsNumber()
  tripDays?: number;

  @IsOptional()
  @IsArray()
  availableDates?: string[];

  // 🌟 ฟิลด์สำหรับซ่อนทัวร์
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsArray()
  highlights?: string[];

  @IsOptional()
  @IsArray()
  highlights_th?: string[];

  @IsOptional()
  @IsArray()
  itinerary?: any[];

  @IsOptional()
  @IsArray()
  included?: string[];

  @IsOptional()
  @IsArray()
  included_th?: string[];

  @IsOptional()
  @IsArray()
  notIncluded?: string[];

  @IsOptional()
  @IsArray()
  notIncluded_th?: string[];

  @IsOptional()
  startDate?: Date;

  @IsNotEmpty()
  @IsString()
  provinceId: string;
}