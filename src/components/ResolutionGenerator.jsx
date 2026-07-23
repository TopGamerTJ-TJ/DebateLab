import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Save, ScrollText, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const FORMATS = [
  { value: "public_forum", label: "Public Forum" },
  { value: "parliamentary", label: "Parliamentary" },
  { value: "policy", label: "Policy (CX)" },
  { value: "lincoln_douglas", label: "Lincoln-Douglas" },
  { value: "model_congress", label: "Model Congress (Bill topic)" },
  { value: "model_un", label: "Model UN (Resolution)" },
  { value: "any", label: "Any format" },
];

const DIFFICULTIES = ["Novice", "Intermediate", "Advanced", "TOC-level"];

export default function ResolutionGenerator({ projectId, onSaved }) {
  const { toast } = useToast();
  const [format, setFormat] = useState("public_forum");
  const [topicArea, setTopicArea] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [count, setCount] = useState("5");
  const [results, setResults] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingIdx, setSavingIdx] = useState(null);
  const [savedIdxs, setSavedIdxs] = useState(new Set());
  const [copiedIdx, setCopiedIdx] = useState(null);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.filter({ isArchived: false }),
    enabled: !projectId,
  });
  const [pickedProjectId, setPickedProjectId] = useState(projectId || "");

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setResults("");
    setSavedIdxs(new Set());

    const formatLabel = FORMATS.find(f => f.value === format)?.label || format;

    const promptText = `You are an expert debate tournament director who writes competition-ready resolutions.

Generate ${count} ${difficulty}-level ${formatLabel} resolutions${topicArea.trim() ? ` related to the topic area: "${topicArea.trim()}"` : ""}.

Requirements:
- Each resolution must be phrased correctly for the format:
  • PF / Policy / LD: Start with "Resolved: " and use proper policy-style wording
  • Parliamentary: Use "This House believes that..." or "This House would..."
  • Model Congress: Phrase as a bill topic ("A Bill to..." or topic for legislation)
  • Model UN: Use formal UN resolution operative clauses ("Urges Member States to...", "Calls upon...")
- Each resolution must be debatable from both sides (pro and con)
- Each must be specific enough to research but broad enough for clash
- Number them 1, 2, 3, etc.
- Below each resolution, add a one-line "Why it works" note explaining the core clash/tension

IMPORTANT:
- ORIGINALITY: Every resolution must be unique and distinct. No repetitive phrasing or formulaic structures.
- STAY ON TOPIC: ${topicArea.trim() ? `Every resolution must directly relate to "${topicArea.trim()}".` : "Make each resolution about a genuinely different subject area."}`;

    const res = await base44.integrations.Core.InvokeLLM({ prompt: promptText });
    setResults(res);
    setLoading(false);
  };

  // Parse numbered resolutions from the markdown response
  const parsed = results
    .split(/\n(?=\d+\.\s)/)
    .map(block => block.trim())
    .filter(Boolean);

  const copyResolution = (text, idx) => {
    const clean = text.split('\n').filter(l => !/^Why it works/i.test(l)).join('\n').trim();
    navigator.clipboard.writeText(clean);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    toast({ title: "Copied!" });
  };

  const saveResolution = useMutation({
    mutationFn: async ({ text, idx }) => {
      const clean = text.split('\n').filter(l => !/^Why it works/i.test(l)).join('\n').trim();
      const firstLine = clean.split('\n')[0].replace(/^\d+\.\s*/, '').replace(/^Resolved:\s*/i, '').trim();
      const saveProjectId = projectId || pickedProjectId || "";
      return base44.entities.OtherDocument.create({
        title: firstLine.slice(0, 120) || "Debate Resolution",
        docLabel: "Resolution",
        content: clean,
        description: `${FORMATS.find(f => f.value === format)?.label} • ${difficulty}${topicArea ? ` • ${topicArea}` : ""}`,
        projectId: saveProjectId || undefined,
      });
    },
    onSuccess: (_, { idx }) => {
      setSavedIdxs(prev => new Set(prev).add(idx));
      toast({ title: "Resolution saved!" });
      if (onSaved) onSaved();
    },
    onError: () => toast({ title: "Could not save", variant: "destructive" }),
    onSettled: () => setSavingIdx(null),
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
          <ScrollText className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 font-heading">Resolution Generator</h3>
          <p className="text-xs text-slate-500">Generate competition-ready debate resolutions for any format.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Format</label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FORMATS.map(f => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Difficulty</label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Topic area (optional)</label>
          <Input
            value={topicArea}
            onChange={e => setTopicArea(e.target.value)}
            placeholder="e.g. climate policy, AI regulation, healthcare..."
            className="text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">How many?</label>
          <Select value={count} onValueChange={setCount}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["3", "5", "8", "10"].map(n => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={generate} disabled={loading} className="w-full h-11 gap-2 font-semibold bg-indigo-600 hover:bg-indigo-700">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? "Generating resolutions..." : "Generate Resolutions"}
      </Button>

      {parsed.length > 0 && (
        <div className="border-t border-slate-100 pt-4 space-y-3">
          {!projectId && (
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Save resolutions to project (optional)</label>
              <Select value={pickedProjectId} onValueChange={setPickedProjectId}>
                <SelectTrigger><SelectValue placeholder="Library only — or pick a project" /></SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            {parsed.map((block, idx) => {
              const isSaved = savedIdxs.has(idx);
              return (
                <div key={idx} className="bg-slate-50 rounded-xl border border-slate-100 p-3 group">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap flex-1">{block}</p>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => copyResolution(block, idx)}
                        className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                        title="Copy"
                      >
                        {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => { setSavingIdx(idx); saveResolution.mutate({ text: block, idx }); }}
                        disabled={isSaved || savingIdx === idx}
                        className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-40"
                        title={isSaved ? "Saved" : "Save"}
                      >
                        {savingIdx === idx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isSaved ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Save className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}