import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Save, BookOpen, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ContentionCard from "./ContentionCard";

const BATCH_SIZE = 8;

const SCHEMA = {
  type: "object",
  properties: {
    contentions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          claim: { type: "string" },
          warrant: { type: "string" },
          impact: { type: "string" },
          evidence: { type: "array", items: { type: "object", properties: { text: { type: "string" }, source: { type: "string" }, sourceUrl: { type: "string" } }, required: ["text", "source", "sourceUrl"] } },
          possibleRebuttals: { type: "array", items: { type: "string" } },
          rebuttalResponses: { type: "array", items: { type: "string" } },
          crossfireQuestions: { type: "array", items: { type: "string" } },
          crossfireAnswers: { type: "array", items: { type: "string" } },
          strategicNotes: { type: "string" }
        },
        required: ["title", "claim", "warrant", "impact", "evidence", "possibleRebuttals", "rebuttalResponses", "crossfireQuestions", "crossfireAnswers", "strategicNotes"]
      }
    }
  },
  required: ["contentions"]
};

async function generateBatch(count, form, format) {
  const fmtLabel = format === "parliamentary" ? "Parliamentary" : "Public Forum";
  const motionLabel = format === "parliamentary" ? "Motion" : "Resolution";
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Generate ${count} complete tournament-ready contentions for ${fmtLabel} debate.

${motionLabel}: "${form.resolution}"
Side: ${form.side}
Difficulty: ${form.difficulty}
Evidence preference: ${form.evidencePreference}

Create comprehensive, tournament-quality contentions with real academic evidence, statistics, and expert citations. Include realistic source URLs. Make each contention distinct and strategically strong.

Return a JSON object with a "contentions" array. Each must include: title, claim, warrant, impact, evidence (array of {text, source, sourceUrl}), possibleRebuttals, rebuttalResponses, crossfireQuestions, crossfireAnswers, strategicNotes.`,
    response_json_schema: SCHEMA,
  });
  return result.contentions || [];
}

export default function ContentionGenerator({ format = "parliamentary" }) {
  const [activeTab, setActiveTab] = useState("generate");
  const [form, setForm] = useState({ resolution: "", side: "", count: "2", difficulty: "intermediate", evidencePreference: "academic" });
  const [generatedContentions, setGeneratedContentions] = useState([]);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: savedContentions = [] } = useQuery({
    queryKey: ['contentions', format],
    queryFn: () => base44.entities.Contention.filter({ format }),
  });

  const saveContention = useMutation({
    mutationFn: (c) => base44.entities.Contention.create({
      title: c.title, format, resolution: form.resolution || c.resolution, side: form.side || c.side,
      claim: c.claim, warrant: c.warrant, impact: c.impact, evidence: c.evidence,
      possibleRebuttals: c.possibleRebuttals, rebuttalResponses: c.rebuttalResponses,
      crossfireQuestions: c.crossfireQuestions, crossfireAnswers: c.crossfireAnswers,
      strategicNotes: c.strategicNotes, difficulty: form.difficulty,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contentions'] }); toast({ title: "Contention saved to library!" }); }
  });

  const deleteContention = useMutation({
    mutationFn: (id) => base44.entities.Contention.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contentions'] }); toast({ title: "Contention deleted" }); }
  });

  const generate = async () => {
    if (!form.resolution || !form.side) {
      toast({ title: "Please enter the resolution and select a side", variant: "destructive" }); return;
    }
    setGenerating(true);
    const total = parseInt(form.count);
    const batches = [];
    for (let i = 0; i < total; i += BATCH_SIZE) batches.push(Math.min(BATCH_SIZE, total - i));
    const batchResults = await Promise.all(batches.map(n => generateBatch(n, form, format)));
    setGeneratedContentions(batchResults.flat());
    setGenerating(false);
  };

  const sideOptions = format === "parliamentary"
    ? [{ v: "government", l: "Government (Prop)" }, { v: "opposition", l: "Opposition (Opp)" }]
    : [{ v: "affirmative", l: "Affirmative (Pro)" }, { v: "negative", l: "Negative (Con)" }];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button onClick={() => setActiveTab("generate")} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === "generate" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          Generate
        </button>
        <button onClick={() => setActiveTab("saved")} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === "saved" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          Saved ({savedContentions.length})
        </button>
      </div>

      {activeTab === "saved" && (
        <div className="space-y-4">
          {savedContentions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No saved contentions yet. Generate and save some!</p>
            </div>
          ) : savedContentions.map((c) => (
            <div key={c.id} className="relative">
              <ContentionCard contention={c} onSave={() => {}} saving={false} />
              <button
                onClick={() => deleteContention.mutate(c.id)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "generate" && (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 font-heading">Contention Generator</h3>
                <p className="text-xs text-slate-500">AI-powered tournament-ready arguments</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  {format === "parliamentary" ? "Motion" : "Resolution"}
                </label>
                <Textarea
                  value={form.resolution}
                  onChange={e => setForm({ ...form, resolution: e.target.value })}
                  placeholder={format === "parliamentary"
                    ? "e.g., This House Would ban social media for users under 16"
                    : "e.g., Resolved: The United States federal government should substantially reduce its military presence in East Asia"}
                  className="resize-none text-sm"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">Side</label>
                  <Select value={form.side} onValueChange={v => setForm({ ...form, side: v })}>
                    <SelectTrigger className="text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{sideOptions.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">Count</label>
                  <Select value={form.count} onValueChange={v => setForm({ ...form, count: v })}>
                    <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 40}, (_, i) => String(i + 1)).map(n => (
                        <SelectItem key={n} value={n}>{n} contention{n !== "1" ? "s" : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">Difficulty</label>
                  <Select value={form.difficulty} onValueChange={v => setForm({ ...form, difficulty: v })}>
                    <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["beginner", "intermediate", "advanced", "expert"].map(d => (
                        <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">Evidence</label>
                  <Select value={form.evidencePreference} onValueChange={v => setForm({ ...form, evidencePreference: v })}>
                    <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[["academic", "Academic"], ["news", "News Sources"], ["government", "Government"], ["mixed", "Mixed"]].map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={generate} disabled={generating} className="w-full h-11 gap-2 text-sm font-semibold">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? `Generating ${form.count} contentions...` : "Generate Contentions"}
              </Button>
            </div>
          </div>

          {generatedContentions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 font-heading flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Generated Contentions ({generatedContentions.length})
                </h3>
                <Button variant="outline" size="sm" onClick={() => generatedContentions.forEach(c => saveContention.mutate(c))} className="gap-1.5 text-xs">
                  <Save className="w-3.5 h-3.5" /> Save All
                </Button>
              </div>
              {generatedContentions.map((c, i) => (
                <ContentionCard key={i} contention={c} onSave={() => saveContention.mutate(c)} saving={saveContention.isPending} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}