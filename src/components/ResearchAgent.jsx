import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Globe, Sparkles, Loader2, FileDown, Lightbulb, ExternalLink, Scale, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

/**
 * Web research agent. Works with or without a project.
 *  - project (optional): when provided, research is scoped to it and results
 *    can be saved into the project's All Docs / turned into contentions.
 *  - conferenceContext (optional): conference rules text to ground findings.
 *  - onResults (optional): lift the latest results up (e.g. for a Flow tab).
 *  - onSaved / onActivity (optional): callbacks after saving / for activity logs.
 */
export default function ResearchAgent({ project, conferenceContext, onResults, onSaved, onActivity }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [agentQuery, setAgentQuery] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentResults, setAgentResults] = useState(null);
  const [agentSkill, setAgentSkill] = useState("intermediate");
  const [agentContext, setAgentContext] = useState("");
  const [minKeyFacts, setMinKeyFacts] = useState(3);
  const [minLogicPoints, setMinLogicPoints] = useState(3);
  const [minContentions, setMinContentions] = useState(2);

  const projectId = project?.id;

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

  const runAgent = async () => {
    if (!agentQuery.trim() || agentLoading || project?.isArchived) return;
    setAgentLoading(true);
    setAgentResults(null);
    const q = agentQuery.trim();
    const contextParts = [project?.resolution, project?.format, project?.side].filter(Boolean);
    const context = contextParts.length ? contextParts.join(', ') : "general research (no specific project)";
    const activeAiMode = getActiveAiMode();
    const whitelist = project?.whitelist || [];
    const blacklist = project?.blacklist || [];
    const strict = project?.strictMode;

    let promptText = `You are a research agent for competitive debate, Model United Nations, and Model Congress preparation.
${project ? `The user is working on the project "${project.name}".` : "The user is doing standalone research with no specific project."} Context: ${context}.
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

    try {
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
      if (onResults) onResults(res);
    } catch (e) {
      toast({ title: "Research failed. Try again.", variant: "destructive" });
    } finally {
      setAgentLoading(false);
    }
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
    try {
      await base44.entities.OtherDocument.create({
        title: `Research: ${agentQuery.trim().slice(0, 80)}`,
        docLabel: "Research",
        description: agentQuery.trim(),
        content,
        projectId: projectId || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['other_documents'] });
      if (projectId) queryClient.invalidateQueries({ queryKey: ['project_other_documents', projectId] });
      if (onActivity) onActivity("Saved Research", `Saved research on "${agentQuery.trim().slice(0, 60)}".`);
      toast({ title: projectId ? "Research saved to All Docs!" : "Research saved to your library!" });
      if (onSaved) onSaved();
    } catch (e) {
      toast({ title: "Save failed. Try again.", variant: "destructive" });
    }
  };

  const addAgentContention = async (title) => {
    if (!projectId) return;
    await base44.entities.Contention.create({
      ownerUserId: user?.id,
      title,
      format: ["parliamentary", "public_forum"].includes(project?.format) ? project.format : "public_forum",
      resolution: project?.resolution || "",
      side: project?.side || "",
      claim: `Research-based argument: ${title}`,
      projectId,
    });
    queryClient.invalidateQueries({ queryKey: ['project_contentions', projectId] });
    toast({ title: "Contention added from research!" });
  };

  const placeholder = project ? `Research topic for "${project.name}"...` : "Research any topic — debate, MUN, Congress, policy...";

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-primary" />
          <div>
            <h3 className="font-bold text-slate-900 font-heading text-sm">Web Research Agent</h3>
            <p className="text-xs text-slate-400">Searches the web for debate-relevant info and suggests contentions{project ? "" : " — save results to your library anytime"}</p>
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
            placeholder={placeholder}
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
              <FileDown className="w-3.5 h-3.5" /> {projectId ? "Save to All Docs" : "Save to Library"}
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
                    {projectId && <Button size="sm" variant="outline" onClick={() => addAgentContention(c)} className="text-xs shrink-0 gap-1"><Plus className="w-3 h-3" /> Add</Button>}
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
    </div>
  );
}