import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, Send, Image as ImageIcon, Minus } from 'lucide-react';
// 1. นำเข้า useAuth เพื่อดึงข้อมูล user จริงที่ Login อยู่
import { useAuth } from '../features/auth/context/AuthContext'; 

interface ChatMessage {
  id: string;
  senderType: 'user' | 'admin';
  text: string;
  timestamp: Date;
  isImage?: boolean;
}

export default function ChatWidget() {
  const { user } = useAuth(); // 2. ดึงข้อมูล User จากระบบ
  const [isOpen, setIsOpen] = useState(false);
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3. เชื่อมต่อ Socket และจัดการการรับข้อความ
  useEffect(() => {
    // เปลี่ยนเป็น URL ของ Backend คุณ
    const newSocket = io('http://localhost:3000'); 
    setSocket(newSocket);

    newSocket.on('receiveMessage', (msg: any) => {
      // ตรวจสอบว่าเป็นข้อความของฉันหรือไม่ โดยเทียบกับ user.id จริงในระบบ
      const isMe = msg.sender?.id === user?.id;
      const isImg = msg.content && msg.content.startsWith('data:image');

      setMessages((prev) => [...prev, {
        id: msg.id || Math.random().toString(),
        senderType: isMe ? 'user' : 'admin',
        text: msg.content,
        timestamp: new Date(msg.createdAt || Date.now()),
        isImage: isImg
      }]);
    });

    return () => { newSocket.disconnect(); };
  }, [user?.id]); // Re-connect เมื่อ User ID เปลี่ยน

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !socket || !user) return;
    
    sendMessage(input);
    setInput('');
  };

  const sendMessage = (content: string) => {
    if (!user?.id) {
        alert("กรุณาเข้าสู่ระบบก่อนใช้งานแชท");
        return;
    }
    socket?.emit('sendMessage', {
      content: content,
      senderId: user.id, // 4. ใช้ ID จริงจาก AuthContext
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // จำกัดขนาด 1MB
        alert("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        sendMessage(base64String); 
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // ถ้ายังไม่ Login ไม่ต้องโชว์ปุ่มแชท (หรือจะโชว์แล้วเด้งไปหน้า Login ก็ได้)
  if (!user) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-[#00A699] hover:bg-[#008c82] text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50 animate-bounce-subtle"
      >
        <MessageCircle size={32} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[360px] h-[550px] bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-gray-100 z-50 font-sans animate-in slide-in-from-bottom-5 duration-300">
      
      {/* Header - เปลี่ยนสีให้เข้ากับธีมหลัก */}
      <div className="bg-[#00A699] p-5 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=RoamHub" alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#00A699] rounded-full"></div>
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">ฝ่ายบริการลูกค้า</h3>
            <p className="text-white/80 text-[10px]">ออนไลน์พร้อมช่วยเหลือ</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition">
          <Minus size={20} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-[#F9FAFB] p-4 overflow-y-auto flex flex-col gap-3" ref={scrollRef}>
        {messages.map((msg, idx) => {
          const isUser = msg.senderType === 'user';
          return (
            <div key={`${msg.id}-${idx}`} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                 <div className="w-7 h-7 rounded-full bg-[#00A699]/10 flex items-center justify-center text-[10px] text-[#00A699] font-bold mr-2 mt-auto mb-1">RH</div>
              )}
              
              <div className={`max-w-[80%] p-3 text-[13px] leading-relaxed shadow-sm ${
                isUser 
                  ? 'bg-[#00A699] text-white rounded-[18px] rounded-tr-[2px]' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-[18px] rounded-tl-[2px]'
              }`}>
                {msg.isImage ? (
                  <img src={msg.text} alt="sent image" className="rounded-lg max-w-full" />
                ) : (
                  msg.text
                )}
                
                <div className={`text-[9px] mt-1 text-right opacity-70 ${isUser ? 'text-white' : 'text-gray-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-50 shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-[#00A699] transition"
          >
            <ImageIcon size={22} />
          </button>

          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="สอบถามข้อมูลเพิ่มเติม..." 
              className="bg-transparent w-full text-xs focus:outline-none text-gray-700 placeholder-gray-400"
            />
          </div>

          <button 
            type="submit" 
            disabled={!input.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              input.trim() ? 'bg-[#00A699] text-white shadow-lg' : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send size={18} className={input.trim() ? 'translate-x-0.5' : ''} />
          </button>
        </form>
      </div>

    </div>
  );
}