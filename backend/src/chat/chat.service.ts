import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Message } from "src/entities/message.entity";
import { Repository } from "typeorm";
import { User } from '../entities/user.entity';
@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
    ){}

    async saveMessage(content: string, senderId): Promise<Message>{
        const newMessage = this.messageRepository.create({
            content,
            sender: {id: senderId} as any,
        });
        return await this.messageRepository.save(newMessage);

    }

    async getAllMessages(): Promise<Message[]>{
        return await this.messageRepository.find({
            relations: ['sender'],
            order: {createdAt: 'ASC'},
        })
    }
}