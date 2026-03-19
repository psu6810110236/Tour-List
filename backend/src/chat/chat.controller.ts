import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';

// UUID v4 format regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // เฉพาะ Admin ดูรายชื่อลูกค้าทั้งหมดที่ทักมาได้
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('contacts')
  async getContacts(): Promise<User[]> {
    return await this.chatService.getChatContacts();
  }

  // ดึงประวัติแชท — ไม่ต้อง login (guest ใช้ได้)
  @Get('messages/:userId')
  async getUserMessages(@Param('userId') userId: string): Promise<Message[]> {
    // guest ID ไม่ใช่ uuid → คืน array เปล่าทันที ไม่ query DB
    if (!UUID_REGEX.test(userId)) {
      return [];
    }
    return await this.chatService.getMessagesByUser(userId);
  }
}