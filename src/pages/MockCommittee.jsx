import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords, Loader2, Send, Play, Bot, User, Flag } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AnimatedPage from "@/components/AnimatedPage";

const INTENSITY = [
  { value: "gentle", label: "Warm-up" },
  { value: "standard", label: "Competitive" },
  { value: "aggressive", label: "Championship" },
];

export default function MockCommittee() {
  const { toast } = useToast();
  const [setup, setSetup] = useState({ topic: "", stance: "for", intensity: "standard" });
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const systemContext = () =>
    `You are role-playing as an opposing delegate in a live Model Congress / Model UN committee session — a rigorous "think on your feet" drill. The student is practicing responding to unpredictable arguments WITHOUT a pre-written script, because their real conference is tech-free.

Topic: "${setup.topic}"
The student's stance: ${setup.stance === "for" ? "in favor / affirmative" : "against / negative"}. You take the OPPOSITE side.
Intensity: ${setup.intensity}.

Rules:
- Speak as a real delegate would in committee — concise, pointed floor speeches or direct rebuttals (2-5 sentences).
- Raise fresh, specific, unpredictable arguments and rebut the student's latest point. Do NOT be generic.
- Occasionally pose a sharp cross-examination question to force the student to think fast.
- Never write the student's speech for them and never coach mid-round — stay in character as the opponent.`;

  const start = async () => {
    if (!setup.topic.trim()) { toast({ title: "Enter a committee topic first", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const opening = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemContext()}\n\nOpen the round: deliver your first short floor speech taking your side and putting pressure on the student. End by yielding the floor to them.`,
      });
      setMessages([{ role: "assistant", content: opening }]);
      setStarted(true);
    } catch {
      toast({ title: "Couldn't start the round. Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const history = next.slice(-8).map(m => `${m.role === "user" ? "Student delegate" : "You (opponent)"}: ${m.content}`).join("\n\n");
      const reply = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemContext()}\n\nRound so far:\n${history}\n\nRespond in character to the student's latest point. Rebut it directly, add a new angle, and keep the pressure on.`,
      });
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      toast({ title: "Something went wrong. Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const endRound = async () => {
    setLoading(true);
    try {
      const history = messages.map(m => `${m.role === "user" ? "Student delegate" : "Opponent"}: ${m.content}`).join("\n\n");
      const feedback = await base44.integrations.Core.InvokeLLM({
        prompt: `The mock committee round is over. Step OUT of the opponent role and act as a debate coach. Review how the student delegate performed on thinking on their feet, responsiveness, and clash. Give a short assessment: 2-3 strengths, 2-3 things to improve, and one drill to practice. Use markdown.\n\nTranscript:\n${history}`,
      });
      setMessages(prev => [...prev, { role: "coach", content: feedback }]);
    } catch {
      toast({ title: "Couldn't generate feedback.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const restart = () => { setStarted(false); setMessages([]); setInput(""); };

  return (
    <AnimatedPage>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-gradient-to-br from-orange-600 to-red-700 rounded-3xl p-8 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2 text-orange-100 text-sm font-medium"><Swords className="w-4 h-4" /> Mock Committee</div>
          <h1 className="text-2xl font-bold font-heading mb-1">Think on your feet</h1>
          <p className="text-orange-50 text-sm max-w-lg">Real conferences are tech-free and unpredictable. Instead of reading a generated speech, spar live against an AI delegate who rebuts you in real time — building the on-your-feet skill chairs reward most.</p>
        </div>

        {!started ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Committee topic / bill</label>
            <Input value={setup.topic} onChange={e => setSetup({ ...setup, topic: e.target.value })} placeholder="e.g. A bill to expand renewable energy subsidies" className="mb-4" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Your side</label>
                <Select value={setup.stance} onValueChange={v => setSetup({ ...setup, stance: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="for">Affirmative (For)</SelectItem>
                    <SelectItem value="against">Negative (Against)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Intensity</label>
                <Select value={setup.intensity} onValueChange={v => setSetup({ ...setup, intensity: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{INTENSITY.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={start} disabled={loading || !setup.topic.trim()} className="w-full gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {loading ? "Opening the floor…" : "Start Mock Round"}
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col" style={{ height: "60vh" }}>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-primary" : m.role === "coach" ? "bg-green-100" : "bg-orange-100"}`}>
                      {m.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className={`w-4 h-4 ${m.role === "coach" ? "text-green-600" : "text-orange-600"}`} />}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-white rounded-tr-sm" : m.role === "coach" ? "bg-green-50 text-slate-800 border border-green-100" : "bg-orange-50 text-slate-800 border border-orange-100 rounded-tl-sm"}`}>
                      {m.role === "coach" && <div className="text-xs font-bold text-green-700 uppercase mb-1">Coach Feedback</div>}
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"><Bot className="w-4 h-4 text-orange-600" /></div>
                    <div className="bg-orange-50 rounded-2xl border border-orange-100 px-4 py-3"><Loader2 className="w-4 h-4 animate-spin text-orange-500" /></div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 border-t border-slate-100">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder="Respond on your feet — no script…"
                    rows={2}
                    className="resize-none text-sm"
                  />
                  <Button onClick={send} disabled={loading || !input.trim()} size="icon" className="h-auto aspect-square shrink-0"><Send className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={endRound} disabled={loading || messages.length < 2} className="flex-1 gap-2"><Flag className="w-4 h-4" /> End & Get Feedback</Button>
              <Button variant="outline" onClick={restart} className="flex-1">New Round</Button>
            </div>
          </>
        )}
      </div>
    </AnimatedPage>
  );
}