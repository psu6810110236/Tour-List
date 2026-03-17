import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageSquare, Send, ArrowLeft, Paperclip, X } from 'lucide-react';
import { useAuth } from '../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedUser, setSelectedUser] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [fileErrorPopup, setFileErrorPopup] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  
  // Ref สำหรับตัวกล่อง Scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  // 🌟 Ref สำหรับ Dummy div ที่อยู่ล่างสุดของแชท
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const fetchContacts = useCallback(() => {
    fetch(`${API_URL}/chat/contacts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setContacts(data))
      .catch((err) => console.error('Error fetching contacts:', err));
  }, [token]);

  // --- 🌟 ฟังก์ชันเลื่อนลงล่างสุดที่รองรับทั้ง Desktop และ Mobile ---
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    fetchContacts();

    const newSocket = io(API_URL, {
      query: { role: 'admin', userId: user.id },
    });

    newSocket.on('receiveMessage', (msg: any) => {
      setSelectedUser((currentSelected) => {
        const isCurrentChat =
          currentSelected &&
          (msg.senderId === currentSelected.id ||
            msg.receiverId === currentSelected.id);

        if (isCurrentChat) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          setTimeout(scrollToBottom, 100);
        } else {
          if (msg.senderId !== user.id) {
            setUnreadCounts((prev) => ({
              ...prev,
              [msg.senderId]: (prev[msg.senderId] || 0) + 1,
            }));
          }
          fetchContacts();
        }
        return currentSelected;
      });
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [user, fetchContacts, scrollToBottom]);

  useEffect(() => {
    if (!selectedUser) return;
    setUnreadCounts((prev) => ({ ...prev, [selectedUser.id]: 0 }));
    setPreviewImage(null);

    fetch(`${API_URL}/chat/messages/${selectedUser.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        setTimeout(scrollToBottom, 150);
      })
      .catch((err) => console.error('Error fetching messages:', err));
  }, [selectedUser, token, scrollToBottom]);

  // 🌟 คอยเช็คว่าถ้า messages เปลี่ยน ให้พยายามเลื่อนจอ
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, previewImage, scrollToBottom]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !previewImage) || !socket || !selectedUser || !user)
      return;

    if (previewImage) {
      socket.emit('sendMessage', {
        content: previewImage,
        senderId: user.id,
        receiverId: selectedUser.id,
      });
      setPreviewImage(null);
    }

    if (input.trim()) {
      socket.emit('sendMessage', {
        content: input,
        senderId: user.id,
        receiverId: selectedUser.id,
      });
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
    
    setTimeout(scrollToBottom, 100);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !socket || !selectedUser || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      setFileErrorPopup(true);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
      setTimeout(scrollToBottom, 100);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ---- Sidebar (รายชื่อลูกค้า) ----
  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-6 bg-[#00A699] shrink-0">
        <div className="flex items-center gap-3 md:gap-4 mb-1">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 text-white/90 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
            title="กลับไปหน้าหลัก"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg md:text-xl font-bold text-white tracking-wide">
            กล่องข้อความ
          </h1>
        </div>
        <p className="text-xs md:text-sm text-teal-100/80 ml-11">
          ตอบกลับลูกค้าแบบเรียลไทม์
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {contacts.length === 0 && (
          <p className="text-center text-slate-400 text-sm mt-8">
            ยังไม่มีข้อความ
          </p>
        )}
        {contacts.map((contact) => {
          const isSelected = selectedUser?.id === contact.id;
          const unread = unreadCounts[contact.id] || 0;

          return (
            <div
              key={contact.id}
              onClick={() => setSelectedUser(contact)}
              className={`p-3 rounded-2xl cursor-pointer flex items-center gap-3.5 transition-all duration-200 group ${
                isSelected
                  ? 'bg-white shadow-[0_4px_20px_rgba(0,166,153,0.12)] ring-1 ring-[#00A699]/20'
                  : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="relative shrink-0">
                <div
                  className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${
                    isSelected
                      ? 'bg-[#00A699] text-white shadow-md'
                      : 'bg-teal-50 text-[#00A699] group-hover:bg-teal-100'
                  }`}
                >
                  {contact.fullName?.charAt(0).toUpperCase()}
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                    isSelected ? 'bg-green-400' : 'bg-slate-300'
                  }`}
                ></div>
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center border-2 border-white font-bold shadow-sm px-0.5">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p
                  className={`font-semibold truncate text-[14px] md:text-[15px] ${
                    isSelected ? 'text-[#00A699]' : 'text-slate-700'
                  }`}
                >
                  {contact.fullName}
                </p>
                <p className="text-[12px] md:text-[13px] text-slate-400 truncate mt-0.5">
                  {contact.email}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ---- Chat Area ----
  const ChatArea = (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-0 overflow-hidden">
      {selectedUser ? (
        <>
          {/* Chat Header */}
          <div className="bg-white/80 backdrop-blur-md px-4 md:px-8 py-3 md:py-4 border-b border-slate-200/60 flex items-center gap-3 shadow-sm z-10 shrink-0">
            {/* ปุ่มย้อนกลับ — แสดงเฉพาะมือถือ */}
            <button
              onClick={() => setSelectedUser(null)}
              className="md:hidden p-1.5 text-slate-500 hover:text-[#00A699] hover:bg-teal-50 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-[#00A699] font-bold text-base border border-teal-100 shrink-0">
              {selectedUser.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-800 text-base md:text-lg leading-tight truncate">
                {selectedUser.fullName}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-green-500 rounded-full shrink-0"></span>
                <span className="text-[12px] md:text-[13px] font-medium text-slate-500">
                  กำลังออนไลน์
                </span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6 flex flex-col gap-4 md:gap-5 scroll-smooth"
            ref={scrollRef}
          >
            {messages.map((msg, idx) => {
              const isAdmin = msg.senderId !== selectedUser.id;
              const isImage = msg.content.startsWith('data:image');

              return (
                <div
                  key={msg.id || idx}
                  className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex flex-col max-w-[80%] md:max-w-[65%]">
                    <div
                      className={`px-4 md:px-5 py-3 md:py-3.5 shadow-sm ${
                        isAdmin
                          ? 'bg-[#00A699] text-white rounded-[20px] rounded-br-sm'
                          : 'bg-white text-slate-700 border border-slate-100 rounded-[20px] rounded-bl-sm'
                      }`}
                    >
                      {isImage ? (
                        <img
                          src={msg.content}
                          alt="sent"
                          className="rounded-xl max-w-full max-h-60 md:max-h-72 object-cover border border-white/10 cursor-zoom-in hover:opacity-90 transition"
                          onClick={() => setEnlargedImage(msg.content)}
                        />
                      ) : (
                        <p className="text-[14px] md:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-[10px] md:text-[11px] font-medium mt-1 text-slate-400 ${
                        isAdmin ? 'text-right mr-1' : 'text-left ml-1'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      น.
                    </span>
                  </div>
                </div>
              );
            })}
            {/* 🌟 Dummy div ที่อยู่ล่างสุดเสมอ */}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-slate-100 z-10 flex flex-col shrink-0">
            {previewImage && (
              <div className="px-4 md:px-8 pt-3 pb-1">
                <div className="relative inline-block">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-20 md:h-24 rounded-xl shadow-sm border border-slate-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewImage(null)}
                    className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1.5 shadow-md hover:bg-rose-600 transition-colors"
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            <div className="p-3 md:p-6 md:pt-4">
              <form onSubmit={handleSend} className="max-w-4xl mx-auto">
                <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-[24px] p-2 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#00A699]/10 focus-within:border-[#00A699]/40 transition-all duration-300">
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
                    className="p-2 ml-1 text-slate-400 hover:text-[#00A699] hover:bg-teal-50 rounded-full mb-1 shrink-0"
                  >
                    <Paperclip size={18} />
                  </button>

                  <textarea
                    ref={textareaRef}
                    value={input}
                    rows={1}
                    maxLength={500}
                    onChange={(e) => {
                      setInput(e.target.value);
                      adjustHeight();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder={
                      previewImage
                        ? 'พิมพ์ข้อความแนบไปกับรูปภาพ...'
                        : 'พิมพ์ข้อความตอบกลับ...'
                    }
                    className="flex-1 bg-transparent text-slate-700 px-2 py-2 outline-none resize-none overflow-y-auto max-h-[120px] text-[14px] md:text-[15px] scrollbar-hide"
                  />

                  <div className="text-[10px] text-slate-400 mb-2.5 px-1 font-mono shrink-0">
                    {input.length}/500
                  </div>

                  <button
                    type="submit"
                    disabled={!input.trim() && !previewImage}
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 mb-1 transition-all ${
                      input.trim() || previewImage
                        ? 'bg-[#00A699] text-white shadow-md'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <Send size={16} className={input.trim() || previewImage ? 'ml-0.5' : ''} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      ) : (
        // Empty state
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-[#F8FAFC]">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#00A699] blur-2xl opacity-10 rounded-full"></div>
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white shadow-lg shadow-slate-200/50 border border-slate-100 rounded-full flex items-center justify-center relative z-10">
              <MessageSquare size={36} className="text-[#00A699]" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-700 mb-2">
            เลือกลูกค้าเพื่อเริ่มแชท
          </h3>
          <p className="text-[14px] md:text-[15px] text-slate-500 max-w-xs text-center px-4">
            คลิกที่รายชื่อทางด้านซ้ายเพื่อดูประวัติการสนทนาและตอบกลับข้อความ
          </p>
        </div>
      )}
    </div>
  );

  // 🌟 ส่วนโครงสร้างที่แก้เพื่อให้ Render ครั้งเดียว และ ref ไม่ชนกัน 🌟
  return (
    <div className="flex h-screen bg-[#F4F7F6] font-sans text-slate-800 overflow-hidden">
      
      {/* 1. Sidebar */}
      <div
        className={`${
          selectedUser ? 'hidden md:flex' : 'flex'
        } w-full md:w-[320px] bg-white border-r border-slate-200/60 flex-col shadow-[2px_0_15px_rgba(0,0,0,0.02)] z-10 shrink-0 h-full`}
      >
        {SidebarContent}
      </div>

      {/* 2. Chat Area */}
      <div
        className={`${
          !selectedUser ? 'hidden md:flex' : 'flex'
        } w-full md:flex-1 h-full flex-col min-w-0`}
      >
        {ChatArea}
      </div>

      {/* Modal & Popups */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <button
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
            onClick={() => setEnlargedImage(null)}
          >
            <X size={20} />
          </button>
          <img
            src={enlargedImage}
            alt="enlarged"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {fileErrorPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 mx-4 shadow-2xl text-center max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 mb-1">ไฟล์มีขนาดใหญ่เกินไป</p>
            <p className="text-sm text-gray-500 mb-4">กรุณาเลือกรูปที่มีขนาดไม่เกิน 2MB</p>
            <button
              onClick={() => setFileErrorPopup(false)}
              className="w-full bg-[#00A699] hover:bg-[#008c81] text-white py-2 rounded-xl font-semibold text-sm transition"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}