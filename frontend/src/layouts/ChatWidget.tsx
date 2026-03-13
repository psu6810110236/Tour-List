import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, Send, Image as ImageIcon, Minus, X } from 'lucide-react'; // 🟢 นำเข้า X icon เพิ่ม
import { useAuth } from '../features/auth/context/AuthContext';

interface ChatMessage {
  id: string;
  senderType: 'user' | 'admin';
  text: string;
  timestamp: Date;
  isImage?: boolean;
}

export default function ChatWidget() {
  const { user } = useAuth();
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
  const [previewImage, setPreviewImage] = useState<string | null>(null); // 🟢 เพิ่ม State สำหรับรูปพรีวิว
  const [socket, setSocket] = useState<Socket | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      query: { role: 'user', userId: user?.id },
    });
    setSocket(newSocket);

    newSocket.on('receiveMessage', (msg: any) => {
      if (!user?.id) return;
      const isMe = msg.senderId === user.id || msg.sender?.id === user.id;

      setMessages((prev) => {
        if (prev.some(m => m.id === msg.id)) return prev;

        const isImg = msg.content && msg.content.startsWith('data:image');
        return [...prev, {
          id: msg.id,
          senderType: isMe ? 'user' : 'admin',
          text: msg.content,
          timestamp: new Date(msg.createdAt || Date.now()),
          isImage: isImg
        }];
      });
    });

    return () => { newSocket.disconnect(); };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    fetch(`http://localhost:3000/chat/messages/${user.id}`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((msg: any) => ({
          id: msg.id,
          senderType: msg.senderId === user.id ? 'user' : 'admin',
          text: msg.content,
          timestamp: new Date(msg.createdAt),
          isImage: msg.content.startsWith('data:image')
        }));
        setMessages(mapped);
      })
      .catch(err => console.error('โหลดแชทล้มเหลว:', err));
  }, [user?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, previewImage]); // 🟢 เลื่อนลงเมื่อมีพรีวิว

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !previewImage) || !socket || !user) return; // 🟢 ส่งได้ถ้ามีข้อความหรือรูปภาพ

    // 🟢 ถ้ามีรูปให้ส่งรูปก่อน
    if (previewImage) {
      socket.emit('sendMessage', {
        content: previewImage,
        senderId: user.id,
      });
      setPreviewImage(null); // ล้างพรีวิว
    }

    // 🟢 ถ้ามีข้อความให้ส่งข้อความตามไป
    if (input.trim()) {
      socket.emit('sendMessage', {
        content: input,
        senderId: user.id,
      });
      setInput(''); // ล้างข้อความ
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 1024 * 1024) {
      alert("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 1MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // 🟢 นำรูปไปเก็บใน State ไว้พรีวิวก่อน ยังไม่ส่ง
      setPreviewImage(reader.result as string);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

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


  // ฟังก์ชันปรับความสูงอัตโนมัติ
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // รีเซ็ตก่อนคำนวณ
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // ปรับตามเนื้อหาจริง
    }
  };


  return (
    <div className="fixed bottom-6 right-6 w-[360px] h-[550px] bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-gray-100 z-50 font-sans animate-in slide-in-from-bottom-5 duration-300">

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

      <div className="flex-1 bg-[#F9FAFB] p-4 overflow-y-auto flex flex-col gap-3" ref={scrollRef}>
        {messages.map((msg, idx) => {
          const isUser = msg.senderType === 'user';
          return (
            <div key={`${msg.id}-${idx}`} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-[#00A699]/10 flex items-center justify-center text-[10px] text-[#00A699] font-bold mr-2 mt-auto mb-1">RH</div>
              )}
              <div className={`max-w-[80%] p-3 text-[13px] leading-relaxed shadow-sm ${isUser
                ? 'bg-[#00A699] text-white rounded-[18px] rounded-tr-[2px]'
                : 'bg-white text-gray-800 border border-gray-100 rounded-[18px] rounded-tl-[2px]'
                }`}>
                {msg.isImage ? (
                  <img src={msg.text} alt="sent image" className="rounded-lg max-w-full" />
                ) : (
                  <p className="break-all">{msg.text}</p> // 🟢 ใส่ p tag พร้อม break-all
                )}
                <div className={`text-[9px] mt-1 text-right opacity-70 ${isUser ? 'text-white' : 'text-gray-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🟢 พื้นที่สำหรับ Input และ พรีวิวรูปภาพ */}
      <div className="bg-white border-t border-gray-50 shrink-0 flex flex-col">
        {/* กล่องแสดงพรีวิว */}
        {previewImage && (
          <div className="px-4 pt-3 pb-1">
            <div className="relative inline-block">
              <img src={previewImage} alt="Preview" className="h-20 rounded-lg shadow-sm border border-gray-200 object-cover" />
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </div>
          </div>
        )}

        <div className="p-4 pt-3">
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
              className="p-2 text-gray-400 hover:text-[#00A699] transition flex-shrink-0" // 🟢 เพิ่ม flex-shrink-0
            >
              <ImageIcon size={22} />
            </button>

            {/* ปรับแต่ง Container สีเทาให้ใส่ตัวนับได้ */}
            <div className="flex-1 bg-gray-100 rounded-[20px] px-4 py-2 flex items-center">
              <textarea
                ref={textareaRef}
                value={input}
                maxLength={500}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustHeight();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                    // รีเซ็ตความสูงกลับไปเริ่มต้น
                    if (textareaRef.current) textareaRef.current.style.height = 'auto';
                  }
                }}
                rows={1}
                placeholder={previewImage ? "พิมพ์ข้อความแนบไปกับรูป..." : "สอบถามข้อมูลเพิ่มเติม..."}
                // 🟢 เปลี่ยนเป็น overflow-y-auto และเพิ่ม max-h เพื่อให้เลื่อนได้เมื่อถึงจุดที่กำหนด
                className="bg-transparent flex-1 text-xs focus:outline-none text-gray-700 placeholder-gray-400 resize-none min-h-[24px] max-h-[120px] overflow-y-auto py-1 scrollbar-hide"
              />

              <span className={`text-[9px] font-mono ml-2 shrink-0 self-end mb-1 ${input.length >= 500 ? 'text-red-500' : 'text-gray-400'}`}>
                {input.length}/500
              </span>
            </div>

            <button
              type="submit"
              disabled={!input.trim() && !previewImage}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${input.trim() || previewImage ? 'bg-[#00A699] text-white shadow-lg' : 'bg-gray-200 text-gray-400'
                }`}
            >
              <Send size={18} className={input.trim() || previewImage ? 'translate-x-0.5' : ''} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}