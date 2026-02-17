import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ดึงรายชื่อคนที่เคยทักมา
  @Get('contacts')
  async getContacts() {
    return await this.chatService.getChatContacts();
  }

  // ดึงข้อความทั้งหมดของลูกค้าคนนี้ (Admin ใช้)
  @Get('messages/:userId')
  async getUserMessages(@Param('userId') userId: string) {
    return await this.chatService.getMessagesByUser(userId);
  }
}