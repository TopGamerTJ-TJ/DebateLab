import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Copy, Save, Mic } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/components/ui/use-toast";

/**
 * Generates a full written speech from ALL project info:
 * resolution, side, format, notes, contentions, rebuttals, research, docs, conference rules.
 * Props: project, contentions, rebuttals, otherDocs, agentResults, conferenceContext, onSaved
 */
export default function ProjectSpeechGenerator({ project, contentions, rebuttals, otherDocs, agentResults, conferenceContext, onSaved }) {
  const { toast } = useToast();
  const [minutes, setMinutes] = useState(7);
  const [tone, setTone] = useState("persuasive");
  const [loading, setLoading] = useState(false);
  const [speech, setSpeech] = useState("");
  const [saving, setSaving] = useState(false);

  const buildContext = () => {
    const parts = [];
    parts.push(`Resolution: ${project?.resolution || project?.name || "(not set)"}`);
    if (project?.side) parts.push(`Side: ${project.side}`);
    if (project?.format) parts.push(`Format: ${project.format.replace(/_/g, ' ')}`);
    if (project?.notes) parts.push(`Project notes: ${project.notes}`);

    if (contentions.length > 0) {
      parts.push("\nCONTENTIONS:");
      contentions.forEach((c, i) => {
        parts.push(`\n${i + 1}. ${c.title}`);
        if (c.claim) parts.push(`   Claim: ${c.claim}`);
        if (c.warrant) parts.push(`   Warrant: ${c.warrant}`);
        if (c.impact) parts.push(`   Impact: ${c.impact}`);
        if (c.evidence?.length > 0) parts.push(`   Evidence: ${c.evidence.map(e => e.text).join('; ')}`);
      });
    }

    if (rebuttals.length > 0) {
      parts.push("\nPREPARED REBUTTALS:");
      rebuttals.forEach((r, i) => {
        parts.push(`\nOpponent argument ${i + 1}: ${r.input}`);
        parts.push(`Your response: ${typeof r.output === 'string' ? r.output : ''}`);
      });
    }

    if (agentResults) {
      parts.push("\nRESEARCH FINDINGS:");
      if (agentResults.summary) parts.push(`Summary: ${agentResults.summary}`);
      if (agentResults.keyFacts?.length > 0) {
        parts.push("Key facts/stats:");
        agentResults.keyFacts.forEach((f, i) => parts.push(`  ${i + 1}. ${typeof f === 'string' ? f : f.fact}${typeof f === 'object' && f.source ? ` (Source: ${f.source})` : ''}`));
      }
      if (agentResults.logicPoints?.length > 0) {
        parts.push("Logic points:");
        agentResults.logicPoints.forEach((l, i) => parts.push(`  ${i + 1}. ${typeof l === 'string' ? l : l.point || l}`));
      }
    }

    if (otherDocs?.length > 0) {
      parts.push("\nOTHER PROJECT DOCUMENTS:");
      otherDocs.forEach(d => parts.push(`- ${d.title}: ${(d.content || '').slice(0, 400)}`));
    }

    if (conferenceContext) parts.push(`\nCONFERENCE RULES / CONTEXT:\n${conferenceContext}`);

    return parts.join("\n");
  };

  const generate = async () => {
    setLoading(true);
    setSpeech("");
    try {
      const context = buildContext();
      const prompt = `You are an elite debate coach writing a complete, ready-to-deliver speech.

PROJECT CONTEXT:
${context}

Write a full ${minutes}-minute speech (approximately ${Math.round(minutes * 130)} words) for the ${project?.side || 'assigned'} side.

Tone: ${tone}.

Requirements:
- Write the ACTUAL speech text, ready to be read aloud — not an outline or instructions.
- Structure: strong hook + state the resolution → contentions (with claim, warrant, impact, and cite evidence/research) → preempt and rebut likely opponent arguments → weighing → powerful conclusion with a call to vote ${project?.side || 'your side'}.
- Use the contentions, evidence, research facts, and prepared rebuttals above. Weave them in naturally.
- Include brief [pause] or [transition] cues where helpful for delivery.
- Stay within ${minutes} minutes when spoken at a normal pace (~130 words/minute). Aim for ~${Math.round(minutes * 130)} words.
- Format with clear section headers (## Introduction, ## Contention 1, etc.) using Markdown.`;

      const res = await base44.integrations.Core.InvokeLLM({ prompt, add_context_from_internet: false });
      setSpeech(typeof res === 'string' ? res : JSON.stringify(res));
    } catch (e) {
      toast({ title: "Failed to generate speech", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copySpeech = () => {
    navigator.clipboard.writeText(speech);
    toast({ title: "Speech copied!" });
  };

  const saveSpeech = async () => {
    setSaving(true);
    try {
      await base44.entities.OtherDocument.create({
        title: `${minutes}-min Speech — ${project?.name || 'Project'}`,
        docLabel: "Generated Speech",
        content: speech,
        projectId: project?.id,
        ownerUserId: project?.ownerUserId,
      });
      toast({ title: "Speech saved to All Docs!" });
      if (onSaved) onSaved();
    } catch (e) {
      toast({ title: "Failed to save", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Mic className="w-4 h-4 text-violet-500" />
        <div>
          <h3 className="font-bold text-slate-900 font-heading text-sm">Speech Generator</h3>
          <p className="text-xs text-slate-500">Generates a full, ready-to-deliver speech from everything in this project — contentions, research, rebuttals, and notes.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Speech length</label>
          <input type="number" min={0.5} max={30} step={0.5} value={minutes} onChange={e => setMinutes(Math.min(30, Math.max(0.5, +e.target.value || 0.5)))} className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-black" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Tone</label>
          <select value={tone} onChange={e => setTone(e.target.value)} className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-black">
            <option value="persuasive">Persuasive</option>
            <option value="conversational">Conversational</option>
            <option value="formal">Formal</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button onClick={generate} disabled={loading || !project} className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Generating..." : "Generate Speech"}
          </Button>
        </div>
      </div>

      {contentions.length === 0 && !agentResults && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
          Tip: add contentions or run the Research Agent first — the generator works best with project material to draw from.
        </p>
      )}

      {speech && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">~{Math.round(speech.split(/\s+/).length / 130 * 10) / 10} min read · {speech.split(/\s+/).length} words</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copySpeech} className="gap-1.5 text-xs"><Copy className="w-3.5 h-3.5" /> Copy</Button>
              <Button size="sm" variant="outline" onClick={saveSpeech} disabled={saving} className="gap-1.5 text-xs">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save to Docs
              </Button>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 max-h-[600px] overflow-y-auto">
            <ReactMarkdown className="prose prose-sm max-w-none prose-slate prose-p:leading-relaxed prose-headings:text-slate-900 prose-h2:text-base prose-h2:mt-4 prose-li:my-0.5">{speech}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}