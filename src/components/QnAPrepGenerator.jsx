import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Save, HelpCircle, ClipboardPaste, FileText, Folder } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from "react-markdown";

export default function QnAPrepGenerator({ projectId, contentions = [], otherDocs = [], onSaved }) {
  const { toast } = useToast();
  const [mode, setMode] = useState("paste"); // "paste" | "select"
  const [pastedText, setPastedText] = useState("");
  const [selectedDocId, setSelectedDocId] = useState("");
  const [prep, setPrep] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // For standalone (no projectId): fetch user's documents to select from
  const { data: myDocs = [] } = useQuery({
    queryKey: ['other_documents'],
    queryFn: () => base44.entities.OtherDocument.list('-created_date'),
    enabled: !projectId,
  });

  // For standalone: fetch projects for save-to-project dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.filter({ isArchived: false }),
    enabled: !projectId,
  });
  const [pickedProjectId, setPickedProjectId] = useState(projectId || "");

  // Build a unified list of selectable source docs
  const selectableDocs = projectId
    ? [
        ...contentions.map(c => ({ id: c.id, type: "contention", title: c.title, content: [c.claim, c.warrant, c.impact].filter(Boolean).join("\n\n") })),
        ...otherDocs.map(d => ({ id: d.id, type: "doc", title: d.title, content: d.content })),
      ]
    : myDocs.map(d => ({ id: d.id, type: "doc", title: d.title, content: d.content }));

  const selectedDoc = selectableDocs.find(d => d.id === selectedDocId);
  const sourceText = mode === "paste" ? pastedText : (selectedDoc?.content || "");

  const generate = async () => {
    if (!sourceText.trim() || loading) return;
    setLoading(true);
    setPrep("");

    const promptText = `You are an expert debate coach preparing a student for Q&A / cross-examination.

Below is a document (a speech, contention, case, or position) the student will be defending or presenting:

"""
${sourceText.slice(0, 8000)}
"""

Generate a comprehensive Q&A preparation sheet. Structure it as:

## Likely Questions
List 6-8 sharp, challenging questions a judge, opponent, or committee member would ask about this content. Group them by theme if natural.

## Suggested Answers
For EACH question above, provide a concise, confident suggested answer that:
- Directly addresses the question (no evasion)
- Cites specific evidence or logic from the document where possible
- Stays grounded in the actual content — no fabricated stats or invented sources
- Is spoken in first person as the presenter

## Weak Spots
Identify 2-3 areas where the argument is most vulnerable and give a one-line tip for handling each.

IMPORTANT:
- STAY ON TOPIC: Every question and answer must be grounded in the specific content above. Do NOT generate generic debate Q&A.
- ORIGINALITY: Vary question phrasing and answer structure — no formulaic repetition.`;

    const res = await base44.integrations.Core.InvokeLLM({ prompt: promptText });
    setPrep(res);
    if (!title) setTitle(selectedDoc ? `${selectedDoc.title} — Q&A Prep` : "Q&A Prep Sheet");
    setLoading(false);
  };

  const save = useMutation({
    mutationFn: async () => {
      const saveProjectId = projectId || pickedProjectId || "";
      return base44.entities.OtherDocument.create({
        title: title || "Q&A Prep Sheet",
        docLabel: "Q&A Prep",
        content: prep,
        projectId: saveProjectId || undefined,
        description: sourceText.slice(0, 500),
      });
    },
    onSuccess: () => {
      toast({ title: "Q&A prep saved!" });
      setPrep("");
      setTitle("");
      setPastedText("");
      setSelectedDocId("");
      if (onSaved) onSaved();
    },
    onError: () => toast({ title: "Could not save", variant: "destructive" }),
  });

  const handleSave = () => {
    if (!prep.trim() || save.isPending) return;
    save.mutate();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 font-heading">Q&A Prep Generator</h3>
          <p className="text-xs text-slate-500">Paste a doc or pick one — AI generates likely questions, suggested answers, and weak spots.</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("paste")}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${mode === "paste" ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
        >
          <ClipboardPaste className="w-3.5 h-3.5" /> Paste Text
        </button>
        <button
          onClick={() => setMode("select")}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${mode === "select" ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
        >
          <FileText className="w-3.5 h-3.5" /> Select a Doc
        </button>
      </div>

      {mode === "paste" ? (
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Paste your document, speech, or contention below</label>
          <Textarea
            value={pastedText}
            onChange={e => setPastedText(e.target.value)}
            placeholder="Paste the full text of the speech, case, or argument you want to be prepped on..."
            rows={6}
            className="resize-none text-sm"
          />
        </div>
      ) : (
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Choose a document to prep from</label>
          {selectableDocs.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No documents available. {projectId ? "Add contentions or docs first." : "Create documents in the Other Documents page first."}</p>
          ) : (
            <Select value={selectedDocId} onValueChange={setSelectedDocId}>
              <SelectTrigger><SelectValue placeholder="Pick a document..." /></SelectTrigger>
              <SelectContent>
                {selectableDocs.map(d => (
                  <SelectItem key={d.id} value={d.id}>
                    <span className="flex items-center gap-1.5">
                      {d.type === "contention" ? <FileText className="w-3 h-3" /> : <Folder className="w-3 h-3" />}
                      {d.title}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {selectedDoc && (
            <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{selectedDoc.content}</p>
          )}
        </div>
      )}

      <Button onClick={generate} disabled={loading || !sourceText.trim()} className="w-full h-11 gap-2 font-semibold bg-amber-600 hover:bg-amber-700">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? "Generating Q&A prep..." : "Generate Q&A Prep"}
      </Button>

      {prep && (
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" /> Q&A Prep Sheet
          </div>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title for this prep sheet" className="text-sm font-semibold" />

          <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 max-h-[400px] overflow-y-auto">
            <ReactMarkdown className="prose prose-sm max-w-none prose-slate prose-p:leading-relaxed prose-li:my-1 prose-headings:font-bold">{prep}</ReactMarkdown>
          </div>

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

          <Button onClick={handleSave} disabled={saving || !prep.trim()} className="w-full gap-2 bg-amber-600 hover:bg-amber-700">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : projectId ? "Save to This Project" : "Save Prep Sheet"}
          </Button>
        </div>
      )}
    </div>
  );
}