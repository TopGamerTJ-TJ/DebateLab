import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, MessageSquare, BookOpen, ChevronRight, Save } from "lucide-react";
import AnimatedPage from "@/components/AnimatedPage";
import PullToRefresh from "@/components/PullToRefresh";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from "react-markdown";

export default function AIEditor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.filter({ isArchived: false }, '-created_date', 50)
  });

  const runAgent = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    const userMsg = prompt.trim();
    setPrompt("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);

    const context = selectedProjectId ? `The user is focused on the project "${projects.find(p=>p.id===selectedProjectId)?.name}".` : "No specific project selected.";
    
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert Debate AI Editor. You can help draft, edit, suggest improvements, and format contentions or documents.
Context: ${context}
History: ${messages.map(m => m.role+": "+m.content).join('\n')}
User: ${userMsg}

Provide a comprehensive, directly usable response.`
      });
      setMessages(prev => [...prev, { role: "assistant", content: res }]);
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
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[80vh]">
            <div className="p-6 bg-gradient-to-r from-violet-600 to-purple-700 text-white flex items-center justify-between shrink-0">
              <div>
                <h1 className="text-2xl font-bold font-heading flex items-center gap-2"><Sparkles className="w-6 h-6"/> AI Editor</h1>
                <p className="text-violet-100 text-sm opacity-90 mt-1">Chat to generate, edit, and save debate documents directly.</p>
              </div>
              <select className="bg-white/20 border border-white/30 text-white text-sm rounded-xl px-3 py-2 outline-none appearance-none font-medium" value={selectedProjectId} onChange={e=>setSelectedProjectId(e.target.value)}>
                <option value="" className="text-slate-800">Select Project (Optional)</option>
                {projects.map(p => <option key={p.id} value={p.id} className="text-slate-800">{p.name}</option>)}
              </select>
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
              <div className="flex gap-2 max-w-3xl mx-auto">
                <Textarea 
                  value={prompt} 
                  onChange={e=>setPrompt(e.target.value)} 
                  placeholder="E.g. Write a 3-point contention affirming universal basic income focusing on economic stimulus..."
                  rows={2}
                  className="resize-none bg-slate-50"
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), runAgent())}
                />
                <Button onClick={runAgent} disabled={loading || !prompt.trim()} className="h-auto px-6 rounded-xl">
                  Send <ChevronRight className="w-4 h-4 ml-1"/>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PullToRefresh>
    </AnimatedPage>
  );
}