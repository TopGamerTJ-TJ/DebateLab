import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Send, Plus, MessageSquare, Menu, Trash2, Loader2, Copy, FileText, CheckCircle2, AlertCircle, Clock, Zap } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import AnimatedPage from "@/components/AnimatedPage";

const FunctionDisplay = ({ toolCall }) => {
    const [expanded, setExpanded] = useState(false);
    const name = toolCall?.name || 'Function';
    const status = toolCall?.status || 'pending';
    const results = toolCall?.results;
    
    const parsedResults = (() => {
        if (!results) return null;
        try { return typeof results === 'string' ? JSON.parse(results) : results; } catch { return results; }
    })();

    const isError = results && ((typeof results === 'string' && /error|failed/i.test(results)) || (parsedResults?.success === false));

    const statusConfig = {
        pending: { icon: Clock, color: 'text-slate-400', text: 'Pending' },
        running: { icon: Loader2, color: 'text-slate-500', text: 'Running...', spin: true },
        in_progress: { icon: Loader2, color: 'text-slate-500', text: 'Running...', spin: true },
        completed: isError ? { icon: AlertCircle, color: 'text-red-500', text: 'Failed' } : { icon: CheckCircle2, color: 'text-green-600', text: 'Success' },
        success: { icon: CheckCircle2, color: 'text-green-600', text: 'Success' },
        failed: { icon: AlertCircle, color: 'text-red-500', text: 'Failed' },
        error: { icon: AlertCircle, color: 'text-red-500', text: 'Failed' }
    }[status] || { icon: Zap, color: 'text-slate-500', text: '' };

    const Icon = statusConfig.icon;
    const formattedName = name.split('.').reverse().join(' ').toLowerCase();

    return (
        <div className="mt-2 text-xs">
            <button onClick={() => setExpanded(!expanded)} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all", expanded ? "bg-slate-50 border-slate-300" : "bg-white border-slate-200")}>
                <Icon className={cn("h-3 w-3", statusConfig.color, statusConfig.spin && "animate-spin")} />
                <span className="text-slate-700">{formattedName}</span>
            </button>
            {expanded && !statusConfig.spin && (
                <div className="mt-1.5 ml-3 pl-3 border-l-2 border-slate-200 space-y-2">
                    {parsedResults && (
                        <div>
                            <div className="text-xs text-slate-500 mb-1">Result:</div>
                            <pre className="bg-slate-50 rounded-md p-2 text-xs text-slate-600 whitespace-pre-wrap max-h-48 overflow-auto">
                                {typeof parsedResults === 'object' ? JSON.stringify(parsedResults, null, 2) : parsedResults}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';
    return (
        <div className={cn("flex gap-4 w-full", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4 text-indigo-600" />
                </div>
            )}
            <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
                {message.content && (
                    <div className={cn("rounded-2xl px-5 py-3 shadow-sm", isUser ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-800")}>
                        {isUser ? (
                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        ) : (
                            <ReactMarkdown 
                                className="text-[15px] prose prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-100"
                                components={{
                                    code: ({ inline, className, children, ...props }) => {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                            <div className="relative group/code mt-4 mb-4">
                                                <pre className="rounded-xl p-4 overflow-x-auto"><code className={className} {...props}>{children}</code></pre>
                                                <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover/code:opacity-100 bg-white/10 hover:bg-white/20 text-white" onClick={() => { navigator.clipboard.writeText(String(children).replace(/\n$/, '')); toast.success('Code copied'); }}>
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (<code className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-sm font-medium">{children}</code>);
                                    }
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        )}
                    </div>
                )}
                {message.tool_calls?.length > 0 && (
                    <div className="space-y-1">
                        {message.tool_calls.map((toolCall, idx) => <FunctionDisplay key={idx} toolCall={toolCall} />)}
                    </div>
                )}
            </div>
            {isUser && (
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-blue-700">U</span>
                </div>
            )}
        </div>
    );
};

export default function CoachChat() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (!activeId) return;
        setMessages([]);
        const unsubscribe = base44.agents.subscribeToConversation(activeId, (data) => {
            setMessages(data.messages || []);
            scrollToBottom();
        });
        return () => unsubscribe();
    }, [activeId]);

    const loadConversations = async () => {
        setLoading(true);
        try {
            const list = await base44.agents.listConversations({ agent_name: "ai_coach" });
            setConversations(list.sort((a,b) => new Date(b.created_date) - new Date(a.created_date)));
            if (list.length > 0 && !activeId) setActiveId(list[0].id);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleNewChat = () => {
        setActiveId(null);
        setMessages([]);
        if (window.innerWidth < 1024) setSidebarOpen(false);
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if(!confirm("Delete this conversation?")) return;
        await base44.agents.deleteConversation(id);
        if(activeId === id) handleNewChat();
        loadConversations();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        
        const text = input;
        setInput("");

        try {
            let convId = activeId;
            let convObj = null;
            
            if (!convId) {
                const title = text.slice(0, 30) + (text.length > 30 ? "..." : "");
                convObj = await base44.agents.createConversation({
                    agent_name: "ai_coach",
                    metadata: { name: title }
                });
                convId = convObj.id;
                setActiveId(convId);
                loadConversations();
            } else {
                convObj = await base44.agents.getConversation(convId);
            }

            await base44.agents.addMessage(convObj, { role: "user", content: text });
            scrollToBottom();
        } catch (err) {
            console.error(err);
            toast.error("Failed to send message");
        }
    };

    return (
        <AnimatedPage>
        <div className="flex h-[calc(100dvh-56px)] lg:h-[calc(100vh-64px)] bg-slate-50 overflow-hidden relative">
            {/* Sidebar Overlay (Mobile) */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <div className={cn("fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col", isSidebarOpen ? "translate-x-0" : "-translate-x-full")}>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <Button onClick={handleNewChat} className="w-full gap-2 font-medium text-slate-700 bg-white border-slate-300 hover:bg-slate-50 hover:text-slate-900" variant="outline">
                        <Plus className="w-4 h-4" /> New Chat
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center p-4 text-sm text-slate-500">No recent chats</div>
                    ) : (
                        conversations.map(c => (
                            <button key={c.id} onClick={() => { setActiveId(c.id); setSidebarOpen(false); }} className={cn("w-full flex items-center justify-between p-3 rounded-xl text-sm transition-colors text-left group", activeId === c.id ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-slate-50 text-slate-700")}>
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <MessageSquare className={cn("w-4 h-4 shrink-0", activeId === c.id ? "text-blue-600" : "text-slate-400")} />
                                    <span className="truncate">{c.metadata?.name || "New Conversation"}</span>
                                </div>
                                <button onClick={(e) => handleDelete(c.id, e)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 rounded-md transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white relative">
                <div className="h-14 lg:h-0 shrink-0 border-b border-slate-200 flex items-center px-4 lg:hidden bg-white/95 backdrop-blur z-30 absolute top-0 left-0 right-0">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600">
                        <Menu className="w-5 h-5" />
                    </button>
                    <span className="ml-2 font-semibold text-slate-800 font-heading">AI Coach</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-32 pt-20 lg:pt-8 scroll-smooth">
                    <div className="max-w-3xl mx-auto space-y-8">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                    <Brain className="w-8 h-8 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 font-heading mb-2">How can I help you prep?</h2>
                                <p className="text-slate-500 max-w-md">I can review your contentions, set up a practice round, generate new arguments, or help you flow a debate.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mt-8">
                                    {["Review my latest project", "Let's do a practice crossfire", "Write a contention on climate change", "Help me organize my case vault"].map(suggestion => (
                                        <button key={suggestion} onClick={() => setInput(suggestion)} className="p-4 border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all text-left">
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((m, i) => <MessageBubble key={i} message={m} />)
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                    <div className="max-w-3xl mx-auto pb-14 lg:pb-0">
                        <form onSubmit={handleSubmit} className="relative flex items-end">
                            <Textarea 
                                value={input} 
                                onChange={e => setInput(e.target.value)} 
                                onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                                placeholder="Message AI Coach..." 
                                className="min-h-[60px] max-h-48 resize-none rounded-2xl pr-[64px] py-4 text-[15px] bg-slate-50 border-slate-200 focus-visible:ring-blue-500 shadow-sm"
                            />
                            <Button type="submit" disabled={!input.trim()} size="icon" className="absolute right-2 bottom-2 h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100">
                                <Send className="w-5 h-5 ml-0.5" />
                            </Button>
                        </form>
                        <div className="text-center mt-2">
                            <span className="text-[11px] text-slate-400">AI can make mistakes. Consider verifying important information.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </AnimatedPage>
    );
}