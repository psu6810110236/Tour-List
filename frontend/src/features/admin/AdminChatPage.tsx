import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageSquare, Send, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../auth/context/AuthContext'; // นำเข้าเพื่อดึง ID แอดมินจริง

interface Contact {
  id: string;
  fullName: string;
  email: string;
}

interface Message {
  id: string;
  content: string;
  sender: { id: string; fullName: string };
  createdAt: string;
}

export default function AdminChatPage() {
  const { user } = useAuth(); // ดึงข้อมูลแอดมินที่ Login อยู่
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedUser, setSelectedUser] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. เชื่อมต่อ Socket และโหลดรายชื่อลูกค้าที่มีการแชท
  useEffect(() => {
    if (!user) return;

    fetch('http://localhost:3000/chat/contacts')
      .then(res => res.json())
      .then(data => setContacts(data))
      .catch(err => console.error("Error fetching contacts:", err));

    const newSocket = io('http://localhost:3000', {
      query: {
        role: 'admin',
        userId: user.id,
      },
    });

    newSocket.on('receiveMessage', (msg: any) => {
      setMessages(prev => [...prev, msg]);
    });

    setSocket(newSocket);

    return () => { newSocket.disconnect(); };
  }, [user]);

  // 2. โหลดข้อความเก่าเมื่อคลิกเลือก User
  useEffect(() => {
    if (!selectedUser) return;

    fetch(`http://localhost:3000/chat/messages/${selectedUser.id}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error("Error fetching messages:", err));

  }, [selectedUser]);

  // 3. Auto Scroll ลงล่างสุด
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedUser]);

  // 4. ส่งข้อความตอบกลับหาลูกค้า
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !selectedUser || !user) return;

    const newMsg: Message = {
      id: Date.now().toString(), // temp id
      content: input,
      sender: {
        id: user.id,
        fullName: user.fullName || 'Admin'
      },
      createdAt: new Date().toISOString()
    };

    // ⭐ แสดงข้อความทันทีในแชท (สำคัญ)
    setMessages(prev => [...prev, newMsg]);

    socket.emit('sendMessage', {
      content: input,
      senderId: user.id,
      receiverId: selectedUser.id
    });

    setInput('');
  };

  // กรองข้อความให้แสดงเฉพาะคู่สนทนาระหว่าง แอดมิน และ ลูกค้าที่เลือก
  const filteredMessages = messages.filter(m =>
    selectedUser && (m.sender.id === selectedUser.id || m.sender.id === user?.id)
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar รายชื่อลูกค้า */}
      <div className="w-85 bg-white border-r border-gray-200 flex flex-col shadow-lg z-10">
        <div className="p-6 bg-[#00A699] text-white">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare size={24} /> ข้อความจากลูกค้า
          </h1>
          <p className="text-xs text-white/80 mt-2">จัดการการตอบกลับลูกค้าทั้งหมดที่นี่</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {contacts.length > 0 ? (
            contacts.map(contact => (
              <div
                key={contact.id}
                onClick={() => setSelectedUser(contact)}
                className={`p-5 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-all flex items-center gap-4 ${selectedUser?.id === contact.id ? 'bg-[#00A699]/5 border-l-4 border-[#00A699]' : ''
                  }`}
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[#00A699] font-bold text-lg">
                  {contact.fullName?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="flex justify-between items-center">
                    <p className={`font-bold truncate ${selectedUser?.id === contact.id ? 'text-[#00A699]' : 'text-gray-800'}`}>
                      {contact.fullName}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-gray-400 text-sm">ยังไม่มีลูกค้าทักแชทเข้ามา</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-5 border-b flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#00A699]/10 text-[#00A699] rounded-full flex items-center justify-center font-bold text-lg border border-[#00A699]/20">
                  {selectedUser.fullName?.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">{selectedUser.fullName}</h2>
                  <p className="text-xs text-[#00A699] font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#00A699] rounded-full animate-pulse"></span>
                    กำลังสนทนา
                  </p>
                </div>
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 bg-[#F9FAFB]" ref={scrollRef}>
              {filteredMessages.map((msg, idx) => {
                const isAdmin = msg.sender.id === user?.id;
                const isImage = msg.content.startsWith('data:image');

                return (
                  <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[65%] p-4 rounded-2xl shadow-sm ${isAdmin
                      ? 'bg-[#00A699] text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
                      }`}>
                      {isImage ? (
                        <img src={msg.content} alt="sent" className="rounded-lg max-w-sm" />
                      ) : (
                        <p className="text-[14px] leading-relaxed font-medium">{msg.content}</p>
                      )}
                      <p className={`text-[10px] mt-2 font-medium ${isAdmin ? 'text-white/70' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-100">
              <form onSubmit={handleSend} className="flex gap-4 items-center max-w-5xl mx-auto">
                <button type="button" className="text-gray-400 hover:text-[#00A699] transition-colors">
                  <ImageIcon size={28} />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="พิมพ์ข้อความตอบกลับลูกค้า..."
                    className="w-full bg-gray-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#00A699]/50 outline-none text-sm font-medium transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-[#00A699] hover:bg-[#008c82] text-white p-4 rounded-2xl shadow-lg shadow-[#00A699]/20 transition-all hover:scale-105 disabled:bg-gray-300 disabled:shadow-none"
                >
                  <Send size={24} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <MessageSquare size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">ระบบแอดมินแชท</h3>
            <p className="text-sm font-medium">กรุณาเลือกรายชื่อลูกค้าทางด้านซ้ายเพื่อเริ่มการสนทนา</p>
          </div>
        )}
      </div>
    </div>
  );
}