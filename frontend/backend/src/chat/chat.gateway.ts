import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { ChatService } from "./chat.service";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) { }

    // ✅ แก้ไข: ให้ทุกคนเข้าห้องส่วนตัว (user_xxx) เสมอ ไม่ว่าจะเป็น Role อะไร
    handleConnection(client: Socket) {
        const userId = client.handshake.query.userId as string;
        const role = client.handshake.query.role as string;

        // 1. เข้าห้องส่วนตัวตาม ID (สำคัญมาก เพื่อให้รับข้อความ 1-1 ได้)
        if (userId) {
            client.join(`user_${userId}`);
            console.log(`Client ${client.id} joined room: user_${userId}`);
        }

        // 2. ถ้าเป็น Admin ให้เข้าห้องกลาง admin_room ด้วย (เพื่อรับ Notification เวลามีลูกค้าใหม่ทักมา)
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
        let { senderId, content, receiverId } = payload;

        // 1. ถ้าไม่มีผู้รับ (User ทักมาลอยๆ) ให้ส่งหา Admin
        if (!receiverId) {
            const admin = await this.chatService.getAdminUser();
            if (admin) {
                receiverId = admin.id;
            }
        }

        // 2. บันทึกลง Database
        const saved = await this.chatService.saveMessage(
            content,
            senderId,
            receiverId
        );

        // 3. ส่งกลับหา "ผู้ส่ง" (เพื่อให้หน้าจอคนส่งอัปเดต)
        this.server.to(`user_${senderId}`).emit('receiveMessage', saved);

        // 4. ส่งหา "ผู้รับ" (User ปลายทาง หรือ Admin)
        if (receiverId) {
            this.server.to(`user_${receiverId}`).emit('receiveMessage', saved);
        }

        // 5. แจ้งเตือนห้อง Admin รวม (เผื่อ Admin คนอื่นที่ online อยู่แต่ไม่ได้เปิดห้องแชทนั้น)
        // เช็คว่าถ้าคนส่งไม่ใช่ Admin (คือ User ทักมา) ให้แจ้งเตือนเข้าห้อง Admin
        const isAdminSender = senderId === receiverId; // หรือเช็คจาก role ใน payload ถ้ามี
        if (!isAdminSender) {
            this.server.to('admin_room').emit('receiveMessage', saved);
        }
    }

    // ฟังก์ชันนี้อาจไม่จำเป็นแล้วถ้า handleConnection ทำงานถูกต้อง 
    // แต่เก็บไว้สำหรับการ Join ห้องแบบ Manual ได้
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