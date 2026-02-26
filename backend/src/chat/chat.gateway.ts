import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { ChatService } from "./chat.service";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) { }

    handleConnection(client: Socket) {
        const userId = client.handshake.query.userId as string;
        const role = client.handshake.query.role as string;

        if (role === 'admin') {
            client.join('admin_room');
        } else if (userId) {
            client.join(`user_${userId}`);
        }
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() payload: { senderId: string; content: string; receiverId?: string },
        @ConnectedSocket() client: Socket,
    ) {
        const saved = await this.chatService.saveMessage(
            payload.content,
            payload.senderId,
            payload.receiverId
        );

        // ส่งกลับไปยังคนส่งก่อน (สำคัญมาก!)
        client.emit('receiveMessage', saved);

        // ส่งหา admin ทุกคน
        this.server.to('admin_room').emit('receiveMessage', saved);

        // ส่งหาลูกค้าคนนั้น
        if (payload.receiverId) {
            this.server.to(`user_${payload.receiverId}`).emit('receiveMessage', saved);
        }
    }
}