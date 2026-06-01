import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Save, BookOpen } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ContentionCard from "./ContentionCard";

export default function ContentionGenerator({ format = "parliamentary" }) {
  const [form, setForm] = useState({ resolution: "", side: "", count: "2", difficulty: "intermediate", evidencePreference: "academic" });
  const [contentions, setContentions] = useState([]);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveContention = useMutation({
    mutationFn: (c) => base44.entities.Contention.create({
      title: c.title, format, resolution: form.resolution, side: form.side,
      claim: c.claim, warrant: c.warrant, impact: c.impact, evidence: c.evidence,
      possibleRebuttals: c.possibleRebuttals, rebuttalResponses: c.rebuttalResponses,
      crossfireQuestions: c.crossfireQuestions, crossfireAnswers: c.crossfireAnswers,
      weighingMechanisms: c.weighingMechanisms, strategicNotes: c.strategicNotes, difficulty: form.difficulty,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contentions'] }); toast({ title: "Contention saved to library!" }); }
  });

  const generate = async () => {
    if (!form.resolution || !form.side) {
      toast({ title: "Please enter the resolution and select a side", variant: "destructive" }); return;
    }
    setGenerating(true);
    const fmtLabel = format === "parliamentary" ? "Parliamentary" : "Public Forum";
    const motionLabel = format === "parliamentary" ? "Motion" : "Resolution";
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate ${form.count} complete tournament-ready contentions for ${fmtLabel} debate.

${motionLabel}: "${form.resolution}"
Side: ${form.side}
Difficulty: ${form.difficulty}
Evidence preference: ${form.evidencePreference}

Create comprehensive, tournament-quality contentions with real academic evidence, statistics, and expert citations. Include realistic source URLs from academic journals, government sites, or reputable organizations. Make each contention distinct and strategically strong.

Return a JSON object with a "contentions" array. Each contention must include:
- title: string (short name like "C1: Economic Growth Advantage")  
- claim: string (main argument, 1-2 sentences, bold and assertive)
- warrant: string (full reasoning with logic chain, 3-5 sentences explaining the mechanism)
- impact: string (significance and consequences, 2-3 sentences with magnitude and scope)
- evidence: array of {text: string (quote/statistic), source: string (author + organization), sourceUrl: string (realistic URL)}  — include 2-3 pieces
- possibleRebuttals: array of 3 common opposing arguments as strings
- rebuttalResponses: array of 3 responses matching each rebuttal
- crossfireQuestions: array of 3 strong crossfire questions to pressure opponents
- crossfireAnswers: array of 3 likely opponent responses to those questions
- weighingMechanisms: {magnitude: string, probability: string, timeframe: string, scope: string}
- strategicNotes: string (2-3 sentences of tournament-level strategic guidance)`,
      response_json_schema: {
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
      }
    });
    setContentions(result.contentions || []);
    setGenerating(false);
  };

  const sideOptions = format === "parliamentary"
    ? [{ v: "government", l: "Government (Prop)" }, { v: "opposition", l: "Opposition (Opp)" }]
    : [{ v: "affirmative", l: "Affirmative (Pro)" }, { v: "negative", l: "Negative (Con)" }];

  return (
    <div className="space-y-6">
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
                  {Array.from({length: 40}, (_, i) => String(i + 1)).map(n => <SelectItem key={n} value={n}>{n} contention{n !== "1" ? "s" : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Difficulty</label>
              <Select value={form.difficulty} onValueChange={v => setForm({ ...form, difficulty: v })}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["beginner", "intermediate", "advanced", "expert"].map(d => <SelectItem key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Evidence</label>
              <Select value={form.evidencePreference} onValueChange={v => setForm({ ...form, evidencePreference: v })}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[["academic", "Academic"], ["news", "News Sources"], ["government", "Government"], ["mixed", "Mixed"]].map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={generate} disabled={generating} className="w-full h-11 gap-2 text-sm font-semibold">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Generating tournament-ready contentions..." : "Generate Contentions"}
          </Button>
        </div>
      </div>

      {contentions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 font-heading flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Generated Contentions ({contentions.length})
            </h3>
            <Button variant="outline" size="sm" onClick={() => contentions.forEach(c => saveContention.mutate(c))} className="gap-1.5 text-xs">
              <Save className="w-3.5 h-3.5" /> Save All
            </Button>
          </div>
          {contentions.map((c, i) => (
            <ContentionCard key={i} contention={c} onSave={() => saveContention.mutate(c)} saving={saveContention.isPending} />
          ))}
        </div>
      )}
    </div>
  );
}