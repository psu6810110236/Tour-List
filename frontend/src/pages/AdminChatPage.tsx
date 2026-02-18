import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageSquare, Send, Image as ImageIcon } from 'lucide-react';

// ⚠️ ใส่ UUID ของ Admin ที่มีอยู่จริงใน DB (เพื่อใช้ส่งข้อความตอบกลับ)
const ADMIN_ID = "ใส่-UUID-ของ-Admin-ที่นี่"; 

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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedUser, setSelectedUser] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. เชื่อมต่อ Socket และโหลดรายชื่อ
  useEffect(() => {
    fetch('http://localhost:3000/chat/contacts')
      .then(res => res.json())
      .then(data => setContacts(data));

    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('receiveMessage', (msg: any) => {
      // เมื่อมีข้อความใหม่เข้ามา ให้เพิ่มลงในแชททันที
      setMessages(prev => [...prev, msg]); 
    });

    return () => { newSocket.disconnect(); };
  }, []);

  // 2. โหลดข้อความเก่าเมื่อคลิกเลือก User
  useEffect(() => {
    if (!selectedUser) return;
    
    fetch(`http://localhost:3000/chat/messages/${selectedUser.id}`)
      .then(res => res.json())
      .then(data => setMessages(data));
      
  }, [selectedUser]);

  // 3. Auto Scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, selectedUser]);

  // 4. ส่งข้อความตอบกลับ
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !selectedUser) return;

    socket.emit('sendMessage', {
      content: input,
      senderId: ADMIN_ID,
      receiverId: selectedUser.id // ระบุว่าส่งหาลูกค้าคนนี้
    });

    setInput('');
  };

  // กรองข้อความให้แสดงเฉพาะของห้องที่เปิดอยู่ (User ที่เลือก + Admin ตอบ)
  const filteredMessages = messages.filter(m => 
    selectedUser && (m.sender.id === selectedUser.id || (m.sender.id === ADMIN_ID))
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar รายชื่อ */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 bg-blue-600 text-white shadow-sm z-10">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare size={20} /> Admin Dashboard
          </h1>
          <p className="text-xs text-blue-100 mt-1">รายการลูกค้าที่ติดต่อเข้ามา</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {contacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => setSelectedUser(contact)}
              className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                selectedUser?.id === contact.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                {contact.fullName ? contact.fullName.charAt(0) : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-gray-800 truncate">{contact.fullName}</p>
                <p className="text-xs text-gray-500 truncate">{contact.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#F3F4F6]">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 border-b shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  {selectedUser.fullName ? selectedUser.fullName.charAt(0) : 'U'}
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">{selectedUser.fullName}</h2>
                  <p className="text-xs text-green-500 flex items-center gap-1">● Online</p>
                </div>
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4" ref={scrollRef}>
              {filteredMessages.map((msg, idx) => {
                const isAdmin = msg.sender.id === ADMIN_ID;
                const isImage = msg.content.startsWith('data:image');

                return (
                  <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[60%] p-4 rounded-2xl shadow-sm ${
                      isAdmin 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-white text-gray-800 rounded-tl-sm'
                    }`}>
                      {isImage ? (
                        <img src={msg.content} alt="sent" className="rounded-lg max-w-sm" />
                      ) : (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      )}
                      <p className={`text-[10px] mt-2 text-right ${isAdmin ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
              <form onSubmit={handleSend} className="flex gap-3 items-center max-w-4xl mx-auto">
                <button type="button" className="text-gray-400 hover:text-blue-600">
                  <ImageIcon size={24} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="พิมพ์ข้อความตอบกลับ..."
                  className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-105 disabled:bg-gray-300"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={64} className="mb-4 text-gray-300 opacity-50" />
            <p className="text-lg font-medium">เลือกรายชื่อทางซ้ายเพื่อเริ่มสนทนา</p>
          </div>
        )}
      </div>
    </div>
  );
}