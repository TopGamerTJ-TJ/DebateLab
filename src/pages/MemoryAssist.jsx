import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers3, Loader2, Eye, EyeOff, ChevronRight, RotateCcw, Sparkles, ListChecks, Layers, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { haptic } from "@/lib/native";
import AnimatedPage from "@/components/AnimatedPage";
import MemorySourcePicker from "@/components/MemorySourcePicker";
import SaveGeneratedDialog from "@/components/SaveGeneratedDialog";

const MEMORY_SCHEMA = {
  type: "object",
  properties: {
    keyPoints: {
      type: "array",
      items: {
        type: "object",
        properties: {
          cue: { type: "string" },
          detail: { type: "string" }
        }
      }
    },
    acronym: { type: "string" },
    acronymMeaning: { type: "array", items: { type: "string" } },
    flashcards: {
      type: "array",
      items: {
        type: "object",
        properties: { front: { type: "string" }, back: { type: "string" } }
      }
    },
    tips: { type: "array", items: { type: "string" } }
  }
};

const Mode = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-primary text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
  >
    <Icon className="w-4 h-4" /> {label}
  </button>
);

export default function MemoryAssist() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [sourcePick, setSourcePick] = useState("");
  const [cardCount, setCardCount] = useState("8");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState("outline");
  const [saveOpen, setSaveOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Flashcard state
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  // Blackout (recall) state
  const [revealed, setRevealed] = useState({});

  const build = async () => {
    if (!source.trim()) { toast({ title: "Paste a speech or your key points first", variant: "destructive" }); return; }
    setLoading(true);
    setResult(null);
    setRevealed({});
    setCardIndex(0);
    setFlipped(false);
    setSaved(false);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a memory coach helping a Model Congress / Model UN / debate delegate MEMORIZE their material for a TECH-FREE conference where no notes or devices are allowed during committee.

Take the delegate's speech or notes below and produce memory aids:
1. keyPoints: break it into a short, ordered list of memorable "cues" (2-5 words each) paired with the fuller "detail" behind each cue. These are the skeleton they'll recall on their feet.
2. acronym: a single memorable acronym or memory-hook word built from the first letters of the key points (if it doesn't form a real word, make a short pronounceable/logical one). acronymMeaning: what each letter stands for, in order.
3. flashcards: EXACTLY ${cardCount} active-recall flashcards (front = a prompt/question, back = the answer) covering the most important facts, arguments, and rebuttals.
4. tips: 3-5 concrete memorization & delivery tips specific to this content for speaking without notes.

Title: ${title || "Untitled"}

Material:
"""${source}"""`,
        response_json_schema: MEMORY_SCHEMA
      });
      setResult(res);
      haptic(15);
    } catch {
      toast({ title: "Couldn't build memory aids. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const cards = result?.flashcards || [];
  const currentCard = cards[cardIndex];

  const nextCard = () => { setFlipped(false); setCardIndex(i => (i + 1) % cards.length); haptic(8); };

  const reset = () => { setResult(null); setSource(""); setTitle(""); setSourcePick(""); setSaved(false); };

  const saveSet = async ({ projectId }) => {
    if (!result) return;
    setSaving(true);
    try {
      await base44.entities.FlashcardSet.create({
        ownerUserId: user?.id,
        title: title || "Memory set",
        projectId: projectId || undefined,
        sourceSummary: source.slice(0, 500),
        keyPoints: result.keyPoints || [],
        acronym: result.acronym || "",
        acronymMeaning: result.acronymMeaning || [],
        flashcards: result.flashcards || [],
        tips: result.tips || [],
      });
      setSaved(true);
      setSaveOpen(false);
      toast({ title: projectId ? "Saved to project" : "Saved to your library" });
    } catch {
      toast({ title: "Couldn't save. Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const outlineText = useMemo(() => {
    if (!result?.keyPoints) return "";
    return result.keyPoints.map((k, i) => `${i + 1}. ${k.cue} — ${k.detail}`).join("\n");
  }, [result]);

  return (
    <AnimatedPage>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-gradient-to-br from-rose-600 to-pink-700 rounded-3xl p-8 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2 text-rose-100 text-sm font-medium"><Layers3 className="w-4 h-4" /> Memory Assist</div>
          <h1 className="text-2xl font-bold font-heading mb-1">Memorize for tech-free committee</h1>
          <p className="text-rose-50 text-sm max-w-lg">Serious conferences don't allow notes or devices on the floor. Paste your speech or points and Memory Assist turns them into cues, memory hooks, and flashcards so you can speak confidently from memory.</p>
        </div>

        {!result ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Title (optional)</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Opening speech — Healthcare bill" className="mb-4" disabled={loading} />

            <MemorySourcePicker value={sourcePick} onChange={(text, label) => {
              setSourcePick(text ? "picked" : "");
              if (text) { setSource(text); if (!title) setTitle(label); }
            }} />

            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Your speech or key points</label>
            <Textarea value={source} onChange={e => setSource(e.target.value)} placeholder="Paste the speech, position, or bullet points you need to memorize…" rows={8} className="resize-none text-sm mb-4" disabled={loading} />

            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Number of flashcards</label>
            <Select value={cardCount} onValueChange={setCardCount} disabled={loading}>
              <SelectTrigger className="mb-4 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["5", "8", "10", "15", "20"].map(n => <SelectItem key={n} value={n}>{n} flashcards</SelectItem>)}
              </SelectContent>
            </Select>

            <Button onClick={build} disabled={loading || !source.trim()} className="w-full gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "Building memory aids…" : "Build Memory Aids"}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-5">
              <Mode active={mode === "outline"} onClick={() => setMode("outline")} icon={ListChecks} label="Cues" />
              <Mode active={mode === "cards"} onClick={() => setMode("cards")} icon={Layers} label="Flashcards" />
              <Mode active={mode === "recall"} onClick={() => setMode("recall")} icon={Eye} label="Recall" />
            </div>

            {mode === "outline" && (
              <div className="space-y-4">
                {result.acronym && (
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
                    <div className="text-xs font-bold text-rose-600 uppercase tracking-wide mb-1">Memory Hook</div>
                    <div className="text-2xl font-bold font-heading text-rose-700 tracking-widest mb-2">{result.acronym}</div>
                    <ul className="space-y-1">
                      {(result.acronymMeaning || []).map((m, i) => <li key={i} className="text-sm text-slate-700">{m}</li>)}
                    </ul>
                  </div>
                )}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="font-bold text-slate-900 font-heading text-sm mb-3">Key Point Cues</h3>
                  <ol className="space-y-3">
                    {result.keyPoints?.map((k, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{k.cue}</div>
                          <div className="text-sm text-slate-500">{k.detail}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
                {result.tips?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <h3 className="font-bold text-slate-900 font-heading text-sm mb-2">Memorization Tips</h3>
                    <ul className="space-y-1.5">
                      {result.tips.map((t, i) => <li key={i} className="text-sm text-slate-600 flex gap-2"><span className="text-rose-500">•</span>{t}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {mode === "cards" && (
              cards.length > 0 ? (
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => { setFlipped(f => !f); haptic(8); }}
                    className="w-full min-h-[220px] bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center text-center mb-4 active:scale-[0.99] transition-transform"
                  >
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">{flipped ? "Answer" : "Prompt"} · Card {cardIndex + 1}/{cards.length}</span>
                    <span className="text-lg font-medium text-slate-900">{flipped ? currentCard.back : currentCard.front}</span>
                    <span className="text-xs text-slate-400 mt-4">Tap to flip</span>
                  </button>
                  <Button onClick={nextCard} className="gap-2">Next Card <ChevronRight className="w-4 h-4" /></Button>
                </div>
              ) : <p className="text-center text-slate-500 py-8">No flashcards were generated.</p>
            )}

            {mode === "recall" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-sm text-slate-500 mb-4">Test yourself: read the cue, say the detail out loud from memory, then tap to check.</p>
                <ol className="space-y-2">
                  {result.keyPoints?.map((k, i) => (
                    <li key={i} className="border border-slate-100 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-900 text-sm">{i + 1}. {k.cue}</div>
                        <button onClick={() => setRevealed(r => ({ ...r, [i]: !r[i] }))} className="text-slate-400 hover:text-primary p-1">
                          {revealed[i] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {revealed[i] && <div className="text-sm text-slate-500 mt-1">{k.detail}</div>}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <Button onClick={() => setSaveOpen(true)} disabled={saved} className="flex-1 gap-2">
                <Save className="w-4 h-4" /> {saved ? "Saved" : "Save Set"}
              </Button>
              <Button variant="outline" onClick={reset} className="flex-1 gap-2"><RotateCcw className="w-4 h-4" /> New Material</Button>
            </div>
          </>
        )}
      </div>

      <SaveGeneratedDialog
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        onSave={saveSet}
        saving={saving}
        itemLabel="memory set"
      />
    </AnimatedPage>
  );
}