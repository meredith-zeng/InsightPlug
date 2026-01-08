
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { startChatSession } from '../services/geminiService';
import { Icons } from '../constants';

interface ChatAssistantProps {
  profile: UserProfile;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hi! I'm your EV advisor. I see you're comparing costs based on your driving habits. Have any specific questions about tax credits, charging, or long-term value?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = startChatSession(profile);
  }, [profile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chatRef.current.sendMessageStream({ message: input });
      let fullText = '';
      
      // Temporary message for streaming
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of result) {
        fullText += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = fullText;
          return newMessages;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I hit a snag. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] glass rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-slate-800 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h4 className="font-bold">EV Knowledge Base</h4>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
        />
        <button 
          disabled={isTyping || !input.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-2 rounded-xl transition-colors shadow-sm"
        >
          <Icons.Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatAssistant;
