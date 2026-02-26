import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Message } from "../entities/message.entity";
import { Repository } from "typeorm";
import { User } from '../entities/user.entity';
import { In } from 'typeorm'

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,

        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    // 1. บันทึกข้อความ (ใช้ทั้ง User และ Admin)
    async saveMessage(content: string, senderId: string, receiverId?: string): Promise<Message> {
        const newMessage = this.messageRepository.create({
            content,
            senderId,
            receiverId,
        });

        const saved = await this.messageRepository.save(newMessage);

        // โหลด Relation (sender/receiver) กลับไปทันที เพื่อให้ Frontend แสดงชื่อ/รูปได้เลย
        const message = await this.messageRepository.findOne({
            where: { id: saved.id },
            relations: ['sender', 'receiver'],
        });

        if (!message) {
            throw new Error('Failed to load message relations');
        }

        return message;
    }

    // 2. ดึงข้อความทั้งหมดของ User คนนั้น (Support 1-on-1 Chat)
    async getMessagesByUser(userId: string): Promise<Message[]> {
        return await this.messageRepository.find({
            where: [
                { senderId: userId },   // ข้อความที่ User ส่ง
                { receiverId: userId }, // ข้อความที่ Admin ตอบกลับหา User
            ],
            relations: ['sender', 'receiver'], // ⭐ จำเป็นมากสำหรับแสดงผลฝั่งซ้าย/ขวา
            order: { createdAt: 'ASC' },       // เรียงจากเก่าไปใหม่
        });
    }

    // 3. ดึงรายชื่อลูกค้าที่เคยทักมา (Contacts) สำหรับหน้า Admin Dashboard
    async getChatContacts(): Promise<User[]> {
        // ใช้ QueryBuilder เพื่อดึงเฉพาะ User ที่เคยส่งข้อความมา โดยเรียงตามเวลาล่าสุด
        const latestMessages = await this.messageRepository.createQueryBuilder('message')
            .select('message.senderId', 'senderId')             // เลือก ID ผู้ส่ง
            .addSelect('MAX(message.createdAt)', 'lastMessageTime') // เวลาข้อความล่าสุด
            .innerJoin('message.sender', 'sender')
            .innerJoin('sender.role', 'role')
            .where('role.name = :userRole', { userRole: 'USER' }) // ✅ กรองเอาเฉพาะ User (ตัด Admin ออก)
            .groupBy('message.senderId')
            .orderBy('"lastMessageTime"', 'DESC') // เรียงคนทักล่าสุดไว้บนสุด
            .getRawMany();

        if (!latestMessages.length) return [];

        const userIds = latestMessages.map(m => m.senderId);

        // ดึงข้อมูลรายละเอียดของ User (ชื่อ, รูป, อีเมล) จาก ID ที่หาได้
        const users = await this.userRepository.find({
            where: { id: In(userIds) },
            relations: ['role']
        });

        // จัดเรียง Users ให้ตรงตามลำดับเวลา (เพราะ .find ไม่การันตีลำดับ)
        return userIds.map(id => users.find(u => u.id === id)).filter(Boolean) as User[];
    }

    // 4. ฟังก์ชันหาตัว Admin (สำหรับกรณี User ทักมาแล้วระบบต้อง Assign ให้ Admin รับอัตโนมัติ)
    async getAdminUser(): Promise<User> {
        // ✅ แก้ไข: ใช้ 'ADMIN' (ตัวใหญ่) ให้ตรงกับ Seed Data ใน AppService
        const admin = await this.userRepository.findOne({
            where: { role: { name: 'ADMIN' } },
            relations: ['role'],
        });

        // Fallback: ถ้าหาตัวใหญ่ไม่เจอ ลองหาตัวเล็ก (กันเหนียว)
        if (!admin) {
            const adminLower = await this.userRepository.findOne({ where: { role: { name: 'admin' } } });
            if (adminLower) return adminLower;
            
            throw new Error('Admin user not found in database. Please check seeding.');
        }

        return admin;
    }
}