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

    // เข้าห้องส่วนตัวตาม ID
    if (userId) {
      client.join(`user_${userId}`);
      console.log(`Client ${client.id} joined room: user_${userId}`);
    }

    // Admin เข้าห้องกลางด้วย เพื่อรับ notification
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
    // ใช้ senderId จาก handshake แทน payload เพื่อกัน spoof ID
    const senderId =
      (client.handshake.query.userId as string) || payload.senderId;
    const role = client.handshake.query.role as string;
    let { content, receiverId } = payload;

    const isAdminSender = role === 'admin' || role === 'ADMIN';

    // ถ้าไม่มีผู้รับ ให้ส่งหา Admin อัตโนมัติ
    if (!receiverId) {
      const admin = await this.chatService.getAdminUser();
      if (admin) {
        receiverId = admin.id;
      }
    }

    // บันทึกลง Database
    const saved = await this.chatService.saveMessage(content, senderId, receiverId);

    if (isAdminSender) {
      // Admin ส่ง → emit หาห้อง admin_room (ตัวเอง) และห้อง user ที่รับ
      // ไม่ emit user_${senderId} เพราะ admin อยู่ใน admin_room อยู่แล้ว
      this.server.to('admin_room').emit('receiveMessage', saved);
      if (receiverId) {
        this.server.to(`user_${receiverId}`).emit('receiveMessage', saved);
      }
    } else {
      // User ส่ง → emit หาห้อง user ตัวเอง และ admin_room
      // ไม่ emit user_${receiverId} (adminId) ซ้ำ เพราะ admin รับผ่าน admin_room แล้ว
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