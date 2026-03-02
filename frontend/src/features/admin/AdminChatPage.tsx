import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageSquare, Send, Image as ImageIcon, ArrowLeft, LogOut } from 'lucide-react'; // เพิ่มไอคอน
import { useAuth } from '../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom'; // เพิ่ม Hook สำหรับเปลี่ยนหน้า

interface Contact {
  id: string;
  fullName: string;
  email: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  sender: { id: string; fullName: string };
  createdAt: string;
}

export default function AdminChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate(); // Hook สำหรับย้อนกลับ
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedUser, setSelectedUser] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref สำหรับปุ่มอัปโหลดรูป
  
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const fetchContacts = useCallback(() => {
    fetch('http://localhost:3000/chat/contacts')
      .then(res => res.json())
      .then(data => setContacts(data))
      .catch(err => console.error("Error fetching contacts:", err));
  }, []);

  useEffect(() => {
    if (!user) return;

    fetchContacts();

    const newSocket = io('http://localhost:3000', {
      query: { role: 'admin', userId: user.id },
    });

    newSocket.on('receiveMessage', (msg: any) => {
      setSelectedUser(currentSelected => {
        const isCurrentChat = currentSelected && 
          (msg.senderId === currentSelected.id || msg.receiverId === currentSelected.id);

        if (isCurrentChat) {
          setMessages(prev => {
             if (prev.some(m => m.id === msg.id)) return prev;
             return [...prev, msg];
          });
        } else {
          if (msg.senderId !== user.id) {
            setUnreadCounts(prev => ({
              ...prev,
              [msg.senderId]: (prev[msg.senderId] || 0) + 1
            }));
          }
          fetchContacts();
        }
        return currentSelected;
      });
    });

    setSocket(newSocket);
    return () => { newSocket.disconnect(); };
  }, [user, fetchContacts]);

  useEffect(() => {
    if (!selectedUser) return;
    setUnreadCounts(prev => ({ ...prev, [selectedUser.id]: 0 }));

    fetch(`http://localhost:3000/chat/messages/${selectedUser.id}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error("Error fetching messages:", err));
  }, [selectedUser]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !selectedUser || !user) return;

    socket.emit('sendMessage', {
      content: input,
      senderId: user.id,
      receiverId: selectedUser.id
    });

    setInput('');
  };

  // ฟังก์ชันส่งรูปภาพ
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !socket || !selectedUser || !user) return;

    if (file.size > 1024 * 1024) { // จำกัด 1MB
      alert("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 1MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      socket.emit('sendMessage', {
        content: base64String,
        senderId: user.id,
        receiverId: selectedUser.id
      });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar รายชื่อลูกค้า */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg z-10">
        <div className="p-6 bg-[#00A699] text-white">
          <div className="flex items-center justify-between mb-4">
             {/* 🟢 1. ปุ่มย้อนกลับไป Dashboard */}
             <button 
               onClick={() => navigate('/admin/dashboard')} 
               className="flex items-center gap-1 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition text-xs font-bold"
             >
               <ArrowLeft size={16} /> กลับ
             </button>
             <h1 className="text-lg font-bold flex items-center gap-2">
               Admin Chat
             </h1>
          </div>
          <p className="text-xs text-white/80">เลือกลูกค้าเพื่อเริ่มสนทนา</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {contacts.map(contact => {
            const isSelected = selectedUser?.id === contact.id;
            const unread = unreadCounts[contact.id] || 0;

            return (
              <div
                key={contact.id}
                onClick={() => setSelectedUser(contact)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 flex items-center gap-3 transition-colors relative ${
                  isSelected ? 'bg-[#00A699]/10 border-l-4 border-[#00A699]' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[#00A699] font-bold text-lg border border-gray-200">
                    {contact.fullName?.charAt(0)}
                  </div>
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-bold animate-pulse">
                      {unread}
                    </span>
                  )}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className={`font-bold truncate ${isSelected ? 'text-[#00A699]' : 'text-gray-800'}`}>
                    {contact.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b shadow-sm flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg text-gray-800">{selectedUser.fullName}</h2>
                <div className="flex items-center gap-2 mt-1">
                   <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                   <p className="text-xs text-gray-500">กำลังออนไลน์</p>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#F9FAFB] flex flex-col gap-3" ref={scrollRef}>
              {messages.map((msg, idx) => {
                const isAdmin = msg.senderId === user?.id;
                // 🟢 2. เช็คว่าเป็นรูปภาพหรือไม่ (ดูจาก prefix data:image)
                const isImage = msg.content.startsWith('data:image');
                
                return (
                  <div key={msg.id || idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                      isAdmin 
                        ? 'bg-[#00A699] text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}>
                      {/* แสดงรูปภาพถ้าใช่ หรือแสดงข้อความถ้าไม่ใช่ */}
                      {isImage ? (
                        <img src={msg.content} alt="sent" className="rounded-lg max-w-full max-h-64 object-contain bg-white/10" />
                      ) : (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      )}
                      
                      <p className={`text-[10px] mt-1 text-right ${isAdmin ? 'text-white/70' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSend} className="flex gap-3 items-center max-w-4xl mx-auto">
                {/* 🟢 3. ปุ่มแนบรูปภาพ */}
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
                  className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition"
                  title="แนบรูปภาพ"
                >
                  <ImageIcon size={20} />
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="พิมพ์ข้อความตอบกลับ..."
                  className="flex-1 bg-gray-100 text-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00A699]/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-[#00A699] text-white p-3 rounded-xl hover:bg-[#008c82] transition-colors shadow-md disabled:bg-gray-300 disabled:shadow-none"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
               <MessageSquare size={40} className="text-gray-300" />
            </div>
            <p className="text-lg font-medium">ยินดีต้อนรับสู่ระบบแชทผู้ดูแล</p>
            <p className="text-sm">กรุณาเลือกลูกค้าทางด้านซ้ายเพื่อเริ่มการสนทนา</p>
          </div>
        )}
      </div>
    </div>
  );
}