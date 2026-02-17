import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "src/entities/message.entity";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";

@Module({
    imports: [TypeOrmModule.forFeature([Message])],
    providers: [ChatGateway, ChatService],
})
export class ChatModule{}