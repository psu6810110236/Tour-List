import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async saveMessage(content: string, senderId: string): Promise<Message> {
    const newMessage = this.messageRepository.create({
      content,
      sender: { id: senderId } as User,
    });
    return await this.messageRepository.save(newMessage);
  }

  async getAllMessages(): Promise<Message[]> {
    return await this.messageRepository.find({
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  // --- เพิ่มส่วนนี้เข้าไป ---
  async getChatContacts(): Promise<User[]> {
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .distinctOn(['message.senderId']) // เลือกเฉพาะรายการที่ไม่ซ้ำ
      .orderBy('message.senderId')
      .addOrderBy('message.createdAt', 'DESC')
      .getMany();

    return messages.map((msg) => msg.sender).filter((user) => user);
  }
}