import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // เฉพาะ Admin ดูรายชื่อลูกค้าทั้งหมดที่ทักมาได้
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('contacts')
  async getContacts(): Promise<User[]> {
    return await this.chatService.getChatContacts();
  }

  // ดึงประวัติแชท — ไม่ต้อง login (ทั้ง user และ guest ใช้ได้)
  @Get('messages/:userId')
  async getUserMessages(@Param('userId') userId: string): Promise<Message[]> {
    if (!userId) return [];
    return await this.chatService.getMessagesByUser(userId);
  }
}