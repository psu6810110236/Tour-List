import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Message } from "../entities/message.entity";
import { Repository } from "typeorm";
import { User } from '../entities/user.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
    ) { }
    async saveMessage(content: string, senderId: string, receiverId?: string): Promise<Message> {
        const newMessage = this.messageRepository.create({
            content,
            senderId,
            receiverId,
        });

        const saved = await this.messageRepository.save(newMessage);

        const message = await this.messageRepository.findOne({
            where: { id: saved.id },
            relations: ['sender', 'receiver'],
        });

        if (!message) {
            throw new Error('Failed to load message relations');
        }

        return message;
    }

    // 2. ดึงข้อความทั้งหมดที่เกี่ยวข้องกับ User คนนี้ (ทั้งที่เขาส่งมา และเราตอบกลับไป)
    async getMessagesByUser(userId: string): Promise<Message[]> {
        return await this.messageRepository.find({
            where: [
                { senderId: userId },
                { receiverId: userId },
            ],
            relations: ['sender', 'receiver'], // ⭐ สำคัญมาก
            order: { createdAt: 'ASC' },
        });
    }

    // 3. ดึงรายชื่อลูกค้าที่เคยทักมา (Contacts)
    async getChatContacts(): Promise<User[]> {
        const messages = await this.messageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .distinctOn(['message.senderId'])
            .orderBy('message.senderId')
            .addOrderBy('message.createdAt', 'DESC')
            .getMany();

        return messages
            .map(msg => msg.sender)
            .filter((u): u is User => !!u);
    }
}