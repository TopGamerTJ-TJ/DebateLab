import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, MessageSquare, BookOpen, ChevronRight, Save, History, Plus, Trash2, ChevronLeft } from "lucide-react";
import AnimatedPage from "@/components/AnimatedPage";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from "react-markdown";

export default function AIEditor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.filter({ isArchived: false }, '-created_date', 50)
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['editor_sessions'],
    queryFn: () => base44.entities.AIChatSession.filter({ feature: "editor" }, '-created_date', 50)
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['chat_messages', sessionId],
    queryFn: () => sessionId ? base44.entities.AIChatMessage.filter({ sessionId }, 'created_date', 100) : [],
    enabled: !!sessionId
  });

  const createSession = useMutation({
    mutationFn: async (firstMsg) => {
      const title = firstMsg.slice(0, 30) + (firstMsg.length > 30 ? "..." : "");
      return await base44.entities.AIChatSession.create({
        title,
        feature: "editor",
        projectId: selectedProjectId || ""
      });
    },
    onSuccess: (newSession) => {
      setSessionId(newSession.id);
      queryClient.invalidateQueries(['editor_sessions']);
    }
  });

  const createMessage = useMutation({
    mutationFn: async (msg) => {
      return await base44.entities.AIChatMessage.create(msg);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chat_messages', sessionId]);
    }
  });

  const deleteSession = useMutation({
    mutationFn: async (id) => {
      await base44.entities.AIChatSession.delete(id);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries(['editor_sessions']);
      if (sessionId === deletedId) setSessionId("");
      toast({ title: "Chat session deleted" });
    }
  });

  const runAgent = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    const userMsg = prompt.trim();
    setPrompt("");

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const newSession = await createSession.mutateAsync(userMsg);
      currentSessionId = newSession.id;
    } else {
      // If a project is selected now and session has no project, update it
      const sess = sessions.find(s => s.id === currentSessionId);
      if (sess && !sess.projectId && selectedProjectId) {
        await base44.entities.AIChatSession.update(currentSessionId, { projectId: selectedProjectId });
      }
    }

    // Save user message
    await createMessage.mutateAsync({ sessionId: currentSessionId, role: "user", content: userMsg });

    // Re-fetch current messages for history context
    const currentMessages = await base44.entities.AIChatMessage.filter({ sessionId: currentSessionId }, 'created_date', 100);

    const context = selectedProjectId ? `The user is focused on the project "${projects.find(p=>p.id===selectedProjectId)?.name}".` : "No specific project selected.";
    
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert Debate AI Editor. You can help draft, edit, suggest improvements, and format contentions or documents.
Context: ${context}
History: ${currentMessages.map(m => m.role+": "+m.content).join('\n')}

Provide a comprehensive, directly usable response.`
      });
      // Save assistant message
      await createMessage.mutateAsync({ sessionId: currentSessionId, role: "assistant", content: res });
    } catch (e) {
      toast({ title: "Failed to generate response", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries(['projects']);
  };

  const saveToProject = async (content) => {
    if(!selectedProjectId) {
      toast({ title: "Select a project first", variant: "destructive" });
      return;
    }
    try {
      await base44.entities.Contention.create({
        projectId: selectedProjectId,
        title: "AI Editor Document",
        claim: "Generated Content",
        warrant: content.slice(0, 500),
        format: projects.find(p=>p.id===selectedProjectId)?.format || "parliamentary"
      });
      toast({ title: "Saved to project as contention!" });
    } catch (e) {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  return (
    <AnimatedPage>
      <div className="absolute inset-0 flex flex-col bg-slate-50 overflow-hidden">
        <div className="flex-1 flex flex-row max-w-6xl w-full mx-auto p-4 md:p-6 gap-4 md:gap-6 overflow-hidden">
          {/* Sidebar */}
          <div className={`${showHistory ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-64 shrink-0 bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm overflow-hidden`}>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <button className="md:hidden p-1 -ml-1 mr-1 hover:bg-slate-100 rounded-md transition-colors" onClick={() => setShowHistory(false)}><ChevronLeft className="w-4 h-4"/></button>
                <History className="w-4 h-4"/> Chat History
              </h2>
              <Button size="icon" variant="ghost" onClick={() => { setSessionId(""); setShowHistory(false); setSelectedProjectId(""); }} className="h-8 w-8 text-slate-500 hover:text-primary"><Plus className="w-4 h-4"/></Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {sessions.map(s => (
                <div key={s.id} className={`group flex items-center justify-between p-2 rounded-xl text-sm cursor-pointer transition-colors ${sessionId === s.id ? 'bg-primary/10 text-primary font-medium' : 'text-slate-600 hover:bg-slate-50'}`} onClick={() => { setSessionId(s.id); setSelectedProjectId(s.projectId || ""); setShowHistory(false); }}>
                  <div className="truncate flex-1 pr-2">{s.title || "New Chat"}</div>
                  <button onClick={(e) => { e.stopPropagation(); deleteSession.mutate(s.id); }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded-md transition-opacity">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {sessions.length === 0 && <div className="p-4 text-center text-slate-400 text-xs italic">No past chats.</div>}
            </div>
          </div>

          <div className={`${showHistory ? 'hidden md:flex' : 'flex'} flex-1 bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex-col h-full`}>
            <div className="p-6 bg-gradient-to-r from-violet-600 to-purple-700 text-white flex flex-col shrink-0">
              <div className="flex items-center justify-between w-full mb-4">
                <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
                  <button className="md:hidden p-1 -ml-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" onClick={() => setShowHistory(true)}>
                    <History className="w-5 h-5"/>
                  </button>
                  <Sparkles className="w-6 h-6"/> AI Editor
                </h1>
                <select className="bg-white/20 border border-white/30 text-white text-sm rounded-xl px-3 py-2 outline-none appearance-none font-medium" value={selectedProjectId} onChange={e=>setSelectedProjectId(e.target.value)}>
                  <option value="" className="text-slate-800">Select Project (Optional)</option>
                  {projects.map(p => <option key={p.id} value={p.id} className="text-slate-800">{p.name}</option>)}
                </select>
              </div>
              <p className="text-violet-100 text-sm opacity-90 max-w-[200px] leading-snug">
                Chat to generate, edit, and save<br/>debate documents directly.
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
              {messages.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                  <p className="text-lg font-medium text-slate-600">How can I help you prep today?</p>
                  <p className="text-sm mt-2 max-w-md mx-auto">I can write entire cases, improve existing arguments, suggest rebuttals, or format evidence blocks.</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-5 shadow-sm ${m.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-white border border-slate-200 rounded-tl-sm'}`}>
                    {m.role === 'assistant' ? (
                      <div>
                        <ReactMarkdown className="prose prose-sm max-w-none prose-slate">{m.content}</ReactMarkdown>
                        {selectedProjectId && (
                          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                            <Button size="sm" variant="outline" onClick={() => saveToProject(m.content)} className="gap-2 text-xs">
                              <Save className="w-3.5 h-3.5"/> Save to Project
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm rounded-tl-sm flex items-center gap-3 text-slate-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" /> AI is crafting your content...
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <div className="max-w-3xl mx-auto relative flex items-end">
                <Textarea 
                  value={prompt} 
                  onChange={e=>setPrompt(e.target.value)} 
                  placeholder="How can I help you prep today?"
                  className="min-h-[60px] max-h-48 resize-none rounded-2xl pr-[100px] py-4 text-[15px] bg-slate-50 border-slate-200 shadow-sm focus-visible:ring-primary"
                  onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runAgent(); } }}
                />
                <Button onClick={runAgent} disabled={loading || !prompt.trim()} className="absolute right-2 bottom-2 h-10 px-4 rounded-xl shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 gap-1 bg-primary text-white hover:bg-primary/90">
                  Send <ChevronRight className="w-4 h-4"/>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}