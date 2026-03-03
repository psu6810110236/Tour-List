import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * 🔹 สำหรับ Admin
   * ดึงรายชื่อลูกค้าที่เคยทักมา (แสดงเป็นรายชื่อห้อง)
   * GET /chat/contacts
   */
  @Get('contacts')
  async getContacts(): Promise<User[]> {
    return await this.chatService.getChatContacts();
  }

  /**
   * 🔹 สำหรับ Admin และ User
   * ดึงข้อความทั้งหมดของ user คนนั้น
   * GET /chat/messages/:userId
   */
  @Get('messages/:userId')
  async getUserMessages(
    @Param('userId') userId: string,
  ): Promise<Message[]> {
    return await this.chatService.getMessagesByUser(userId);
  }
}