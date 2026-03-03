import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToursService } from './tours.service';
import { ToursController } from './tours.controller';
import { Tour } from '../entities/tour.entity';
import { Province } from '../entities/province.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tour, Province])],
  controllers: [ToursController],
  providers: [ToursService],
  exports: [ToursService],
})
export class ToursModule {}