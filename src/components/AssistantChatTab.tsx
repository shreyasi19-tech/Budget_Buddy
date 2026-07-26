import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, Transaction, Budget, SavingGoal, EmergencyFund, UserProfile } from "../types";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  HelpCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Zap,
  Trash2,
  Copy,
  Check
} from "lucide-react";

interface AssistantChatTabProps {
  transactions: Transaction[];
  budgets: Budget[];
  savingGoals?: SavingGoal[];
  emergencyFund?: EmergencyFund;
  profile?: UserProfile | null;
  currency: string;
}

export default function AssistantChatTab({
  transactions,
  budgets,
  savingGoals = [],
  emergencyFund = { current: 0, target: 0 },
  profile,
  currency
}: AssistantChatTabProps) {
  const initialGreeting: ChatMessage = {
    role: "model",
    text: `Hello${profile?.name ? ' ' + profile.name.split(' ')[0] : ''}! I'm Buddy, your High-Precision AI personal wealth companion. 🤖

I've evaluated your complete financial portfolio. Ask me anything about your spending, budget health, or savings opportunities:
- **"How am I spending this month?"**
- **"Where can I trim unnecessary expenses?"**
- **"Am I on track to meet my savings goals?"**`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleClearChat = () => {
    setMessages([initialGreeting]);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(1).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          history,
          transactions,
          budgets,
          savingGoals,
          emergencyFund,
          profile
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to reach Buddy AI server.");
      }

      const data = await response.json();

      const botMsg: ChatMessage = {
        role: "model",
        text: data.response || "I was unable to draft a financial reply.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);

    } catch (error: any) {
      console.error(error);
      const errMsg: ChatMessage = {
        role: "model",
        text: `Error: ${error.message || "Failed to retrieve reply from assistant."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(input);
  };

  const promptChips = [
    "How am I spending this month?",
    "Where can I save money?",
    "Am I staying within my budget?",
    "What should I improve?",
    "Analyze my spending"
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm h-[620px] flex flex-col justify-between overflow-hidden animate-fadeIn">
      
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-purple-900/10 via-slate-900/5 to-slate-900/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-purple-600/25 shrink-0">
            🤖
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              Buddy AI Wealth Companion <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-spin" />
            </h4>
            <p className="text-[11px] text-slate-400">Powered by Gemini 3.6 Flash • Real-time Data Aware</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
          </span>
        </div>
      </div>

      {/* Messages Canvas */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((m, index) => {
          const isBot = m.role === "model";
          return (
            <div
              key={index}
              className={`flex items-start gap-3 max-w-[88%] ${
                isBot ? "self-start" : "ml-auto flex-row-reverse"
              }`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 text-sm font-bold shadow-xs ${
                isBot
                  ? "bg-purple-600 text-white"
                  : "bg-blue-600 text-white"
              }`}>
                {isBot ? "🤖" : "👤"}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1">
                <div className={`p-4 rounded-3xl text-xs leading-relaxed font-medium ${
                  isBot
                    ? "bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800"
                    : "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                }`}>
                  <div className="whitespace-pre-line space-y-1">
                    {m.text.split("\n").map((line, lidx) => {
                      if (line.includes("**")) {
                        const parts = line.split("**");
                        return (
                          <p key={lidx}>
                            {parts.map((p, pidx) => pidx % 2 === 1 ? <strong key={pidx} className="font-bold">{p}</strong> : p)}
                          </p>
                        );
                      }
                      return <p key={lidx}>{line}</p>;
                    })}
                  </div>
                </div>
                <span className={`text-[9px] text-slate-400 block px-2 ${!isBot && "text-right"}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 text-sm font-bold">
              🤖
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-4 rounded-3xl flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
              <span className="text-xs font-bold text-slate-400 animate-pulse">Analyzing your financial records...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
        <Zap className="w-3.5 h-3.5 text-purple-500 shrink-0" />
        <div className="flex items-center gap-1.5">
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendQuery(chip)}
              disabled={loading}
              className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-300 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-xl transition-all whitespace-nowrap cursor-pointer shadow-xs"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask Buddy anything about your finances..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-md shadow-purple-600/20 transition-all cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
