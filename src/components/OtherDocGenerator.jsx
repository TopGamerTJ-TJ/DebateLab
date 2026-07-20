import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Save, Folder, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

/**
 * Reusable free-form AI document generator for "other" documents that don't
 * fit into the standard bill/resolution/position-paper/speech categories.
 *
 * Props:
 *  - projectId (string, optional): when set, documents save directly to this project.
 *  - onSaved (fn, optional): called after a successful save.
 */
const QUICK_TEMPLATES = [
  {
    label: "P.E.G.S. Plan",
    chip: "📊 P.E.G.S. Plan",
    docLabel: "P.E.G.S. Plan",
    description: `Generate a P.E.G.S. country analysis plan for Model UN. Replace [COUNTRY] below with your assigned country, and [TOPIC] with your committee topic if relevant.

Country: [COUNTRY]
Topic (if any): [TOPIC]

Structure the plan into the four P.E.G.S. lenses:
- Political: Who leads the government? Democracy, monarchy, or military rule? Key political dynamics.
- Economic: Is the country rich or developing? Major industries and influencing factors.
- Geographic: Where is it located? Allies and neighbors? Natural resources.
- Society: Population, culture, ethnic groups, beliefs, and key struggles.

Then add: the country's likely position on the topic, 2-3 strategic discussion points grounded in national interests / security / economics / politics / history, and natural allies & likely opponents in committee.`,
  },
];

export default function OtherDocGenerator({ projectId, onSaved }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [context, setContext] = useState("");
  const [docLabel, setDocLabel] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickedProjectId, setPickedProjectId] = useState("");

  // Only fetch project list when no fixed projectId is provided (standalone page).
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const all = await base44.entities.Project.list('-created_date');
      return all.filter(p => !p.isArchived);
    },
    enabled: !projectId,
  });

  const generate = async () => {
    if (!description.trim()) {
      toast({ title: "Describe what document you need first", variant: "destructive" });
      return;
    }
    setGenerating(true);
    setContent("");

    const prompt = `You are an expert assistant for competitive debate, Model United Nations, and Model Congress preparation.

The user needs a custom document that does NOT fit into the standard document types available elsewhere (bills, resolutions, position papers, draft resolutions, opening speeches, contentions, etc.). It is something bespoke — generate it from scratch based on their description.

WHAT THE USER WANTS:
${description.trim()}

${context ? `ADDITIONAL CONTEXT / INSTRUCTIONS:\n${context.trim()}\n` : ""}
${docLabel ? `DOCUMENT TYPE LABEL: ${docLabel}\n` : ""}

REQUIREMENTS:
- Produce a complete, well-structured, tournament-ready document.
- Use clear headings, numbered or bulleted lists, and professional formatting appropriate to the document type.
- Be specific, substantive, and practical — no placeholder text.
- Write in a polished, confident tone suited to competitive debate / MUN / Congress preparation.
- If the described document implies a known structure (e.g. a briefing memo, cross-examination prep sheet, flow template, judge adaptation guide, research summary, alliance map), follow that structure faithfully.
- Output ONLY the document content (with a clear title at the top). Do not add meta-commentary about the document.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: "claude_sonnet_4_6",
      });
      // Derive a default title from the first non-empty line if the user hasn't set one.
      const firstLine = (result || "").split("\n").map(l => l.trim()).filter(Boolean)[0] || "Untitled Document";
      const cleanTitle = firstLine.replace(/^#+\s*/, "").replace(/[*_`]/g, "").slice(0, 100);
      setTitle(cleanTitle);
      setContent(result);
      toast({ title: "Document generated! Review and save it." });
    } catch (e) {
      toast({ title: "Generation failed. Try again.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: "Nothing to save yet", variant: "destructive" });
      return;
    }
    const targetProjectId = projectId || pickedProjectId || "";
    setSaving(true);
    try {
      await base44.entities.OtherDocument.create({
        ownerUserId: undefined,
        title: title.trim(),
        docLabel: docLabel.trim() || "Other Document",
        description: description.trim(),
        content,
        projectId: targetProjectId || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['other_documents'] });
      queryClient.invalidateQueries({ queryKey: ['project_other_documents', targetProjectId] });
      // Reset
      setDescription("");
      setContext("");
      setDocLabel("");
      setTitle("");
      setContent("");
      setPickedProjectId("");
      toast({ title: targetProjectId ? "Saved to project!" : "Saved to library!" });
      if (onSaved) onSaved();
    } catch (e) {
      toast({ title: "Save failed. Try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 font-heading">Custom Document Generator</h3>
          <p className="text-xs text-slate-500">Describe any document you need and the AI will build it</p>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 mb-1.5 block">Quick templates</label>
        <div className="flex flex-wrap gap-2">
          {QUICK_TEMPLATES.map(t => (
            <button key={t.label} type="button" onClick={() => { setDescription(t.description); setDocLabel(t.docLabel); }} className="text-xs px-3 py-1.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors">
              {t.chip}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 mb-1.5 block">What document do you need?</label>
        <Textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g. A cross-examination prep sheet for an opponent arguing that renewable energy can't scale fast enough, a one-page briefing memo on how to adapt to a lay judge, a flow template for tracking arguments in a PF round..."
          rows={3}
          className="resize-none text-sm"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Document label (optional)</label>
          <Input
            value={docLabel}
            onChange={e => setDocLabel(e.target.value)}
            placeholder="e.g. Cross-Ex Prep, Briefing Memo"
            className="text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Extra context (optional)</label>
          <Input
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="Side, topic, length, tone..."
            className="text-sm"
          />
        </div>
      </div>

      <Button onClick={generate} disabled={generating} className="w-full h-11 gap-2 font-semibold bg-violet-600 hover:bg-violet-700">
        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {generating ? "Generating document..." : "Generate Document"}
      </Button>
      {generating && <p className="text-xs text-center text-slate-400">Using Claude AI for highest quality output...</p>}

      {(title || content) && (
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" /> Review & Edit
          </div>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Document title" className="text-sm font-semibold" />
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Generated document will appear here..."
            rows={14}
            className="resize-none text-xs font-mono leading-relaxed"
          />

          {!projectId && (
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Save to project (optional)</label>
              <Select value={pickedProjectId} onValueChange={setPickedProjectId}>
                <SelectTrigger><SelectValue placeholder="Library only — or pick a project" /></SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-1.5"><Folder className="w-3 h-3" />{p.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={save} disabled={saving || !content.trim()} className="w-full gap-2 bg-violet-600 hover:bg-violet-700">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : projectId ? "Save to This Project" : "Save Document"}
          </Button>
        </div>
      )}
    </div>
  );
}