import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';

// UUID v4 format regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('contacts')
  async getContacts(): Promise<User[]> {
    return await this.chatService.getChatContacts();
  }

  @Get('messages/:userId')
  async getUserMessages(
    @Param('userId') userId: string,
  ): Promise<Message[]> {
    // guest ID ไม่ใช่ uuid → PostgreSQL จะ error ถ้าส่งเข้า DB
    // คืน array เปล่าแทนทันที ไม่ต้อง query
    if (!UUID_REGEX.test(userId)) {
      return [];
    }
    return await this.chatService.getMessagesByUser(userId);
  }
}