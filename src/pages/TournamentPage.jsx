import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Plus, Trash2, Edit3, Calendar, MapPin, ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const FORMATS = [["parliamentary", "Parliamentary"], ["public_forum", "Public Forum"], ["model_un", "Model UN"], ["model_congress", "Model Congress"]];
const STATUSES = ["upcoming", "active", "completed"];

const statusColors = { upcoming: "bg-blue-100 text-blue-700", active: "bg-green-100 text-green-700", completed: "bg-slate-100 text-slate-600" };

export default function TournamentPage() {
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", format: "parliamentary", location: "", date: "", division: "", status: "upcoming", wins: 0, losses: 0, speakerPoints: 0, notes: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tournaments = [] } = useQuery({ queryKey: ['tournaments'], queryFn: () => base44.entities.Tournament.list('-created_date') });

  const upsert = useMutation({
    mutationFn: (data) => editId ? base44.entities.Tournament.update(editId, data) : base44.entities.Tournament.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tournaments'] }); toast({ title: editId ? "Tournament updated!" : "Tournament created!" }); setShowForm(false); setEditId(null); setForm({ name: "", format: "parliamentary", location: "", date: "", division: "", status: "upcoming", wins: 0, losses: 0, speakerPoints: 0, notes: "" }); }
  });

  const deleteTournament = useMutation({
    mutationFn: (id) => base44.entities.Tournament.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournaments'] })
  });

  const openEdit = (t) => { setEditId(t.id); setForm({ name: t.name, format: t.format, location: t.location || "", date: t.date || "", division: t.division || "", status: t.status || "upcoming", wins: t.wins || 0, losses: t.losses || 0, speakerPoints: t.speakerPoints || 0, notes: t.notes || "" }); setShowForm(true); };

  const totalWins = tournaments.reduce((a, t) => a + (t.wins || 0), 0);
  const totalLosses = tournaments.reduce((a, t) => a + (t.losses || 0), 0);
  const totalRounds = totalWins + totalLosses;
  const winRate = totalRounds > 0 ? Math.round((totalWins / totalRounds) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-500 to-amber-500 rounded-3xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3 text-yellow-100 text-sm"><span>🏆</span> Tournament Command Center</div>
        <h1 className="text-3xl font-bold font-heading mb-2">Tournament Manager</h1>
        <p className="text-yellow-100 max-w-2xl">Track every tournament, manage rounds, record results, and analyze your competitive performance over time.</p>
        <div className="grid grid-cols-4 gap-4 mt-6">
          {[
            ["Tournaments", tournaments.length],
            ["Total Wins", totalWins],
            ["Total Losses", totalLosses],
            ["Win Rate", `${winRate}%`],
          ].map(([label, val]) => (
            <div key={label} className="bg-white/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold font-heading">{val}</div>
              <div className="text-xs text-yellow-100 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 font-heading">My Tournaments</h2>
        <Button onClick={() => { setEditId(null); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Add Tournament
        </Button>
      </div>

      {tournaments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No tournaments yet</h3>
          <p className="text-slate-500 mb-5">Add your first tournament to start tracking your competitive journey.</p>
          <Button onClick={() => setShowForm(true)} className="gap-2"><Plus className="w-4 h-4" /> Add Tournament</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {tournaments.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 font-heading">{t.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[t.status] || statusColors.upcoming}`}>{t.status}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                      <span className="capitalize">{t.format?.replace('_', ' ')}</span>
                      {t.location && <><span>•</span><span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{t.location}</span></>}
                      {t.date && <><span>•</span><span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{t.date}</span></>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <div className="hidden sm:flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-green-600 font-semibold"><CheckCircle className="w-4 h-4" />{t.wins || 0}W</div>
                    <div className="flex items-center gap-1 text-red-500 font-semibold"><XCircle className="w-4 h-4" />{t.losses || 0}L</div>
                    {t.speakerPoints > 0 && <div className="text-slate-600 font-medium">{t.speakerPoints} pts</div>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(t); }} className="p-1.5 rounded-lg hover:bg-slate-100"><Edit3 className="w-4 h-4 text-slate-400" /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteTournament.mutate(t.id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-slate-300 hover:text-red-500" /></button>
                    {expanded === t.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>
              </div>

              {expanded === t.id && (
                <div className="border-t border-slate-100 p-5">
                  <div className="grid sm:grid-cols-3 gap-4 mb-4">
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-green-600 font-heading">{t.wins || 0}</div>
                      <div className="text-sm text-green-700 mt-1">Wins</div>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-red-500 font-heading">{t.losses || 0}</div>
                      <div className="text-sm text-red-600 mt-1">Losses</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-primary font-heading">{t.speakerPoints || 0}</div>
                      <div className="text-sm text-blue-700 mt-1">Speaker Points</div>
                    </div>
                  </div>
                  {t.division && <p className="text-sm text-slate-600 mb-2"><strong>Division:</strong> {t.division}</p>}
                  {t.notes && <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-700 leading-relaxed">{t.notes}</p></div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">{editId ? "Edit Tournament" : "Add Tournament"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Tournament name" />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.format} onValueChange={v => setForm({ ...form, format: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FORMATS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location" />
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <Input value={form.division} onChange={e => setForm({ ...form, division: e.target.value })} placeholder="Division / Level" />
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs text-slate-500 mb-1 block">Wins</label><Input type="number" min="0" value={form.wins} onChange={e => setForm({ ...form, wins: parseInt(e.target.value) || 0 })} /></div>
              <div><label className="text-xs text-slate-500 mb-1 block">Losses</label><Input type="number" min="0" value={form.losses} onChange={e => setForm({ ...form, losses: parseInt(e.target.value) || 0 })} /></div>
              <div><label className="text-xs text-slate-500 mb-1 block">Speaker Pts</label><Input type="number" min="0" value={form.speakerPoints} onChange={e => setForm({ ...form, speakerPoints: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes, opponents, rounds, etc." rows={3} className="resize-none text-sm" />
            <Button onClick={() => upsert.mutate(form)} disabled={!form.name || upsert.isPending} className="w-full">
              {editId ? "Update Tournament" : "Add Tournament"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}