import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  Check, 
  CheckCheck,
  User,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    name: string;
    photoURL?: string;
    type: string;
    isVerified?: boolean;
    id: string;
  };
}

export default function ChatWindow({ isOpen, onClose, provider }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: provider.id,
      text: `Hello! I'm ${provider.name}. How can I help you with your booking today?`,
      timestamp: new Date(Date.now() - 3600000),
      status: 'read'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'currentUser',
      text: inputText,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate provider response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        senderId: provider.id,
        text: "Thanks for your message! I'll get back to you in a few minutes.",
        timestamp: new Date(),
        status: 'sent'
      };
      setMessages(prev => [...prev, response]);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          className="relative w-full max-w-lg bg-white h-[90vh] sm:h-[600px] sm:rounded-[40px] flex flex-col overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <header className="p-4 border-b border-stone-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-stone-50 rounded-full sm:hidden"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 border border-stone-100">
                  {provider.photoURL ? (
                    <img src={provider.photoURL} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="font-bold text-natural-text text-sm">{provider.name}</h3>
                  {provider.isVerified && <ShieldCheck className="w-3 h-3 text-primary" />}
                </div>
                <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest">{provider.type}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button className="p-3 hover:bg-stone-50 rounded-full text-stone-400">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-3 hover:bg-stone-50 rounded-full text-stone-400 sm:block hidden">
                <MoreVertical className="w-5 h-5" />
              </button>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-stone-50 rounded-full text-stone-400 hidden sm:block"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-stone-50/50">
            {messages.map((msg) => {
              const isMine = msg.senderId === 'currentUser';
              return (
                <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] rounded-[24px] p-4 text-sm shadow-sm relative",
                    isMine 
                      ? "bg-natural-text text-white rounded-br-none" 
                      : "bg-white text-natural-text border border-stone-100 rounded-bl-none"
                  )}>
                    <p className="leading-relaxed">{msg.text}</p>
                    <div className={cn(
                      "flex items-center gap-1 mt-1 justify-end",
                      isMine ? "text-white/40" : "text-stone-300"
                    )}>
                      <span className="text-[8px] font-black uppercase">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMine && (
                        msg.status === 'read' ? <CheckCheck className="w-3 h-3 text-primary" /> : <Check className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <footer className="p-4 border-t border-stone-100 bg-white">
            <div className="flex items-center gap-2 bg-stone-50 rounded-2xl p-2 border border-stone-100">
              <button className="p-2 hover:bg-white rounded-xl text-stone-400 transition-all">
                <ImageIcon className="w-5 h-5" />
              </button>
              <input 
                type="text" 
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-natural-text"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className={cn(
                  "p-2.5 rounded-xl transition-all shadow-lg active:scale-95",
                  inputText.trim() ? "bg-primary text-white" : "bg-stone-200 text-stone-400"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
