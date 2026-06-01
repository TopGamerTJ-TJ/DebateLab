import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Layers, Plus, Trash2, Star, Search, Edit3, Filter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const FORMATS = [["parliamentary", "Parliamentary"], ["public_forum", "Public Forum"], ["model_un", "Model UN"], ["model_congress", "Model Congress"]];

export default function CaseVault() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterFmt, setFilterFmt] = useState("all");
  const [form, setForm] = useState({ title: "", format: "parliamentary", resolution: "", side: "", description: "", tags: "", notes: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cases = [] } = useQuery({ queryKey: ['cases'], queryFn: () => base44.entities.Case.list('-created_date') });

  const upsert = useMutation({
    mutationFn: (data) => editId
      ? base44.entities.Case.update(editId, { ...data, tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [] })
      : base44.entities.Case.create({ ...data, tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [] }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cases'] }); toast({ title: editId ? "Case updated!" : "Case saved!" }); setShowForm(false); setEditId(null); setForm({ title: "", format: "parliamentary", resolution: "", side: "", description: "", tags: "", notes: "" }); }
  });

  const del = useMutation({
    mutationFn: (id) => base44.entities.Case.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] })
  });

  const toggleFav = useMutation({
    mutationFn: ({ id, val }) => base44.entities.Case.update(id, { isFavorite: val }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] })
  });

  const openEdit = (c) => {
    setEditId(c.id);
    setForm({ title: c.title, format: c.format, resolution: c.resolution || "", side: c.side || "", description: c.description || "", tags: c.tags?.join(', ') || "", notes: c.notes || "" });
    setShowForm(true);
  };

  const filtered = cases.filter(c => {
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.resolution?.toLowerCase().includes(search.toLowerCase());
    const matchFmt = filterFmt === "all" || c.format === filterFmt;
    return matchSearch && matchFmt;
  });

  const formatColors = { parliamentary: "bg-blue-100 text-blue-700", public_forum: "bg-indigo-100 text-indigo-700", model_un: "bg-teal-100 text-teal-700", model_congress: "bg-purple-100 text-purple-700" };
  const sideColors = { affirmative: "bg-green-100 text-green-700", negative: "bg-red-100 text-red-600", government: "bg-green-100 text-green-700", opposition: "bg-red-100 text-red-600" };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3 text-rose-200 text-sm"><span>🗂️</span> Case Vault</div>
        <h1 className="text-3xl font-bold font-heading mb-2">Case Vault</h1>
        <p className="text-rose-100 max-w-2xl">Permanent storage for your debate cases, contentions, and strategies. Search, organize, and build on your best work.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases..." className="pl-9" />
        </div>
        <Select value={filterFmt} onValueChange={setFilterFmt}>
          <SelectTrigger className="w-48"><Filter className="w-4 h-4 mr-2 text-slate-400" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Formats</SelectItem>
            {FORMATS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => { setEditId(null); setShowForm(true); }} className="gap-2 shrink-0"><Plus className="w-4 h-4" /> New Case</Button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No cases yet</h3>
          <p className="text-slate-500 mb-5">Create your first case to organize your arguments and strategy.</p>
          <Button onClick={() => setShowForm(true)} className="gap-2"><Plus className="w-4 h-4" /> New Case</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-wrap gap-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${formatColors[c.format] || 'bg-slate-100 text-slate-600'}`}>{c.format?.replace('_', ' ')}</span>
                  {c.side && <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${sideColors[c.side] || 'bg-slate-100 text-slate-600'}`}>{c.side}</span>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => toggleFav.mutate({ id: c.id, val: !c.isFavorite })} className="p-1.5 rounded-lg hover:bg-slate-100">
                    <Star className={`w-3.5 h-3.5 ${c.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50">
                    <Edit3 className="w-3.5 h-3.5 text-slate-400 hover:text-primary" />
                  </button>
                  <button onClick={() => del.mutate(c.id)} className="p-1.5 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-500" />
                  </button>
                </div>
              </div>
              <h4 className="font-bold text-slate-900 font-heading mb-1">{c.title}</h4>
              {c.resolution && <p className="text-xs text-slate-500 italic mb-2 line-clamp-2">"{c.resolution}"</p>}
              {c.description && <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{c.description}</p>}
              {c.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {c.tags.map((tag, i) => <span key={i} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">#{tag}</span>)}
                </div>
              )}
              {c.version > 1 && <div className="text-xs text-slate-400 mt-2">v{c.version}</div>}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-heading">{editId ? "Edit Case" : "New Case"}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Case name (e.g., Aff Case – Jan/Feb Resolution)" />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.format} onValueChange={v => setForm({ ...form, format: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FORMATS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.side} onValueChange={v => setForm({ ...form, side: v })}>
                <SelectTrigger><SelectValue placeholder="Side" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="affirmative">Affirmative</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="opposition">Opposition</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input value={form.resolution} onChange={e => setForm({ ...form, resolution: e.target.value })} placeholder="Resolution or motion" />
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Case description, strategy, overview..." rows={3} className="resize-none text-sm" />
            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Private notes, coach feedback, weaknesses..." rows={2} className="resize-none text-sm" />
            <Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Tags: economy, environment, trade (comma separated)" />
            <Button onClick={() => upsert.mutate(form)} disabled={!form.title || upsert.isPending} className="w-full">{editId ? "Update Case" : "Save Case"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}