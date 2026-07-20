import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Plus, Trash2, Link as LinkIcon, Lock, ShieldCheck } from "lucide-react";

const SIDES = ["Affirmative", "Negative", "Pro", "Con", "Sponsor", "Opponent", "First Prop", "First Opp", "Second Prop", "Second Opp", "Opening Gov", "Opening Opp", "Closing Gov", "Closing Opp"];

/**
 * Card for project-level context: side selection, strict source mode, and
 * whitelist/blacklist of preferred/blocked sources.
 * Props: project, onUpdate(field, value)
 */
export default function ProjectContextCard({ project, onUpdate }) {
  const [wlUrl, setWlUrl] = useState("");
  const [wlLabel, setWlLabel] = useState("");
  const [blUrl, setBlUrl] = useState("");
  const [blLabel, setBlLabel] = useState("");

  const whitelist = project.whitelist || [];
  const blacklist = project.blacklist || [];

  const addWhitelist = () => {
    if (!wlUrl.trim()) return;
    onUpdate("whitelist", [...whitelist, { url: wlUrl.trim(), label: wlLabel.trim() || wlUrl.trim() }]);
    setWlUrl(""); setWlLabel("");
  };
  const removeWhitelist = (i) => onUpdate("whitelist", whitelist.filter((_, idx) => idx !== i));
  const addBlacklist = () => {
    if (!blUrl.trim()) return;
    onUpdate("blacklist", [...blacklist, { url: blUrl.trim(), label: blLabel.trim() || blUrl.trim() }]);
    setBlUrl(""); setBlLabel("");
  };
  const removeBlacklist = (i) => onUpdate("blacklist", blacklist.filter((_, idx) => idx !== i));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <label className="text-sm font-semibold text-slate-800 block mb-1">Your Side</label>
          <select
            value={project.side || ""}
            onChange={e => onUpdate("side", e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm text-black shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring appearance-none [&>option]:text-black"
          >
            <option value="">Not set</option>
            {SIDES.map(s => <option key={s} value={s}>{s}</option>)}
            {project.side && !SIDES.includes(project.side) && <option value={project.side}>{project.side}</option>}
          </select>
        </div>
        <div className="flex items-center gap-2 sm:pb-1.5">
          <button
            onClick={() => onUpdate("strictMode", !project.strictMode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${project.strictMode ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-600"}`}
            title="When on, the Research Agent only pulls from your whitelisted sources"
          >
            {project.strictMode ? <Lock className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            {project.strictMode ? "Strict Mode ON" : "Strict Mode OFF"}
          </button>
        </div>
      </div>

      {project.strictMode && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Strict Mode is on — the Research Agent will only use data from your whitelisted sources below. Add at least one trusted source.</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Whitelist */}
        <div className="border border-slate-100 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Preferred Sources (Whitelist)</span>
          </div>
          <div className="space-y-1.5 mb-2">
            {whitelist.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No whitelisted sources yet.</p>
            ) : whitelist.map((s, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-50 rounded px-2 py-1.5">
                <LinkIcon className="w-3 h-3 text-slate-400 shrink-0" />
                <a href={s.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline truncate flex-1">{s.label}</a>
                <button onClick={() => removeWhitelist(i)} className="p-0.5 text-slate-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            <Input value={wlLabel} onChange={e => setWlLabel(e.target.value)} placeholder="Label" className="text-xs h-8" />
            <Input value={wlUrl} onChange={e => setWlUrl(e.target.value)} placeholder="https://..." className="text-xs h-8" />
            <Button size="sm" variant="outline" onClick={addWhitelist} className="h-8 px-2"><Plus className="w-3.5 h-3.5" /></Button>
          </div>
        </div>

        {/* Blacklist */}
        <div className="border border-slate-100 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className="w-3.5 h-3.5 text-red-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Blocked Sources (Blacklist)</span>
          </div>
          <div className="space-y-1.5 mb-2">
            {blacklist.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No blacklisted sources.</p>
            ) : blacklist.map((s, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-50 rounded px-2 py-1.5">
                <LinkIcon className="w-3 h-3 text-slate-400 shrink-0" />
                <a href={s.url} target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:underline truncate flex-1 line-through">{s.label}</a>
                <button onClick={() => removeBlacklist(i)} className="p-0.5 text-slate-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            <Input value={blLabel} onChange={e => setBlLabel(e.target.value)} placeholder="Label" className="text-xs h-8" />
            <Input value={blUrl} onChange={e => setBlUrl(e.target.value)} placeholder="https://..." className="text-xs h-8" />
            <Button size="sm" variant="outline" onClick={addBlacklist} className="h-8 px-2"><Plus className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}