import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const role = client.handshake.query.role as string;

    if (userId) {
      client.join(`user_${userId}`);
      console.log(`Client ${client.id} joined room: user_${userId}`);
    }

    if (role === 'admin' || role === 'ADMIN') {
      client.join('admin_room');
      console.log(`Admin joined admin_room`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() payload: { senderId: string; content: string; receiverId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId =
      (client.handshake.query.userId as string) || payload.senderId;
    const role = client.handshake.query.role as string;
    let { content, receiverId } = payload;

    const isAdminSender = role === 'admin' || role === 'ADMIN';

    if (!receiverId) {
      const admin = await this.chatService.getAdminUser();
      if (admin) {
        receiverId = admin.id;
      }
    }

    const saved = await this.chatService.saveMessage(content, senderId, receiverId);

    if (isAdminSender) {
      this.server.to('admin_room').emit('receiveMessage', saved);
      if (receiverId) {
        this.server.to(`user_${receiverId}`).emit('receiveMessage', saved);
      }
    } else {
      this.server.to(`user_${senderId}`).emit('receiveMessage', saved);
      this.server.to('admin_room').emit('receiveMessage', saved);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.userId) {
      client.join(`user_${data.userId}`);
    }
  }
}
