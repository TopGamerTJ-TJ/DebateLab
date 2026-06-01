import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Archive, Plus, Trash2, Star, Search, ExternalLink, Sparkles, Loader2, Filter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { base44 as b44 } from "@/api/base44Client";

const CATEGORIES = ["Academic Research", "Government Data", "News", "Expert Opinion", "Statistics", "Case Law", "Other"];

export default function EvidenceLocker() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [aiResearch, setAiResearch] = useState("");
  const [aiSearching, setAiSearching] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", source: "", sourceUrl: "", category: "Academic Research", tags: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: evidence = [] } = useQuery({ queryKey: ['evidence'], queryFn: () => base44.entities.Evidence.list('-created_date') });

  const create = useMutation({
    mutationFn: (data) => base44.entities.Evidence.create({ ...data, tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [] }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['evidence'] }); toast({ title: "Evidence saved!" }); setShowForm(false); setForm({ title: "", content: "", source: "", sourceUrl: "", category: "Academic Research", tags: "" }); }
  });

  const del = useMutation({
    mutationFn: (id) => base44.entities.Evidence.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['evidence'] })
  });

  const toggleFav = useMutation({
    mutationFn: ({ id, val }) => base44.entities.Evidence.update(id, { isFavorite: val }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['evidence'] })
  });

  const aiSearch = async () => {
    if (!aiResearch) return;
    setAiSearching(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a debate research assistant. Find evidence for: "${aiResearch}"

Provide 3-4 pieces of high-quality evidence with real statistics, expert opinions, and academic findings. Format each as:
TITLE: [descriptive title]
CONTENT: [the actual evidence/quote/statistic, 2-4 sentences]
SOURCE: [Author name, Organization/Journal, Year]
URL: [realistic URL to a real organization or academic source]
CATEGORY: [Academic Research / Government Data / News / Expert Opinion / Statistics]

Separate each piece with ---`,
      add_context_from_internet: false
    });
    // Parse results and save them
    const pieces = result.split('---').filter(p => p.trim());
    let saved = 0;
    for (const piece of pieces) {
      const lines = piece.trim().split('\n');
      const get = (prefix) => { const l = lines.find(x => x.startsWith(prefix)); return l ? l.replace(prefix, '').trim() : ''; };
      const title = get('TITLE:');
      const content = get('CONTENT:');
      const source = get('SOURCE:');
      const sourceUrl = get('URL:');
      const category = get('CATEGORY:') || 'Academic Research';
      if (title && content) {
        await base44.entities.Evidence.create({ title, content, source, sourceUrl, category, notes: `Found via AI research: "${aiResearch}"` });
        saved++;
      }
    }
    queryClient.invalidateQueries({ queryKey: ['evidence'] });
    toast({ title: `${saved} evidence items saved to locker!` });
    setAiResearch("");
    setAiSearching(false);
  };

  const filtered = evidence.filter(e => {
    const matchSearch = !search || e.title?.toLowerCase().includes(search.toLowerCase()) || e.content?.toLowerCase().includes(search.toLowerCase()) || e.source?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || e.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3 text-amber-100 text-sm"><span>🔒</span> Evidence Locker</div>
        <h1 className="text-3xl font-bold font-heading mb-2">Evidence Locker</h1>
        <p className="text-amber-100 max-w-2xl">Save, tag, and organize your research. Use AI to find evidence instantly and build your personal research database.</p>
      </div>

      {/* AI Research */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-slate-900 text-sm">AI Research Assistant</h3>
        </div>
        <div className="flex gap-3">
          <Input value={aiResearch} onChange={e => setAiResearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && aiSearch()} placeholder="Ask for evidence: e.g., 'economic effects of minimum wage increases'" className="flex-1" />
          <Button onClick={aiSearch} disabled={!aiResearch || aiSearching} className="gap-2 shrink-0">
            {aiSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {aiSearching ? "Researching..." : "Find Evidence"}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search evidence..." className="pl-9" />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-48"><Filter className="w-4 h-4 mr-2 text-slate-400" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setShowForm(true)} className="gap-2 shrink-0"><Plus className="w-4 h-4" /> Add Evidence</Button>
      </div>

      {/* Evidence grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Archive className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">{evidence.length === 0 ? "Your evidence locker is empty. Use AI research or add evidence manually." : "No evidence matches your search."}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(ev => (
            <div key={ev.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{ev.category}</span>
                <div className="flex gap-1">
                  <button onClick={() => toggleFav.mutate({ id: ev.id, val: !ev.isFavorite })} className="p-1.5 rounded-lg hover:bg-slate-100">
                    <Star className={`w-3.5 h-3.5 ${ev.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                  <button onClick={() => del.mutate(ev.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h4 className="font-semibold text-slate-900 text-sm mb-2">{ev.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-4 mb-3 italic">"{ev.content}"</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 truncate">{ev.source}</span>
                {ev.sourceUrl && (
                  <a href={ev.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0 ml-2">
                    <ExternalLink className="w-3 h-3" /> Source
                  </a>
                )}
              </div>
              {ev.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {ev.tags.map((tag, i) => <span key={i} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">#{tag}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add form dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-heading">Add Evidence</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Evidence title / headline" />
            <Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Evidence content, quote, or statistic..." rows={4} className="resize-none text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <Input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="Source (Author, Organization)" />
              <Input value={form.sourceUrl} onChange={e => setForm({ ...form, sourceUrl: e.target.value })} placeholder="Source URL" />
            </div>
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated): economics, trade, welfare" />
            <Button onClick={() => create.mutate(form)} disabled={!form.title || !form.content || create.isPending} className="w-full">Save Evidence</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}