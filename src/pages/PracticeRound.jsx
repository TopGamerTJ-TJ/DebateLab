import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Sparkles, Loader2, Send, Bot, User, CheckCircle, XCircle, Award } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function PracticeRound() {
  const [phase, setPhase] = useState("setup"); // setup | round | result
  const [config, setConfig] = useState({ format: "public_forum", side: "affirmative", difficulty: "intermediate", resolution: "" });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveSession = useMutation({
    mutationFn: (data) => base44.entities.PracticeSession.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['practice_sessions'] })
  });

  const startRound = async () => {
    if (!config.resolution) { toast({ title: "Please enter a resolution", variant: "destructive" }); return; }
    setPhase("round");
    setLoading(true);
    const openingPrompt = await base44.integrations.Core.InvokeLLM({
      prompt: `You are simulating a ${config.format.replace('_', ' ')} debate round. You are playing the ${config.side === 'affirmative' ? 'Negative' : 'Affirmative/Government'} side at ${config.difficulty} difficulty.

Resolution: "${config.resolution}"

Start the round. Give the opening speech for your side (2-3 paragraphs). Be ${config.difficulty === 'beginner' ? 'basic and clear' : config.difficulty === 'intermediate' ? 'moderately sophisticated' : 'highly sophisticated and technical'}. End with "---YOUR TURN--- (Give your response speech)"`,
    });
    setMessages([
      { role: "system_info", content: `🎯 Practice Round Started\nFormat: ${config.format.replace('_', ' ')} | Side: ${config.side} | Difficulty: ${config.difficulty}\nResolution: "${config.resolution}"` },
      { role: "opponent", content: openingPrompt }
    ]);
    setLoading(false);
  };

  const sendSpeech = async () => {
    if (!input.trim() || loading) return;
    const myMsg = { role: "user", content: input };
    const updated = [...messages, myMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    const history = updated.filter(m => m.role !== 'system_info').map(m => `${m.role === 'user' ? 'Debater' : 'Opponent'}: ${m.content}`).join('\n\n---\n\n');

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are simulating a ${config.format.replace('_', ' ')} debate opponent at ${config.difficulty} level.

Resolution: "${config.resolution}"
Conversation so far:
${history}

Continue the round with your next speech. Respond directly to what the debater said. Be a realistic, strong ${config.difficulty} opponent. After 3-4 exchanges, if it feels like the round is concluding, add "---ROUND COMPLETE--- Request judge feedback?" at the end.`,
    });

    const isComplete = response.includes('---ROUND COMPLETE---');
    const cleanResponse = response.replace('---ROUND COMPLETE---', '').trim();
    setMessages(prev => [...prev, { role: "opponent", content: cleanResponse }]);

    if (isComplete) {
      setLoading(true);
      // Get judge feedback
      const allSpeeches = [...updated, { role: "opponent", content: cleanResponse }];
      const fullHistory = allSpeeches.filter(m => m.role !== 'system_info').map(m => `${m.role === 'user' ? 'Debater (our side)' : 'Opponent'}: ${m.content}`).join('\n\n---\n\n');

      const judgment = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an experienced ${config.format.replace('_', ' ')} debate judge. Evaluate this practice round.

Resolution: "${config.resolution}"
Format: ${config.format.replace('_', ' ')}
Debater's side: ${config.side}

Round transcript:
${fullHistory}

Provide a detailed judge's decision in this JSON format:
{
  "winner": "debater" or "opponent",
  "rfd": "2-3 sentence reason for decision",
  "speakerPoints": number between 25-30,
  "keyVotingIssues": ["issue 1", "issue 2", "issue 3"],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "advice": "2-3 sentences of specific improvement advice"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            winner: { type: "string" },
            rfd: { type: "string" },
            speakerPoints: { type: "number" },
            keyVotingIssues: { type: "array", items: { type: "string" } },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            advice: { type: "string" }
          }
        }
      });

      setResult(judgment);
      saveSession.mutate({
        format: config.format, side: config.side, resolution: config.resolution, difficulty: config.difficulty,
        rfd: judgment.rfd, winner: judgment.winner === 'debater' ? 'user' : 'ai',
        speakerPoints: judgment.speakerPoints,
        strengths: judgment.strengths, weaknesses: judgment.weaknesses,
        keyVotingIssues: judgment.keyVotingIssues,
      });
      setPhase("result");
    }
    setLoading(false);
  };

  if (phase === "result" && result) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className={`rounded-3xl p-8 mb-8 text-white shadow-lg ${result.winner === 'debater' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
          <div className="flex items-center gap-3 mb-4">
            {result.winner === 'debater' ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            <div>
              <h1 className="text-3xl font-bold font-heading">{result.winner === 'debater' ? '🏆 You Won!' : 'You Lost'}</h1>
              <p className="text-sm opacity-80">AI Judge Decision</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center"><div className="text-4xl font-bold font-heading">{result.speakerPoints}</div><div className="text-sm opacity-80">Speaker Points</div></div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 font-heading mb-3 flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Reason for Decision</h3>
            <p className="text-slate-700 leading-relaxed">{result.rfd}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
              <h3 className="font-bold text-green-800 mb-3 text-sm">✅ Strengths</h3>
              <ul className="space-y-2">{result.strengths?.map((s, i) => <li key={i} className="text-sm text-green-700 flex gap-2"><span className="shrink-0">→</span>{s}</li>)}</ul>
            </div>
            <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
              <h3 className="font-bold text-red-800 mb-3 text-sm">⚠️ Areas to Improve</h3>
              <ul className="space-y-2">{result.weaknesses?.map((w, i) => <li key={i} className="text-sm text-red-700 flex gap-2"><span className="shrink-0">→</span>{w}</li>)}</ul>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5">
            <h3 className="font-bold text-blue-900 mb-3 text-sm">🎯 Key Voting Issues</h3>
            <ul className="space-y-1.5">{result.keyVotingIssues?.map((kvi, i) => <li key={i} className="text-sm text-blue-800 flex gap-2"><span className="text-primary font-bold">{i + 1}.</span>{kvi}</li>)}</ul>
          </div>

          {result.advice && (
            <div className="bg-purple-50 rounded-2xl border border-purple-200 p-5">
              <h3 className="font-bold text-purple-900 mb-2 text-sm">💡 Coach's Advice</h3>
              <p className="text-sm text-purple-800 leading-relaxed">{result.advice}</p>
            </div>
          )}

          <Button onClick={() => { setPhase("setup"); setMessages([]); setResult(null); }} className="w-full h-12">Practice Another Round</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3 text-green-100 text-sm"><span>⚡</span> Practice Round</div>
        <h1 className="text-3xl font-bold font-heading mb-2">AI Practice Debate</h1>
        <p className="text-green-100 max-w-2xl">Debate against an AI opponent that simulates real competition. Get judge feedback and performance analysis when you're done.</p>
      </div>

      {phase === "setup" ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-2xl mx-auto">
          <h3 className="font-bold text-slate-900 font-heading text-lg mb-6">Round Setup</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Resolution / Motion</label>
              <Input value={config.resolution} onChange={e => setConfig({ ...config, resolution: e.target.value })} placeholder="Enter the full resolution or motion..." />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Format</label>
                <Select value={config.format} onValueChange={v => setConfig({ ...config, format: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public_forum">Public Forum</SelectItem>
                    <SelectItem value="parliamentary">Parliamentary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Your Side</label>
                <Select value={config.side} onValueChange={v => setConfig({ ...config, side: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="affirmative">Affirmative / Gov</SelectItem>
                    <SelectItem value="negative">Negative / Opp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">AI Difficulty</label>
                <Select value={config.difficulty} onValueChange={v => setConfig({ ...config, difficulty: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["beginner", "intermediate", "advanced", "expert"].map(d => <SelectItem key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={startRound} className="w-full h-12 gap-2 text-sm font-semibold">
              <Target className="w-4 h-4" /> Start Practice Round
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
          <div className="px-5 py-4 border-b border-slate-100 bg-green-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-sm font-bold text-green-800">Live Practice Round</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full capitalize">{config.difficulty}</span>
            </div>
            <span className="text-xs text-green-700 capitalize font-medium">{config.side} side</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i}>
                {m.role === 'system_info' ? (
                  <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-700 text-center whitespace-pre-line">{m.content}</div>
                ) : (
                  <div className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-primary' : 'bg-green-100'}`}>
                      {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-green-600" />}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-slate-50 text-slate-800 rounded-tl-sm border border-slate-100'}`}>
                      {m.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><Bot className="w-4 h-4 text-green-600" /></div>
                <div className="bg-slate-50 rounded-2xl rounded-tl-sm border border-slate-100 px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-xs text-slate-500">Opponent preparing speech...</span>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-100">
            <div className="flex gap-2">
              <Textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendSpeech(); } }} placeholder="Type your speech or argument..." className="resize-none text-sm" rows={3} disabled={loading} />
              <Button onClick={sendSpeech} disabled={loading || !input.trim()} size="icon" className="h-auto aspect-square shrink-0 self-end">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}