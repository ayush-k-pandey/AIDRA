
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  MessageSquare, 
  Bot, 
  User, 
  Loader2, 
  Trash2,
  Sparkles,
  Info,
  ShieldCheck,
  Zap,
  ChevronRight
} from 'lucide-react';
import { HistoricalDisaster, BudgetPrediction } from '../types';
import { budgetChatInteraction } from '../services/geminiService';

interface Message {
  id: string;
  role: 'official' | 'advisor';
  content: string;
  timestamp: string;
}

interface BudgetChatProps {
  historicalData: HistoricalDisaster[];
  currentPrediction: BudgetPrediction | null;
}

const BudgetChat: React.FC<BudgetChatProps> = ({ historicalData, currentPrediction }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'advisor',
      content: "Fiscal Node Online. I am the **AIDRA Strategic Fiscal Advisor**. I have synthesized the current operational parameters and historical audit data. How can I assist with your budgetary planning or resource allocation strategy today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'official',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await budgetChatInteraction(input, historicalData, currentPrediction);
      const advisorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'advisor',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, advisorMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'advisor',
        content: "Error: I encountered a disruption in my fiscal reasoning node. Please verify the connectivity and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([messages[0]]);
  };

  const PRESETS = [
    { label: "Analyze Per-Capita Impact", query: "Give me a per-capita analysis of the predicted budget for the current population." },
    { label: "Highlight Primary Risks", query: "What are the primary fiscal risks for this disaster scenario based on history?" },
    { label: "Breakdown Logistics Cost", query: "Can you detail why the logistics and transport budget is projected at this level?" }
  ];

  return (
    <div className="flex flex-col h-[700px] glass-panel border-indigo-500/20 overflow-hidden bg-slate-950/40">
      {/* Header */}
      <div className="px-8 py-5 border-b border-white/10 bg-indigo-600/5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Fiscal Decision Support Node</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Real-time Data Link Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearChat}
            className="p-2 text-slate-500 hover:text-rose-500 transition-all hover:bg-rose-500/10 rounded-lg"
            title="Reset Advisor Session"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-slate-950/10"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-5 ${msg.role === 'official' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`p-2.5 rounded-xl flex-shrink-0 shadow-sm ${msg.role === 'official' ? 'bg-indigo-600' : 'bg-slate-800 border border-white/5'}`}>
              {msg.role === 'official' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-indigo-400" />}
            </div>
            <div className={`max-w-[85%] space-y-1.5 ${msg.role === 'official' ? 'text-right' : ''}`}>
              <div className={`p-5 rounded-2xl text-[13px] leading-relaxed font-medium shadow-sm border ${
                msg.role === 'official' 
                  ? 'bg-indigo-600 text-white rounded-tr-none border-indigo-500' 
                  : 'bg-white/5 border-white/10 text-slate-300 rounded-tl-none markdown-container prose prose-invert prose-sm'
              }`}>
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className={line.trim() === '' ? 'h-3' : 'mb-2 last:mb-0'}>
                    {line}
                  </p>
                ))}
              </div>
              <div className="flex items-center gap-2 px-1">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{msg.timestamp}</span>
                {msg.role === 'advisor' && (
                  <span className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest flex items-center gap-1">
                     <ShieldCheck className="w-2.5 h-2.5" /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-5">
            <div className="p-2.5 bg-slate-800 border border-white/5 rounded-xl">
              <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
            </div>
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none border-dashed">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="p-6 bg-slate-900 border-t border-white/10">
        <div className="flex flex-wrap gap-2 mb-6">
           {PRESETS.map((p, i) => (
             <button 
               key={i}
               onClick={() => { setInput(p.query); }}
               className="flex items-center gap-2 text-[9px] font-black text-slate-400 hover:text-indigo-300 uppercase tracking-widest bg-white/5 px-3 py-2 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all group"
             >
               {p.label} <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
             </button>
           ))}
        </div>

        <form onSubmit={handleSend} className="flex gap-3">
          <div className="relative flex-1">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Inquire about regional fiscal impact, per-capita requirements, or historical context..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all pr-12"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Zap className={`w-4 h-4 ${input.trim() ? 'text-indigo-400' : 'text-slate-700'} transition-colors`} />
            </div>
          </div>
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Transmit</span>
          </button>
        </form>
        
        <div className="mt-4 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Info className="w-3 h-3 text-slate-600" />
            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none">Decision support insights only. Verify with central treasury.</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-500/50">
            <ShieldCheck className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">TLS 1.3 Secure Link</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetChat;
