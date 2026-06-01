import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Bot, User, RefreshCw } from "lucide-react";

const SYSTEM_PROMPTS = {
  parliamentary: `You are an expert Parliamentary Debate coach and AI assistant specializing in British Parliamentary (BP), Asian Parliamentary (AP), and Middle School Parliamentary formats. Help users with: debate structure, speaker roles, POIs (Points of Information), motion analysis, government/opposition strategy, rebuttal development, clash analysis, and tournament preparation. Give concrete, actionable advice. Be encouraging but rigorous.`,
  public_forum: `You are an expert Public Forum Debate coach and AI assistant. Help users with: resolution analysis, PF strategy, weighing mechanisms (magnitude, probability, timeframe, scope), impact calculus, crossfire preparation, evidence analysis, summary speeches, final focus, and tournament preparation. Specialize in NSDA Public Forum rules and current-season topics.`,
  model_un: `You are an expert Model UN coach and advisor. Help delegates with: country research, position paper writing, draft resolution construction, working papers, bloc strategy, caucus preparation, speech writing (opening, crisis, closing), amendment procedures, UN parliamentary procedure, and committee strategy. Be authoritative and diplomatic.`,
  model_congress: `You are an expert Model Congress advisor. Help students with: bill writing, resolution drafting, amendment procedures, committee preparation, congressional speeches (authorship, pro, con), cross-examination strategy, parliamentary procedure (Roberts Rules of Order), policy analysis, and mock hearing preparation.`,
};

export default function AIAssistant({ format = "parliamentary", placeholder }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: getWelcome(format) }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function getWelcome(fmt) {
    const greetings = {
      parliamentary: "👋 Hi! I'm your Parliamentary Debate AI coach. Ask me anything about debate structure, motions, speaker roles, strategy, or argument construction.",
      public_forum: "👋 Hi! I'm your Public Forum AI coach. Ask me about resolutions, contentions, crossfire, weighing mechanisms, or tournament strategy.",
      model_un: "👋 Hi! I'm your Model UN advisor. Ask me about country research, position papers, resolutions, bloc strategy, or committee procedures.",
      model_congress: "👋 Hi! I'm your Model Congress advisor. Ask me about bill writing, speeches, amendments, committee strategy, or congressional procedures.",
    };
    return greetings[fmt] || greetings.parliamentary;
  }

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const history = newMessages.slice(-10).map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n\n");

    const reply = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPTS[format] || SYSTEM_PROMPTS.parliamentary}

Conversation history:
${history}

Provide a helpful, specific, and actionable response. Use markdown formatting with **bold** for key terms and bullet points where helpful. Keep responses focused and practical.`,
    });

    setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    setLoading(false);
  };

  const reset = () => setMessages([{ role: "assistant", content: getWelcome(format) }]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col" style={{ height: '600px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm font-heading">AI Assistant</div>
            <div className="text-xs text-slate-500 capitalize">{format.replace('_', ' ')} specialist</div>
          </div>
        </div>
        <button onClick={reset} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <RefreshCw className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-primary" : "bg-slate-100"}`}>
              {m.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-slate-500" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-white rounded-tr-sm" : "bg-slate-50 text-slate-800 rounded-tl-sm border border-slate-100"}`}>
              {m.content.split('\n').map((line, j) => (
                <span key={j}>
                  {line.split(/(\*\*[^*]+\*\*)/).map((part, k) =>
                    part.startsWith('**') && part.endsWith('**')
                      ? <strong key={k}>{part.slice(2, -2)}</strong>
                      : part
                  )}
                  {j < m.content.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-slate-500" />
            </div>
            <div className="bg-slate-50 rounded-2xl rounded-tl-sm border border-slate-100 px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={placeholder || "Ask anything about debate strategy, arguments, or preparation..."}
            className="resize-none text-sm"
            rows={2}
          />
          <Button onClick={send} disabled={loading || !input.trim()} size="icon" className="h-auto aspect-square shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-1.5">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  );
}