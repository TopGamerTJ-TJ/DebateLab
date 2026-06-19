import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BookOpen, MessageSquare, StickyNote, Trash2, Plus, ChevronLeft, ChevronRight, X, Maximize2, Sparkles, Loader2, CheckSquare, Square, Globe, Archive, ArchiveRestore } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from "react-markdown";

const DIFF_COLORS = { beginner: "bg-green-100 text-green-700", intermediate: "bg-blue-100 text-blue-700", advanced: "bg-purple-100 text-purple-700", expert: "bg-red-100 text-red-700" };

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("contentions");
  const [speakingMode, setSpeakingMode] = useState(false);
  const [speakIdx, setSpeakIdx] = useState(0);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [agentQuery, setAgentQuery] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentResults, setAgentResults] = useState(null);
  const chatRef = useRef(null);

  const { data: project, isLoading: projLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => base44.entities.Project.filter({ id }).then(r => r[0]),
  });

  const { data: contentions = [] } = useQuery({
    queryKey: ['project_contentions', id],
    queryFn: () => base44.entities.Contention.filter({ projectId: id }, '-created_date'),
  });

  const deleteContention = useMutation({
    mutationFn: (cid) => base44.entities.Contention.delete(cid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project_contentions', id] })
  });

  const deleteSelected = async () => {
    if (!selectedIds.size) return;
    if (!confirm(`Delete ${selectedIds.size} contentions?`)) return;
    await Promise.all([...selectedIds].map(cid => base44.entities.Contention.delete(cid)));
    setSelectedIds(new Set());
    queryClient.invalidateQueries({ queryKey: ['project_contentions', id] });
    toast({ title: `${selectedIds.size} contentions deleted` });
  };

  const deleteProject = useMutation({
    mutationFn: () => base44.entities.Project.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); navigate('/projects'); toast({ title: "Project deleted" }); }
  });

  const archiveProject = useMutation({
    mutationFn: (val) => base44.entities.Project.update(id, { isArchived: val }),
    onSuccess: (_, val) => { queryClient.invalidateQueries({ queryKey: ['projects'] }); toast({ title: val ? "Project archived" : "Project unarchived" }); }
  });

  const runAgent = async () => {
    if (!agentQuery.trim() || agentLoading || project?.isArchived) return;
    setAgentLoading(true);
    setAgentResults(null);
    const q = agentQuery.trim();
    const context = [project?.resolution, project?.format, project?.side].filter(Boolean).join(', ');
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a research agent for the debate project "${project?.name}". Context: ${context}.
The user wants to research: "${q}"
Search the web and provide:
1. A concise summary of key findings (3-5 bullet points)
2. 2-3 specific facts/statistics that could be used as debate evidence
3. 2-3 suggested contention titles this research could support
4. Any counterarguments found in the research
Format clearly with headers.`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          keyFacts: { type: "array", items: { type: "string" } },
          suggestedContentions: { type: "array", items: { type: "string" } },
          counterarguments: { type: "array", items: { type: "string" } }
        }
      }
    });
    setAgentResults(res);
    setAgentLoading(false);
  };

  const addAgentContention = async (title) => {
    await base44.entities.Contention.create({
      title,
      format: project?.format || "parliamentary",
      resolution: project?.resolution || "",
      side: project?.side || "",
      claim: `Research-based argument: ${title}`,
      projectId: id,
    });
    queryClient.invalidateQueries({ queryKey: ['project_contentions', id] });
    toast({ title: "Contention added from agent!" });
  };

  const saveNote = async () => {
    if (!note.trim()) return;
    setSavingNote(true);
    await base44.entities.Project.update(id, { notes: note });
    queryClient.invalidateQueries({ queryKey: ['project', id] });
    setSavingNote(false);
    toast({ title: "Note saved!" });
  };

  useEffect(() => { if (project?.notes) setNote(project.notes || ""); }, [project]);
  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight); }, [messages]);

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);
    const context = contentions.slice(0, 5).map(c => `- ${c.title}: ${c.claim}`).join('\n');
    const reply = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a debate coach for the project "${project?.name}" (${project?.format?.replace(/_/g, ' ') || 'debate'}).
Project resolution: ${project?.resolution || 'not set'}. Side: ${project?.side || 'not set'}.
Key contentions in this project:
${context || 'No contentions yet'}

Conversation history:
${messages.map(m => `${m.role === 'user' ? 'Student' : 'Coach'}: ${m.content}`).join('\n')}

Student: ${userMsg}

Provide specific, actionable coaching advice tailored to this project's contentions and context. Coach:`
    });
    setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    setChatLoading(false);
  };

  const toggleSelect = (cid) => setSelectedIds(prev => {
    const next = new Set(prev);
    next.has(cid) ? next.delete(cid) : next.add(cid);
    return next;
  });

  if (projLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" /></div>;
  if (!project) return <div className="p-8 text-center"><p className="text-slate-400">Project not found.</p><Link to="/projects" className="text-primary hover:underline mt-2 block">← Back to Projects</Link></div>;

  // Speaking mode overlay
  if (speakingMode && contentions.length > 0) {
    const c = contentions[speakIdx];
    return (
      <div className="fixed inset-0 bg-slate-900 text-white z-50 flex flex-col">
        <div className="flex items-center justify-between px-8 py-4 border-b border-white/10">
          <span className="text-white/60 text-sm">{speakIdx + 1} / {contentions.length} — {project.name}</span>
          <button onClick={() => setSpeakingMode(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-8 max-w-4xl mx-auto w-full">
          <div className="text-sm text-blue-300 font-medium mb-2 uppercase tracking-wider">{c.side} · {c.format?.replace(/_/g, ' ')}</div>
          <h1 className="text-3xl font-bold font-heading mb-8">{c.title}</h1>
          <div className="space-y-6">
            {[["Claim", c.claim], ["Warrant", c.warrant], ["Impact", c.impact]].map(([label, val]) => val && (
              <div key={label}>
                <div className="text-xs font-bold uppercase tracking-wider text-white/40 mb-1">{label}</div>
                <p className="text-lg leading-relaxed text-white/90">{val}</p>
              </div>
            ))}
            {c.evidence?.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Evidence</div>
                {c.evidence.map((ev, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4 mb-2">
                    <p className="text-white/80 text-sm leading-relaxed">{ev.text}</p>
                    <p className="text-white/40 text-xs mt-1">— {ev.source}</p>
                  </div>
                ))}
              </div>
            )}
            {c.strategicNotes && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-white/40 mb-1">Strategic Notes</div>
                <p className="text-white/70 text-sm leading-relaxed">{c.strategicNotes}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center gap-6 px-8 py-6 border-t border-white/10">
          <button onClick={() => setSpeakIdx(i => Math.max(0, i - 1))} disabled={speakIdx === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-all font-medium">
            <ChevronLeft className="w-5 h-5" /> Previous
          </button>
          <span className="text-white/40 text-sm">{speakIdx + 1} of {contentions.length}</span>
          <button onClick={() => setSpeakIdx(i => Math.min(contentions.length - 1, i + 1))} disabled={speakIdx === contentions.length - 1}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-all font-medium">
            Next <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "contentions", icon: BookOpen, label: `Contentions (${contentions.length})` },
    { id: "notes", icon: StickyNote, label: "Notes" },
    { id: "chat", icon: MessageSquare, label: "AI Coach" },
    { id: "agent", icon: Globe, label: "Research Agent" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/projects" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-900 font-heading truncate">{project.name}</h1>
          <div className="flex gap-2 items-center mt-0.5 flex-wrap">
            {project.format && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{project.format.replace(/_/g, ' ')}</span>}
            {project.resolution && <span className="text-xs text-slate-400 truncate max-w-xs">{project.resolution}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          {contentions.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => { setSpeakIdx(0); setSpeakingMode(true); }} className="gap-1.5 text-xs hidden sm:flex">
              <Maximize2 className="w-3.5 h-3.5" /> Speaking Mode
            </Button>
          )}
          <Button variant="outline" size="sm"
            onClick={() => archiveProject.mutate(!project.isArchived)}
            className="gap-1.5 text-xs hidden sm:flex">
            {project.isArchived ? <><ArchiveRestore className="w-3.5 h-3.5" /> Unarchive</> : <><Archive className="w-3.5 h-3.5" /> Archive</>}
          </Button>
          <Button variant="outline" size="sm" onClick={() => { if (confirm("Delete this entire project?")) deleteProject.mutate(); }} className="gap-1.5 text-xs text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hidden sm:flex">
            <Trash2 className="w-3.5 h-3.5" /> Delete Project
          </Button>
        </div>
      </div>

      {/* Archived banner */}
      {project.isArchived && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-amber-800 text-sm">
          <Archive className="w-4 h-4 text-amber-500 shrink-0" />
          <span><strong>Archived project</strong> — this project is frozen. Unarchive to make edits or use the Research Agent.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${tab === t.id ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Contentions tab */}
      {tab === "contentions" && (
        <div className="space-y-4">
          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
              <span className="text-sm text-blue-700 font-medium">{selectedIds.size} selected</span>
              <div className="flex gap-2">
                <button onClick={() => setSelectedIds(new Set())} className="text-xs text-slate-500 hover:text-slate-700">Clear</button>
                <Button size="sm" variant="destructive" onClick={deleteSelected} className="text-xs gap-1">
                  <Trash2 className="w-3 h-3" /> Delete Selected
                </Button>
              </div>
            </div>
          )}
          {contentions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No contentions in this project yet.</p>
              <p className="text-slate-300 text-xs mt-1">Generate contentions from Parliamentary or Public Forum and save them here.</p>
            </div>
          ) : contentions.map(c => (
            <div key={c.id} className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${selectedIds.has(c.id) ? "border-primary ring-1 ring-primary/20" : "border-slate-200"}`}>
              <div className="flex items-start gap-3">
                <button onClick={() => toggleSelect(c.id)} className="mt-0.5 shrink-0">
                  {selectedIds.has(c.id) ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-slate-900 font-heading text-sm">{c.title}</h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {c.difficulty && <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${DIFF_COLORS[c.difficulty] || "bg-slate-100 text-slate-600"}`}>{c.difficulty}</span>}
                      <button onClick={() => deleteContention.mutate(c.id)} className="p-1 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {c.claim && <p className="text-xs text-slate-600 leading-relaxed mb-1"><span className="font-semibold text-slate-400">Claim:</span> {c.claim}</p>}
                  {c.impact && <p className="text-xs text-slate-500 leading-relaxed"><span className="font-semibold text-slate-400">Impact:</span> {c.impact}</p>}
                  {c.evidence?.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <BookOpen className="w-3 h-3" /> {c.evidence.length} evidence piece{c.evidence.length !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notes tab */}
      {tab === "notes" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><StickyNote className="w-4 h-4 text-amber-500" /><h3 className="font-bold text-slate-900 font-heading">Project Notes</h3></div>
            <Button size="sm" onClick={saveNote} disabled={savingNote} className="text-xs">
              {savingNote ? "Saving..." : "Save Notes"}
            </Button>
          </div>
          <Textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder="Add notes, strategy, research, reminders for this project..."
            rows={16} className="resize-none text-sm font-mono leading-relaxed" />
        </div>
      )}

      {/* Research Agent tab */}
      {tab === "agent" && (
        <div className="space-y-4">
          {project.isArchived ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center text-amber-700">
              <Globe className="w-8 h-8 mx-auto mb-2 text-amber-400" />
              <p className="font-medium">Research Agent is disabled for archived projects.</p>
              <p className="text-sm mt-1">Unarchive this project to use the Research Agent.</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-primary" />
                  <div>
                    <h3 className="font-bold text-slate-900 font-heading text-sm">Web Research Agent</h3>
                    <p className="text-xs text-slate-400">Searches the web for debate-relevant info and suggests contentions</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    value={agentQuery}
                    onChange={e => setAgentQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && runAgent()}
                    placeholder={`Research topic for "${project.name}"...`}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button onClick={runAgent} disabled={agentLoading || !agentQuery.trim()} className="gap-1.5 text-sm shrink-0">
                    {agentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {agentLoading ? "Searching..." : "Research"}
                  </Button>
                </div>
              </div>

              {agentLoading && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Scouring the web for debate intelligence...</p>
                </div>
              )}

              {agentResults && (
                <div className="space-y-4">
                  {agentResults.summary && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                      <h4 className="font-bold text-slate-900 font-heading text-sm mb-2">📋 Research Summary</h4>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{agentResults.summary}</p>
                    </div>
                  )}
                  {agentResults.keyFacts?.length > 0 && (
                    <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
                      <h4 className="font-bold text-blue-900 font-heading text-sm mb-3">📊 Key Facts & Statistics</h4>
                      <ul className="space-y-2">
                        {agentResults.keyFacts.map((f, i) => (
                          <li key={i} className="text-sm text-blue-800 flex gap-2">
                            <span className="shrink-0 font-bold text-blue-500">{i+1}.</span>{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {agentResults.suggestedContentions?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                      <h4 className="font-bold text-slate-900 font-heading text-sm mb-3">💡 Suggested Contentions</h4>
                      <div className="space-y-2">
                        {agentResults.suggestedContentions.map((c, i) => (
                          <div key={i} className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl">
                            <span className="text-sm text-slate-800">{c}</span>
                            <Button size="sm" variant="outline" onClick={() => addAgentContention(c)} className="text-xs shrink-0 gap-1">
                              <Plus className="w-3 h-3" /> Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {agentResults.counterarguments?.length > 0 && (
                    <div className="bg-red-50 rounded-2xl border border-red-100 p-5">
                      <h4 className="font-bold text-red-900 font-heading text-sm mb-3">⚠️ Counterarguments Found</h4>
                      <ul className="space-y-2">
                        {agentResults.counterarguments.map((c, i) => (
                          <li key={i} className="text-sm text-red-800 flex gap-2">
                            <span className="shrink-0 font-bold text-red-400">•</span>{c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* AI Chat tab */}
      {tab === "chat" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <div>
              <h3 className="font-bold text-slate-900 font-heading text-sm">Project AI Coach</h3>
              <p className="text-xs text-slate-400">Tailored to "{project.name}" — your contentions, resolution & side</p>
            </div>
          </div>
          <div ref={chatRef} className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                Ask your AI coach anything about this project — strategy, rebuttals, crossfire prep, bloc building...
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-primary text-white" : "bg-slate-100 text-slate-800"}`}>
                  {m.role === "assistant" ? (
                    <ReactMarkdown className="prose prose-sm max-w-none prose-slate [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{m.content}</ReactMarkdown>
                  ) : m.content}
                </div>
              </div>
            ))}
            {chatLoading && <div className="flex justify-start"><div className="bg-slate-100 rounded-2xl px-4 py-2.5 text-sm text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div></div>}
          </div>
          <div className="p-4 border-t border-slate-100 flex gap-2">
            <Input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
              placeholder="Ask your coach..." className="text-sm" />
            <Button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} size="sm">Send</Button>
          </div>
        </div>
      )}
    </div>
  );
}