import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BookOpen, MessageSquare, StickyNote, Trash2, Plus, ChevronLeft, ChevronRight, X, Maximize2, Sparkles, Loader2, CheckSquare, Square, Globe, Archive, ArchiveRestore, ShieldAlert, FileText, Users, Activity, Check, Copy, ScrollText, Lightbulb, ExternalLink, Scale, Wand2, FileDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import ReactMarkdown from "react-markdown";
import ProjectSuggestionsWidget from "@/components/ProjectSuggestionsWidget";
import AnimatedPage from "@/components/AnimatedPage";
import ProjectAIChats from "@/components/ProjectAIChats";
import OtherDocGenerator from "@/components/OtherDocGenerator";
import ProjectContextCard from "@/components/ProjectContextCard";
import ProjectFlowTab from "@/components/ProjectFlowTab";
import ProjectSpeechGenerator from "@/components/ProjectSpeechGenerator";
import ConferenceLinkSelect from "@/components/ConferenceLinkSelect";
import { buildConferenceContextText } from "@/components/ConferenceContextPicker";

const DIFF_COLORS = { beginner: "bg-green-100 text-green-700", intermediate: "bg-blue-100 text-blue-700", advanced: "bg-purple-100 text-purple-700", expert: "bg-red-100 text-red-700" };

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("contentions");
  const [collabUserId, setCollabUserId] = useState("");
  const [collabRole, setCollabRole] = useState("viewer");
  const [speakingMode, setSpeakingMode] = useState(false);
  const [speakIdx, setSpeakIdx] = useState(0);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [agentQuery, setAgentQuery] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentResults, setAgentResults] = useState(null);
  const [rebuttalInput, setRebuttalInput] = useState("");
  const [rebuttalLoading, setRebuttalLoading] = useState(false);
  const [rebuttals, setRebuttals] = useState([]);
  const [agentSkill, setAgentSkill] = useState("intermediate");
  const [agentContext, setAgentContext] = useState("");
  const [minKeyFacts, setMinKeyFacts] = useState(3);
  const [minLogicPoints, setMinLogicPoints] = useState(3);
  const [minContentions, setMinContentions] = useState(2);
  const [genOppLoading, setGenOppLoading] = useState(false);

  const { data: project, isLoading: projLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => base44.entities.Project.filter({ id }).then(r => r[0]),
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const byOwner = await base44.entities.UserProfile.filter({ ownerUserId: user.id });
      if (byOwner.length > 0) return byOwner[0];
      const res = await base44.entities.UserProfile.filter({ created_by_id: user.id });
      return res[0] || null;
    },
    enabled: !!user
  });

  const getActiveAiMode = () => {
    if (project?.aiMode && project.aiMode !== "default") return project.aiMode;
    return profile?.defaultAiMode || "full";
  };

  const { data: contentions = [] } = useQuery({
    queryKey: ['project_contentions', id],
    queryFn: () => base44.entities.Contention.filter({ projectId: id }, '-created_date'),
  });

  const { data: collaborators = [] } = useQuery({
    queryKey: ['project_collaborators', id],
    queryFn: () => base44.entities.ProjectCollaborator.filter({ projectId: id })
  });

  const { data: activityLog = [] } = useQuery({
    queryKey: ['project_activity', id],
    queryFn: () => base44.entities.ProjectActivity.filter({ projectId: id }, '-created_date', 50)
  });

  const { data: chatSessions = [] } = useQuery({
    queryKey: ['project_chat_sessions', id],
    queryFn: () => base44.entities.AIChatSession.filter({ projectId: id }, '-created_date', 50)
  });

  const { data: otherDocs = [] } = useQuery({
    queryKey: ['project_other_documents', id],
    queryFn: () => base44.entities.OtherDocument.filter({ projectId: id }, '-created_date'),
  });

  const deleteOtherDoc = useMutation({
    mutationFn: (docId) => base44.entities.OtherDocument.delete(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_other_documents', id] });
      queryClient.invalidateQueries({ queryKey: ['other_documents'] });
      logActivity("Deleted Document", "Removed a custom document from the project.");
    }
  });

  const copyOtherDoc = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const { data: conferenceProfiles = [] } = useQuery({
    queryKey: ['conference_profiles'],
    queryFn: () => base44.entities.ConferenceProfile.list('-created_date')
  });
  const { data: folders = [] } = useQuery({
    queryKey: ['project_folders'],
    queryFn: () => base44.entities.ProjectFolder.list('-created_date')
  });

  // Effective conference profile: project's own link, else the folder's linked profile.
  const projectFolder = folders.find(f => f.id === project?.folderId);
  const effectiveConferenceId = project?.conferenceProfileId || projectFolder?.conferenceProfileId || "";
  const effectiveConference = conferenceProfiles.find(c => c.id === effectiveConferenceId);
  const conferenceContext = buildConferenceContextText(effectiveConference);

  const linkConference = useMutation({
    mutationFn: (profileId) => base44.entities.Project.update(id, { conferenceProfileId: profileId || "" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['project', id] }); toast({ title: "Conference rules updated" }); }
  });

  const addCollaborator = useMutation({
    mutationFn: async () => {
      const u = await base44.entities.User.get(collabUserId);
      if(!u) throw new Error("User not found");
      return base44.entities.ProjectCollaborator.create({
        ownerUserId: user?.id,
        projectId: id,
        userId: u.id,
        userName: u.full_name,
        role: collabRole
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_collaborators', id] });
      setCollabUserId("");
      toast({ title: "Collaborator added" });
    },
    onError: () => toast({ title: "User not found or error", variant: "destructive" })
  });

  const logActivity = (action, details) => {
    base44.entities.ProjectActivity.create({
      ownerUserId: user?.id,
      projectId: id,
      userId: user?.id || 'unknown',
      userName: user?.full_name || 'Anonymous',
      action,
      details
    });
  };

  const deleteContention = useMutation({
    mutationFn: (cid) => base44.entities.Contention.delete(cid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_contentions', id] });
      logActivity("Deleted Contention", "Removed a contention from the project.");
    }
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

  const updateProject = useMutation({
    mutationFn: ({ field, value }) => base44.entities.Project.update(id, { [field]: value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] })
  });

  const runAgent = async () => {
    if (!agentQuery.trim() || agentLoading || project?.isArchived) return;
    setAgentLoading(true);
    setAgentResults(null);
    const q = agentQuery.trim();
    const context = [project?.resolution, project?.format, project?.side].filter(Boolean).join(', ');
    const activeAiMode = getActiveAiMode();
    
    const whitelist = project.whitelist || [];
    const blacklist = project.blacklist || [];
    const strict = project.strictMode;

    let promptText = `You are a research agent for the debate project "${project?.name}". Context: ${context}.
The user wants to research: "${q}"
Skill level of the user: ${agentSkill}. Adjust depth and complexity accordingly.
${agentContext ? `Additional instructions from the user: ${agentContext}\n` : ""}
Search the web and provide:
1. A concise summary of key findings (3-5 bullet points)
2. At least ${minKeyFacts} specific facts/statistics usable as debate evidence — each with a source name and URL
3. At least ${minLogicPoints} LOGICAL points that DERIVE from the sources' reasoning (analytical inferences, causal chains, framing arguments — NOT direct statistics) — each with the source it derives from and a URL
4. At least ${minContentions} suggested contention titles this research could support
5. Counterarguments found in the research
6. A full list of ALL sources consulted (title + URL)
7. A bias assessment: do the sources lean TOWARD the user's side (${project?.side || 'unspecified'}), AGAINST it, or NEUTRAL? Explain briefly and flag any slant.`;

    if (strict && whitelist.length > 0) {
      promptText += `\n\nSTRICT SOURCE MODE IS ON. You MUST ONLY use information from these whitelisted sources:\n${whitelist.map(s => `- ${s.label}: ${s.url}`).join('\n')}\nDo not use any other sources.`;
    } else if (whitelist.length > 0) {
      promptText += `\n\nPreferred sources to prioritize:\n${whitelist.map(s => `- ${s.label}: ${s.url}`).join('\n')}`;
    }
    if (blacklist.length > 0) {
      promptText += `\n\nDo NOT use information from these blacklisted sources:\n${blacklist.map(s => `- ${s.label}: ${s.url}`).join('\n')}`;
    }

    if (conferenceContext) {
      promptText += `\n\n${conferenceContext}\nKeep findings consistent with the conference rules/context above.`;
    }

    if (activeAiMode === "dampened") {
      promptText += `\n\nCRITICAL: The user has Dampened AI enabled. 
- You MUST NOT write their arguments or contentions for them. 
- Focus ONLY on providing objective evidence, statistics, and high-level structural suggestions.
- Do NOT provide fully written paragraphs that they can just copy-paste.
- Keep the summary brief and objective.`;
    }

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: promptText,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          keyFacts: { type: "array", items: { type: "object", properties: { fact: { type: "string" }, source: { type: "string" }, url: { type: "string" } } } },
          logicPoints: { type: "array", items: { type: "object", properties: { point: { type: "string" }, source: { type: "string" }, url: { type: "string" } } } },
          suggestedContentions: { type: "array", items: { type: "string" } },
          counterarguments: { type: "array", items: { type: "string" } },
          sources: { type: "array", items: { type: "object", properties: { title: { type: "string" }, url: { type: "string" } } } },
          biasAssessment: { type: "string" }
        }
      }
    });
    setAgentResults(res);
    setAgentLoading(false);
  };

  const saveResearchToDoc = async () => {
    if (!agentResults) return;
    const lines = [];
    if (agentResults.summary) lines.push(`## Research Summary\n${agentResults.summary}`);
    if (agentResults.keyFacts?.length) lines.push(`## Key Facts & Statistics\n${agentResults.keyFacts.map(f => `- ${f.fact}${f.source ? ` (${f.source})` : ''}${f.url ? ` — ${f.url}` : ''}`).join('\n')}`);
    if (agentResults.logicPoints?.length) lines.push(`## Logical Points\n${agentResults.logicPoints.map(p => `- ${p.point}${p.source ? ` (${p.source})` : ''}${p.url ? ` — ${p.url}` : ''}`).join('\n')}`);
    if (agentResults.suggestedContentions?.length) lines.push(`## Suggested Contentions\n${agentResults.suggestedContentions.map(c => `- ${c}`).join('\n')}`);
    if (agentResults.counterarguments?.length) lines.push(`## Counterarguments\n${agentResults.counterarguments.map(c => `- ${c}`).join('\n')}`);
    if (agentResults.sources?.length) lines.push(`## Sources\n${agentResults.sources.map(s => `- ${s.title}${s.url ? ` — ${s.url}` : ''}`).join('\n')}`);
    if (agentResults.biasAssessment) lines.push(`## Bias Assessment\n${agentResults.biasAssessment}`);
    const content = lines.join('\n\n');
    await base44.entities.OtherDocument.create({
      title: `Research: ${agentQuery.trim().slice(0, 80)}`,
      docLabel: "Research",
      description: agentQuery.trim(),
      content,
      projectId: id,
    });
    queryClient.invalidateQueries({ queryKey: ['project_other_documents', id] });
    toast({ title: "Research saved to All Docs!" });
  };

  const generatePredictedRebuttals = async () => {
    if (genOppLoading || project?.isArchived) return;
    setGenOppLoading(true);
    const context = contentions.slice(0, 6).map(c => `- ${c.title}: ${c.claim || ''}`).join('\n');
    const activeAiMode = getActiveAiMode();

    let promptText = `You are an expert debater representing the ${project?.side || 'Affirmative'} side for the resolution "${project?.resolution || 'not set'}".

Here are our side's current contentions and materials:
${context || 'No contentions yet'}
${project.notes ? `\nProject notes: ${project.notes}` : ''}

STEP 1: Predict the strongest 2-4 arguments the OPPONENT would make against our case, drawing on all the project materials above.
STEP 2: For each predicted opponent argument, generate a strong, evidence-backed rebuttal we can use.

Format your response as:
**Predicted Opponent Arguments:**
1. ...
2. ...

**Our Rebuttals:**
1. (rebuttal to argument 1) ...
2. (rebuttal to argument 2) ...`;

    if (conferenceContext) promptText += `\n\n${conferenceContext}`;
    if (activeAiMode === "dampened") {
      promptText += `\n\nCRITICAL: Dampened AI enabled — provide strategic bullet points outlining the *angles* of attack, not the final script.`;
    }

    const res = await base44.integrations.Core.InvokeLLM({ prompt: promptText });
    setRebuttals(prev => [{ input: "Predicted opponent arguments (auto-generated from all project materials)", output: res, predicted: true }, ...prev]);
    setGenOppLoading(false);
  };

  const addAgentContention = async (title) => {
    await base44.entities.Contention.create({
      ownerUserId: user?.id,
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

  useEffect(() => {
    if (profile) {
      setMinKeyFacts(profile.defaultMinKeyFacts ?? 3);
      setMinLogicPoints(profile.defaultMinLogicPoints ?? 3);
      setMinContentions(profile.defaultMinContentions ?? 2);
      if (profile.skillLevel) setAgentSkill(profile.skillLevel);
    }
  }, [profile]);

  const generateRebuttals = async () => {
    if (!rebuttalInput.trim() || rebuttalLoading) return;
    setRebuttalLoading(true);
    const context = contentions.slice(0, 5).map(c => `- ${c.title}: ${c.claim}`).join('\n');
    const activeAiMode = getActiveAiMode();
    
    let promptText = `You are an expert debater representing the ${project?.side || 'Affirmative'} side for the resolution "${project?.resolution || 'not set'}".
    
Your opponent just made the following arguments:
"""
${rebuttalInput}
"""

Our side's current contentions context:
${context || 'No contentions yet'}

Generate 2-3 strong, evidence-backed rebuttals to their arguments. Format as a clean list of concise, punchy rebuttals. Do NOT include pleasantries, just the rebuttals.`;

    if (conferenceContext) {
      promptText += `\n\n${conferenceContext}\nAlign rebuttals with the conference rules/context above.`;
    }

    if (activeAiMode === "dampened") {
      promptText += `\n\nCRITICAL: The user has Dampened AI enabled. 
- You MUST NOT write their exact rebuttal speeches for them. 
- INSTEAD, provide strategic bullet points outlining the *angles* they should attack.
- E.g. "Focus on how their evidence is outdated" or "Point out the logical flaw in their impact mechanism."
- Give them guidance, NOT the final script.`;
    }

    const res = await base44.integrations.Core.InvokeLLM({ prompt: promptText });
    setRebuttals(prev => [{ input: rebuttalInput, output: res }, ...prev]);
    setRebuttalInput("");
    setRebuttalLoading(false);
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
    { id: "flow", icon: ScrollText, label: "Flow" },
    { id: "rebuttals", icon: ShieldAlert, label: "Rebuttal Hub" },
    { id: "notes", icon: StickyNote, label: "Notes" },
    { id: "chat", icon: MessageSquare, label: "AI Chats" },
    { id: "agent", icon: Globe, label: "Research Agent" },
    { id: "collab", icon: Users, label: "Collab & Activity" },
    { id: "alldocs", icon: FileText, label: `All Docs (${otherDocs.length + contentions.length})` },
  ];

  return (
    <AnimatedPage>
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
            {effectiveConference && (
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Globe className="w-3 h-3" />{effectiveConference.name}{!project.conferenceProfileId && projectFolder ? " (folder)" : ""}
              </span>
            )}
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

      {/* Conference Rules/Context link */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-800">Conference Rules/Context</div>
          <p className="text-xs text-slate-500">
            {projectFolder?.conferenceProfileId && !project.conferenceProfileId
              ? `Inherited from folder "${projectFolder.name}". Pick one here to override.`
              : "Link a saved conference profile so this project's AI tools follow those rules."}
          </p>
        </div>
        <div className="sm:w-64">
          <ConferenceLinkSelect value={project.conferenceProfileId || ""} onChange={(v) => linkConference.mutate(v)} label={null} />
        </div>
      </div>

      {/* Project Context: side, strict mode, sources */}
      <ProjectContextCard project={project} onUpdate={(field, value) => updateProject.mutate({ field, value })} />

      {/* Daily Suggestions */}
      <ProjectSuggestionsWidget projectId={id} />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${tab === t.id ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Flow tab */}
      {tab === "flow" && (
        <div className="space-y-4">
          <ProjectSpeechGenerator
            project={project}
            contentions={contentions}
            rebuttals={rebuttals}
            otherDocs={otherDocs}
            agentResults={agentResults}
            conferenceContext={conferenceContext}
            onSaved={() => queryClient.invalidateQueries({ queryKey: ['project_other_documents', id] })}
          />
          <ProjectFlowTab project={project} contentions={contentions} rebuttals={rebuttals} />
        </div>
      )}

      {/* Rebuttal Hub tab */}
      {tab === "rebuttals" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="font-bold text-slate-900 font-heading text-sm">Rebuttal Hub</h3>
                <p className="text-xs text-slate-500">Enter your opponent's arguments to generate real-time counter-arguments perfectly aligned with your side.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Textarea 
                value={rebuttalInput} 
                onChange={e => setRebuttalInput(e.target.value)} 
                placeholder="Opponent's arguments (e.g. 'They claim that universal healthcare will bankrupt the economy because...') " 
                rows={4} 
                className="resize-none text-sm bg-slate-50 border-slate-200" 
              />
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
                <Button onClick={generatePredictedRebuttals} disabled={genOppLoading || project?.isArchived} variant="outline" className="gap-2 border-teal-300 text-teal-700 hover:bg-teal-50 text-sm">
                  {genOppLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  {genOppLoading ? "Predicting..." : "Generate Opponent's Arguments"}
                </Button>
                <Button onClick={generateRebuttals} disabled={rebuttalLoading || !rebuttalInput.trim()} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm">
                  {rebuttalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate Rebuttals
                </Button>
              </div>
              <p className="text-xs text-slate-400 -mt-2">Use "Generate Opponent's Arguments" to auto-predict counter-arguments from all your project materials, then get rebuttals to them.</p>
            </div>
          </div>

          <div className="space-y-4">
            {rebuttals.map((r, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 border-b border-slate-100 p-4">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Opponent Argued</div>
                  <p className="text-sm text-slate-700 italic border-l-2 border-slate-300 pl-3">"{r.input}"</p>
                </div>
                <div className="p-5">
                  <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-3 flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Your Rebuttals</div>
                  <ReactMarkdown className="prose prose-sm max-w-none prose-slate prose-p:leading-relaxed prose-li:my-1">{r.output}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <div className="grid sm:grid-cols-4 gap-2 mb-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Skill level</label>
                    <select value={agentSkill} onChange={e => setAgentSkill(e.target.value)} className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-black appearance-none [&>option]:text-black">
                      {["new","beginner","intermediate","advanced","expert"].map(l => <option key={l} value={l} className="capitalize">{l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Min key facts/stats</label>
                    <input type="number" min={1} max={50} value={minKeyFacts} onChange={e => setMinKeyFacts(Math.min(50, Math.max(1, +e.target.value || 1)))} className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-black" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Min logic points</label>
                    <input type="number" min={1} max={50} value={minLogicPoints} onChange={e => setMinLogicPoints(Math.min(50, Math.max(1, +e.target.value || 1)))} className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-black" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Min contentions</label>
                    <input type="number" min={1} max={50} value={minContentions} onChange={e => setMinContentions(Math.min(50, Math.max(1, +e.target.value || 1)))} className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-black" />
                  </div>
                </div>
                <input
                  value={agentContext}
                  onChange={e => setAgentContext(e.target.value)}
                  placeholder="Extra context / focus (optional) — e.g. 'focus on economic impacts'"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-primary"
                />
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
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" onClick={saveResearchToDoc} className="gap-1.5 text-xs">
                      <FileDown className="w-3.5 h-3.5" /> Save to All Docs
                    </Button>
                  </div>
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
                            <span className="shrink-0 font-bold text-blue-500">{i+1}.</span>
                            <span>{typeof f === 'string' ? f : f.fact}{typeof f === 'object' && f.source && <span className="text-blue-500"> — {f.source}</span>}{typeof f === 'object' && f.url && <a href={f.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-blue-600 hover:underline ml-1"><ExternalLink className="w-3 h-3" />link</a>}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {agentResults.logicPoints?.length > 0 && (
                    <div className="bg-violet-50 rounded-2xl border border-violet-100 p-5">
                      <h4 className="font-bold text-violet-900 font-heading text-sm mb-3 flex items-center gap-1.5"><Lightbulb className="w-4 h-4" /> Logical Points (derived from sources)</h4>
                      <ul className="space-y-2">
                        {agentResults.logicPoints.map((p, i) => (
                          <li key={i} className="text-sm text-violet-800 flex gap-2">
                            <span className="shrink-0 font-bold text-violet-500">{i+1}.</span>
                            <span>{p.point}{p.source && <span className="text-violet-500"> — {p.source}</span>}{p.url && <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-violet-600 hover:underline ml-1"><ExternalLink className="w-3 h-3" />link</a>}</span>
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
                  {agentResults.biasAssessment && (
                    <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
                      <h4 className="font-bold text-amber-900 font-heading text-sm mb-2 flex items-center gap-1.5"><Scale className="w-4 h-4" /> Bias Assessment</h4>
                      <p className="text-sm text-amber-800 leading-relaxed">{agentResults.biasAssessment}</p>
                    </div>
                  )}
                  {agentResults.sources?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                      <h4 className="font-bold text-slate-900 font-heading text-sm mb-3">📚 All Sources</h4>
                      <ul className="space-y-1.5">
                        {agentResults.sources.map((s, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-center gap-1.5">
                            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                            {s.url ? <a href={s.url} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">{s.title || s.url}</a> : <span>{s.title}</span>}
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
        <ProjectAIChats project={project} contentions={contentions} conferenceContext={conferenceContext} />
      )}

      {/* Collab Tab */}
      {tab === "collab" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 font-heading flex items-center gap-2 mb-4"><Users className="w-5 h-5 text-primary" /> Collaborators</h3>
            <div className="flex gap-2 mb-6">
              <Input placeholder="User ID / Friend Code" value={collabUserId} onChange={e=>setCollabUserId(e.target.value)} className="text-sm"/>
              <select value={collabRole} onChange={e=>setCollabRole(e.target.value)} className="border border-input rounded-md px-3 text-sm bg-white text-black [&>option]:text-black">
                <option value="viewer">Viewer</option>
                <option value="contributor">Contributor</option>
                <option value="editor">Editor</option>
              </select>
              <Button size="sm" onClick={()=>addCollaborator.mutate()} disabled={addCollaborator.isPending || !collabUserId.trim()}>Invite</Button>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Team</h4>
              {collaborators.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-medium text-sm text-slate-800">{c.userName}</span>
                  <span className="text-xs px-2 py-1 bg-slate-200 text-slate-700 rounded capitalize">{c.role}</span>
                </div>
              ))}
              {collaborators.length === 0 && <p className="text-sm text-slate-500 italic">No collaborators yet. Add friends using their ID.</p>}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <h3 className="font-bold text-slate-900 font-heading flex items-center gap-2 mb-4 shrink-0"><Activity className="w-5 h-5 text-blue-500" /> Activity Log</h3>
            <div className="flex-1 overflow-y-auto space-y-4">
              {activityLog.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No activity recorded yet.</p>
              ) : activityLog.map(log => (
                <div key={log.id} className="relative pl-6 pb-2 border-l-2 border-slate-100 last:border-0 last:pb-0">
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1"></div>
                  <div className="text-xs text-slate-400 mb-0.5">{new Date(log.created_date).toLocaleString()}</div>
                  <div className="text-sm">
                    <span className="font-semibold text-slate-800">{log.userName}</span>{' '}
                    <span className="text-slate-600">{log.action}</span>
                  </div>
                  {log.details && <div className="text-xs text-slate-500 mt-1">{log.details}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Docs tab */}
      {tab === "alldocs" && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-violet-500" />
              <h3 className="font-bold text-slate-900 font-heading text-sm">All Documents</h3>
            </div>
            <p className="text-xs text-slate-500">Every document in this project — contentions, saved research, and custom documents — lives here.</p>
          </div>

          {/* Contentions as documents */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Contentions ({contentions.length})</h4>
            {contentions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No contentions yet.</p>
            ) : (
              <div className="space-y-2">
                {contentions.map(c => (
                  <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-3">
                    <h5 className="font-semibold text-sm text-slate-900">{c.title}</h5>
                    {c.claim && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{c.claim}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom + research documents */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Custom & Research Documents ({otherDocs.length})</h4>
            {otherDocs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No documents yet — generate one below.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {otherDocs.map(doc => (
                  <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 font-heading text-sm">{doc.title}</h4>
                        {doc.docLabel && <span className="inline-block text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium mt-1">{doc.docLabel}</span>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => copyOtherDoc(doc.content)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors" title="Copy">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteOtherDoc.mutate(doc.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <details className="group">
                      <summary className="text-xs text-violet-600 font-medium cursor-pointer hover:underline select-none">View full document</summary>
                      <pre className="text-xs leading-relaxed text-slate-700 font-mono whitespace-pre-wrap mt-3">{doc.content}</pre>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>

          <OtherDocGenerator
            projectId={id}
            onSaved={() => queryClient.invalidateQueries({ queryKey: ['project_other_documents', id] })}
          />
        </div>
      )}
    </div>
    </AnimatedPage>
  );
}