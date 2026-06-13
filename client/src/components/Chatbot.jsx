import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, X, Bot, Loader2 } from 'lucide-react';

export default function Chatbot({ chatContext, setChatContext }) {
  const { token, user, isAuthenticated, fetchWithAuth } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-open chatbot when external chatContext changes
  useEffect(() => {
    if (chatContext) {
      setIsOpen(true);
      loadHistory(chatContext);
    }
  }, [chatContext]);

  // Load chat history
  async function loadHistory(destName) {
    if (!isAuthenticated) {
      setMessages([
        {
          sender: 'ai',
          text: `👋 Hello! I'm your AI Travel assistant for ${destName}. Ask me anything about regional activities, hotels, or trip costs!`
        }
      ]);
      return;
    }

    try {
      setTyping(true);
      const res = await fetchWithAuth(`/api/chat/history?destName=${encodeURIComponent(destName)}`);
      const data = await res.json();
      if (res.ok && data.chat && data.chat.messages && data.chat.messages.length > 0) {
        setMessages(data.chat.messages);
      } else {
        setMessages([
          {
            sender: 'ai',
            text: `👋 Hello! I'm your AI Travel assistant for ${destName}. Ask me anything about regional activities, hotels, or trip costs!`
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTyping(false);
    }
  };

  // Trigger chat history load when opening chatbot
  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      loadHistory(chatContext || 'General');
    }
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text) return;
    
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setTyping(true);

    const context = chatContext || 'General';

    if (isAuthenticated) {
      try {
        const res = await fetchWithAuth('/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            message: text,
            destName: context
          })
        });
        const data = await res.json();
        if (res.ok) {
          setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
        } else {
          setMessages(prev => [...prev, { sender: 'ai', text: "I'm having issues parsing messages. Try again later." }]);
        }
      } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, { sender: 'ai', text: "Server connectivity issues encountered." }]);
      } finally {
        setTyping(false);
      }
    } else {
      // Guest mock responses
      setTimeout(() => {
        setTyping(false);
        let reply = '';
        const lowerText = text.toLowerCase();
        if (lowerText.includes('bali')) {
          reply = "Bali is beautiful! Stays in beachfront eco-resorts start from $120/night. I recommend signing up to save full itineraries. 🏖️";
        } else if (lowerText.includes('tokyo')) {
          reply = "Tokyo packages are trending. A typical 3-day itinerary features Shibuya crossings, temple tours, and sushi guides. 🏙️";
        } else if (lowerText.includes('budget') || lowerText.includes('cost')) {
          reply = "Our daily plan estimations depend on style. Drag the slider on our Calculator widget to see lodging cost breakdowns! 💰";
        } else {
          reply = `Welcome to iQlipse Travel! Please Sign In to ask details about hotels, local activities in ${context}, and save generated schedules. ✈️`;
        }
        setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      }, 800);
    }
  };

  const quickReplies = [
    { label: '🏖️ Bali Sights', text: '🏖️ Suggest hotels in Bali' },
    { label: '🏙️ Tokyo Plan', text: '🏙️ Tokyo 3-day plan' },
    { label: '🧗 Adventure', text: '🧗 Adventure activity ideas' }
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={handleToggle}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-40 animate-float cursor-pointer border-0"
      >
        <Bot className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 bg-teal-400 text-slate-900 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">AI</span>
      </button>

      {/* Chat Container */}
      <div 
        className={`fixed bottom-28 right-8 w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 border border-slate-100 transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-teal-300" />
            <div>
              <h3 className="font-bold text-sm">iQlipse Travel Assistant</h3>
              <span className="text-[9px] text-teal-300 font-bold block">
                {chatContext ? `Context: ${chatContext}` : 'Online & ready to plan'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsOpen(false);
              if (setChatContext) setChatContext('');
            }}
            className="text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3 chat-scroll">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 rounded-tl-none border border-slate-150'
              }`}>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          
          {typing && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-150 p-3 rounded-2xl rounded-tl-none shadow-sm text-xs text-slate-400">
                <div className="flex space-x-1 items-center">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div className="px-4 py-2 bg-slate-50 flex gap-1.5 overflow-x-auto border-t border-slate-100 whitespace-nowrap scrollbar-none">
          {quickReplies.map((qr, index) => (
            <button 
              key={index}
              onClick={() => handleSendMessage(qr.text)}
              className="text-[10px] font-bold bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-100 transition shadow-sm cursor-pointer"
            >
              {qr.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="p-3 border-t border-slate-200 bg-white"
        >
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..." 
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-xs text-slate-800 bg-slate-50"
            />
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl flex items-center justify-center w-10 h-10 transition shadow cursor-pointer border-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {!isAuthenticated && (
            <p className="text-[8px] text-blue-500 mt-2 text-center font-semibold">
              💡 Sign In to save chat history.
            </p>
          )}
        </form>
      </div>
    </>
  );
}
