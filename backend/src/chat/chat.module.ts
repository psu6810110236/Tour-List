import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../entities/message.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller'; // 1. Import

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [ChatController], // 2. เพิ่ม Controller ตรงนี้
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}