import { useState } from "react";
import { ScrollText, Clock, BookOpen, ShieldAlert, ChevronRight, X, Maximize2 } from "lucide-react";

/**
 * A scrollable "flow" view structured for a ~10 minute speech:
 * Introduction → Contentions (with timing) → Rebuttals → Conclusion.
 * Props: project, contentions, rebuttals
 */
export default function ProjectFlowTab({ project, contentions, rebuttals }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [speechMinutes, setSpeechMinutes] = useState(10);

  const n = contentions.length || 1;
  // Proportional allocation: ~10% intro, ~60% contentions, ~20% rebuttals, ~10% conclusion
  const introMin = Math.max(1, Math.round(speechMinutes * 0.10));
  const concMin = Math.max(1, Math.round(speechMinutes * 0.10));
  const rebMin = Math.max(1, Math.round(speechMinutes * 0.20));
  const contTotal = Math.max(n, speechMinutes - introMin - concMin - rebMin);
  const contMin = Math.max(1, Math.round(contTotal / n));
  const sections = [
    { label: "Introduction", min: introMin },
    ...contentions.map((c, i) => ({ label: `Contention ${i + 1}: ${c.title}`, min: contMin, c })),
    { label: "Rebuttals", min: rebMin },
    { label: "Conclusion", min: concMin },
  ];
  const totalMin = sections.reduce((a, s) => a + s.min, 0);

  const FlowBody = () => (
    <div className="space-y-6">
      {/* Overview */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-6 text-white">
        <div className="text-xs uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5"><ScrollText className="w-3.5 h-3.5" /> Speaking Flow · ~{totalMin} min</div>
        <h2 className="text-xl font-bold font-heading mb-2">{project.resolution || project.name}</h2>
        <div className="flex flex-wrap gap-2 text-xs">
          {project.side && <span className="bg-white/15 px-2 py-0.5 rounded-full">{project.side}</span>}
          {project.format && <span className="bg-white/15 px-2 py-0.5 rounded-full capitalize">{project.format.replace(/_/g, ' ')}</span>}
          <span className="bg-white/15 px-2 py-0.5 rounded-full">{contentions.length} contentions</span>
          {rebuttals.length > 0 && <span className="bg-white/15 px-2 py-0.5 rounded-full">{rebuttals.length} rebuttal sets</span>}
        </div>
      </div>

      {sections.map((s, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
              <h3 className="font-bold text-slate-900 font-heading text-sm">{s.label}</h3>
            </div>
            <span className="flex items-center gap-1 text-xs text-slate-400"><Clock className="w-3 h-3" /> ~{s.min} min</span>
          </div>
          {s.c ? (
            <div className="space-y-2 text-sm">
              {s.c.claim && <p className="text-slate-700"><span className="font-semibold text-slate-400 text-xs uppercase">Claim:</span> {s.c.claim}</p>}
              {s.c.warrant && <p className="text-slate-600"><span className="font-semibold text-slate-400 text-xs uppercase">Warrant:</span> {s.c.warrant}</p>}
              {s.c.impact && <p className="text-slate-600"><span className="font-semibold text-slate-400 text-xs uppercase">Impact:</span> {s.c.impact}</p>}
              {s.c.evidence?.length > 0 && (
                <ul className="text-xs text-slate-500 space-y-1 mt-1">
                  {s.c.evidence.map((ev, j) => <li key={j} className="flex gap-1.5"><ChevronRight className="w-3 h-3 shrink-0 mt-0.5" />{ev.text}</li>)}
                </ul>
              )}
            </div>
          ) : s.label === "Rebuttals" ? (
            rebuttals.length > 0 ? (
              <div className="space-y-3">
                {rebuttals.map((r, ri) => (
                  <div key={ri} className="border-l-2 border-teal-300 pl-3">
                    <p className="text-xs text-slate-500 italic mb-1">vs. "{r.input?.slice(0, 120)}{r.input?.length > 120 ? '…' : ''}"</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-4">{typeof r.output === 'string' ? r.output : ''}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-slate-400 italic">No rebuttals prepared yet — generate some in the Rebuttal Hub.</p>
          ) : s.label === "Introduction" ? (
            <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
              <li>Hook the audience and state the resolution.</li>
              <li>Define key terms and frame the debate.</li>
              <li>Preview your {contentions.length} contentions.</li>
            </ul>
          ) : (
            <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
              <li>Crystalize the key voting issues.</li>
              <li>Weigh your impacts against the opponent's.</li>
              <li>End with a strong call to vote {project.side || 'your side'}.</li>
            </ul>
          )}
        </div>
      ))}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white">
          <span className="font-bold text-slate-900 font-heading text-sm flex items-center gap-2"><ScrollText className="w-4 h-4 text-primary" /> Speaking Flow · {project.name}</span>
          <button onClick={() => setFullscreen(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl mx-auto w-full">
          <FlowBody />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-slate-900 font-heading text-sm">Speaking Flow</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Length:</span>
            <select value={speechMinutes} onChange={e => setSpeechMinutes(+e.target.value)} className="border border-slate-200 rounded-md px-1.5 py-0.5 text-xs text-black bg-white">
              {[3,5,7,10,13,15,20].map(m => <option key={m} value={m}>{m} min</option>)}
            </select>
          </div>
          <button onClick={() => setFullscreen(true)} className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
            <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-500">A structured ~{totalMin}-minute flow: intro, your contentions, prepared rebuttals, and conclusion. Times scale to your chosen length.</p>
      <FlowBody />
    </div>
  );
}