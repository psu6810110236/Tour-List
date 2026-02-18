import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, Send, Image as ImageIcon, Minus } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderType: 'user' | 'admin';
  text: string;
  timestamp: Date;
  isImage?: boolean; // เพิ่มตัวเช็คว่าเป็นรูปไหม
}

// ⚠️ สำคัญมาก: ต้องเปลี่ยนตรงนี้เป็น UUID ที่มีอยู่จริงในตาราง User ของคุณ
// ถ้าใช้ ID มั่วๆ ระบบจะบันทึกไม่ได้ และข้อความจะไม่ขึ้น
const CURRENT_USER_ID = "ใส่-UUID-จาก-Database-ของคุณที่นี่"; 

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  // ข้อความเริ่มต้น (Static)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      senderType: 'admin',
      text: 'สวัสดีครับ! 🙏 RoamHub Tour ยินดีให้บริการ สนใจทัวร์ไหนสอบถามได้เลยนะครับ',
      timestamp: new Date(),
      isImage: false,
    }
  ]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref สำหรับซ่อนปุ่มเลือกไฟล์

  // 1. เชื่อมต่อ Socket เมื่อเปิดหน้าเว็บ
  useEffect(() => {
    const newSocket = io('http://localhost:3000'); // เช็คว่า Backend รันที่ Port 3000
    setSocket(newSocket);

    // รอรับข้อความจาก Server
    newSocket.on('receiveMessage', (msg: any) => {
      const isMe = msg.sender.id === CURRENT_USER_ID;
      
      // เช็คว่าข้อความนี้เป็นรูปภาพหรือไม่ (ดูว่าขึ้นต้นด้วย data:image หรือไม่)
      const isImg = msg.content && msg.content.startsWith('data:image');

      setMessages((prev) => [...prev, {
        id: msg.id,
        senderType: isMe ? 'user' : 'admin',
        text: msg.content,
        timestamp: new Date(msg.createdAt),
        isImage: isImg
      }]);
    });

    return () => { newSocket.disconnect(); };
  }, []);

  // 2. เลื่อนหน้าจอลงล่างสุดเสมอเมื่อมีข้อความใหม่
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isOpen]);

  // 3. ฟังก์ชันส่งข้อความ (ตัวอักษร)
  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !socket) return;
    
    sendMessage(input); // ส่งข้อความ
    setInput('');
  };

  // 4. ฟังก์ชันกลางสำหรับส่งข้อมูลเข้า Socket (ใช้ได้ทั้ง Text และ Image)
  const sendMessage = (content: string) => {
    socket?.emit('sendMessage', {
      content: content,
      senderId: CURRENT_USER_ID, 
    });
  };

  // 5. ฟังก์ชันเลือกรูปภาพและแปลงเป็น Base64
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      // เมื่อแปลงไฟล์เสร็จแล้ว ให้ส่งข้อมูล Base64 ไปเหมือนข้อความปกติ
      reader.onloadend = () => {
        const base64String = reader.result as string;
        sendMessage(base64String); 
      };
      reader.readAsDataURL(file); // เริ่มแปลงไฟล์
    }
    // เคลียร์ค่า input เพื่อให้เลือกรูปเดิมซ้ำได้ถ้าต้องการ
    e.target.value = '';
  };

  // --- ส่วนแสดงผล (UI) ---

  // สถานะปิด: โชว์ปุ่มวงกลม
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 z-50"
      >
        <MessageCircle size={32} />
        {/* จุดแดงแจ้งเตือน (Simulation) */}
        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
      </button>
    );
  }

  // สถานะเปิด: โชว์หน้าต่างแชท
  return (
    <div className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-gray-100 z-50 font-sans animate-in slide-in-from-bottom-10 duration-300">
      
      {/* Header */}
      <div className="bg-blue-600 p-5 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center overflow-hidden">
               {/* รูป Admin */}
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-600 rounded-full"></div>
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight">Admin Support</h3>
            <p className="text-blue-100 text-xs">ตอบกลับทันที</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition">
          <Minus size={24} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-[#F8F9FA] p-4 overflow-y-auto flex flex-col gap-4" ref={scrollRef}>
        {messages.map((msg) => {
          const isUser = msg.senderType === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              
              {/* รูป Avatar สำหรับ Admin */}
              {!isUser && (
                 <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-bold mr-2 mt-auto">RH</div>
              )}
              
              <div className={`max-w-[75%] p-3.5 text-sm leading-relaxed shadow-sm ${
                isUser 
                  ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm'
              }`}>
                {/* ถ้าเป็นรูป ให้แสดง tag img ถ้าเป็นข้อความ ให้แสดง text */}
                {msg.isImage ? (
                  <img src={msg.text} alt="sent image" className="rounded-lg max-w-full border border-white/20" />
                ) : (
                  msg.text
                )}
                
                <div className={`text-[10px] mt-1 text-right ${isUser ? 'text-blue-200' : 'text-gray-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-50 shrink-0">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          
          {/* Input file ซ่อนอยู่ (Hidden) */}
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
          />
          
          {/* ปุ่มกดเพื่อเรียก Input file */}
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-blue-600 transition mb-1"
          >
            <ImageIcon size={24} />
          </button>

          {/* ช่องพิมพ์ข้อความ */}
          <div className="flex-1 bg-gray-100 rounded-[24px] px-4 py-3 flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="พิมพ์ข้อความ..." 
              className="bg-transparent w-full text-sm focus:outline-none text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* ปุ่มส่ง */}
          <button 
            type="submit" 
            disabled={!input.trim()}
            className={`${input.trim() ? 'bg-blue-600 hover:scale-105' : 'bg-gray-300'} text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all mb-1`}
          >
            <Send size={20} className={input.trim() ? 'ml-1' : ''} />
          </button>
        </form>
      </div>

    </div>
  );
}