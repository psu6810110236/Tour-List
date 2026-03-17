import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, Send, Image as ImageIcon, Minus, X } from 'lucide-react';
import { useAuth } from '../features/auth/context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://wd04.pupasoft.com:3000';

interface ChatMessage {
  id: string;
  senderType: 'user' | 'admin';
  text: string;
  timestamp: Date;
  isImage?: boolean;
}

const getGuestId = () => {
  let guestId = localStorage.getItem('guest_chat_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('guest_chat_id', guestId);
  }
  return guestId;
};

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
    },
  ]);
  const [input, setInput] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [fileErrorPopup, setFileErrorPopup] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeUserId = user?.id || getGuestId();

  useEffect(() => {
    const newSocket = io(API_URL, {
      query: { role: 'user', userId: activeUserId },
    });
    setSocket(newSocket);

    newSocket.on('receiveMessage', (msg: any) => {
      const isMe =
        msg.senderId === activeUserId || msg.sender?.id === activeUserId;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        const isImg = msg.content && msg.content.startsWith('data:image');
        return [
          ...prev,
          {
            id: msg.id,
            senderType: isMe ? 'user' : 'admin',
            text: msg.content,
            timestamp: new Date(msg.createdAt || Date.now()),
            isImage: isImg,
          },
        ];
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [activeUserId]);

  useEffect(() => {
    fetch(`${API_URL}/chat/messages/${activeUserId}`)
      .then((res) => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const mapped = data.map((msg: any) => ({
          id: msg.id,
          senderType: (msg.senderId === activeUserId
            ? 'user'
            : 'admin') as 'user' | 'admin',
          text: msg.content,
          timestamp: new Date(msg.createdAt),
          isImage: msg.content?.startsWith('data:image') ?? false,
        }));
        setMessages(mapped);
      })
      .catch(() => {
        /* โหลดประวัติล้มเหลว — แสดงเฉพาะ welcome message */
      });
  }, [activeUserId]);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('openChatWidget', handleOpenChat);
    return () => window.removeEventListener('openChatWidget', handleOpenChat);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, previewImage]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !previewImage) || !socket) return;

    if (previewImage) {
      socket.emit('sendMessage', {
        content: previewImage,
        senderId: activeUserId,
      });
      setPreviewImage(null);
    }
    if (input.trim()) {
      socket.emit('sendMessage', {
        content: input,
        senderId: activeUserId,
      });
      setInput('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setFileErrorPopup(true);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

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
      {/* Header */}
      <div className="bg-[#00A699] p-5 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center overflow-hidden">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=RoamHub"
                alt="Admin"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#00A699] rounded-full" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">ฝ่ายบริการลูกค้า</h3>
            <p className="text-white/80 text-[10px]">ออนไลน์พร้อมช่วยเหลือ</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition"
        >
          <Minus size={20} />
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 bg-[#F9FAFB] p-4 overflow-y-auto flex flex-col gap-3"
        ref={scrollRef}
      >
        {messages.map((msg, idx) => {
          const isUser = msg.senderType === 'user';
          return (
            <div
              key={`${msg.id}-${idx}`}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-[#00A699]/10 flex items-center justify-center text-[10px] text-[#00A699] font-bold mr-2 mt-auto mb-1">
                  RH
                </div>
              )}
              <div
                className={`max-w-[80%] min-w-[80px] w-fit p-3 text-[13px] leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-[#00A699] text-white rounded-[18px] rounded-tr-[2px]'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-[18px] rounded-tl-[2px]'
                }`}
              >
                {msg.isImage ? (
                  <img
                    src={msg.text}
                    alt="sent image"
                    className="rounded-lg max-w-full cursor-zoom-in hover:opacity-90 transition"
                    onClick={() => setEnlargedImage(msg.text)}
                  />
                ) : (
                  <p className="break-words whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </p>
                )}
                <div
                  className={`text-[9px] mt-1 text-right opacity-60 ${
                    isUser ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-50 shrink-0 flex flex-col">
        {previewImage && (
          <div className="px-4 pt-3 pb-1">
            <div className="relative inline-block">
              <img
                src={previewImage}
                alt="Preview"
                className="h-20 rounded-lg shadow-sm border border-gray-200 object-cover"
              />
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
              className="p-2 text-gray-400 hover:text-[#00A699] transition flex-shrink-0"
            >
              <ImageIcon size={22} />
            </button>

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
                    if (textareaRef.current)
                      textareaRef.current.style.height = 'auto';
                  }
                }}
                rows={1}
                placeholder={
                  previewImage
                    ? 'พิมพ์ข้อความแนบไปกับรูป...'
                    : 'สอบถามข้อมูลเพิ่มเติม...'
                }
                className="bg-transparent flex-1 text-xs focus:outline-none text-gray-700 placeholder-gray-400 resize-none min-h-[24px] max-h-[120px] overflow-y-auto py-1 scrollbar-hide"
              />
              <span
                className={`text-[9px] font-mono ml-2 shrink-0 self-end mb-1 ${
                  input.length >= 500 ? 'text-red-500' : 'text-gray-400'
                }`}
              >
                {input.length}/500
              </span>
            </div>

            <button
              type="submit"
              disabled={!input.trim() && !previewImage}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                input.trim() || previewImage
                  ? 'bg-[#00A699] text-white shadow-lg'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              <Send
                size={18}
                className={input.trim() || previewImage ? 'translate-x-0.5' : ''}
              />
            </button>
          </form>
        </div>
      </div>

      {enlargedImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <button
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
            onClick={() => setEnlargedImage(null)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={enlargedImage}
            alt="enlarged"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {fileErrorPopup && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 rounded-[24px]">
          <div className="bg-white rounded-2xl p-6 mx-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 mb-1">ไฟล์มีขนาดใหญ่เกินไป</p>
            <p className="text-sm text-gray-500 mb-4">
              กรุณาเลือกรูปที่มีขนาดไม่เกิน 2MB
            </p>
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