import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Brain, Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

export default function OfficeHours() {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Hello! I am your AI Debate Coach. Ask me anything about debate strategy, resolution analysis, flowing, or specific arguments.' }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert Debate Coach named DebateLab Coach. 
Answer the following question from a student. Be concise, highly strategic, and focus on competitive debate (Public Forum, Parliamentary, MUN, or Congress).

Chat history for context:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

Student: ${userMessage}`,
      });
      
      setMessages(prev => [...prev, { role: 'system', content: typeof response === 'string' ? response : (response.response || JSON.stringify(response)) }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 mb-6 text-white shadow-md shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">Office Hours</h1>
            <p className="text-blue-100 text-sm mt-1">Ask questions, test arguments, and get immediate feedback from your AI coach.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role !== 'user' && (
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-sm shadow-md shadow-primary/20' 
                  : 'bg-slate-50 text-slate-800 rounded-tl-sm border border-slate-100'
              }`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <div className="prose prose-sm prose-slate max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-5 py-4 border border-slate-100 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a resolution, formatting, or strategy..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl pl-5 pr-14 py-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
              disabled={isTyping}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isTyping}
              className="absolute right-2 w-10 h-10 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
          <div className="text-center mt-3 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400 font-medium">AI Coach is here to help, but always verify specific rules for your tournament.</span>
          </div>
        </div>
      </div>
    </div>
  );
}