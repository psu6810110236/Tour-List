import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Controller('chat')
// ลบ @UseGuards(AuthGuard('jwt')) ออกจากตรงนี้
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // เพิ่ม AuthGuard เข้ามาด้วย เพราะ contacts ต้องการทั้ง login + admin
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('contacts')
  async getContacts(): Promise<User[]> {
    return await this.chatService.getChatContacts();
  }

  // ไม่มี guard — ทุกคนโหลดประวัติได้ (guest คืน [] อยู่แล้วจาก UUID check)
  @Get('messages/:userId')
  async getUserMessages(@Param('userId') userId: string): Promise<Message[]> {
    if (!UUID_REGEX.test(userId)) {
      return [];
    }
    return await this.chatService.getMessagesByUser(userId);
  }
}