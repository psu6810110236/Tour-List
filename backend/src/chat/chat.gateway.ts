import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { ChatService } from "./chat.service";
import { Server,Socket } from "socket.io";

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) {}

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() payload: {senderId: string; content: string},
        @ConnectedSocket() client: Socket,

    ) : Promise<void>{
        const saveMessage = await this.chatService.saveMessage(payload.content, payload.senderId)

        this.server.emit('receiveMessage', saveMessage);
    }
}
