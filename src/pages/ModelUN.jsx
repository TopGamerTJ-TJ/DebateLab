import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AIAssistant from "@/components/AIAssistant";
import { Globe, Sparkles, Loader2, FileText, Plus, Trash2, Star, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const DOC_TYPES = ["position_paper", "draft_resolution", "working_paper", "amendment", "speech", "country_profile", "committee_prep"];

export default function ModelUN() {
  const [form, setForm] = useState({ title: "", type: "position_paper", country: "", committee: "", topic: "", content: "" });
  const [generating, setGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState({ country: "", committee: "", topic: "", docType: "position_paper" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: docs = [] } = useQuery({ queryKey: ['mun_docs'], queryFn: () => base44.entities.MUNDocument.list('-created_date') });

  const createDoc = useMutation({
    mutationFn: (data) => base44.entities.MUNDocument.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['mun_docs'] }); toast({ title: "Document saved!" }); setForm({ title: "", type: "position_paper", country: "", committee: "", topic: "", content: "" }); }
  });

  const deleteDoc = useMutation({
    mutationFn: (id) => base44.entities.MUNDocument.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mun_docs'] })
  });

  const toggleFavorite = useMutation({
    mutationFn: ({ id, val }) => base44.entities.MUNDocument.update(id, { isFavorite: val }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mun_docs'] })
  });

  const generateDoc = async () => {
    if (!aiPrompt.country || !aiPrompt.committee || !aiPrompt.topic) {
      toast({ title: "Please fill country, committee, and topic", variant: "destructive" }); return;
    }
    setGenerating(true);
    const typeLabels = { position_paper: "Position Paper", draft_resolution: "Draft Resolution", working_paper: "Working Paper", speech: "Delegate Speech", country_profile: "Country Profile" };
    const content = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a comprehensive, high-quality MUN ${typeLabels[aiPrompt.docType] || aiPrompt.docType} for:
Country: ${aiPrompt.country}
Committee: ${aiPrompt.committee}
Topic: ${aiPrompt.topic}

Write in proper MUN format with appropriate headings, operative/preambulatory clauses where applicable, formal diplomatic language, and substantive policy content. Include the country's actual policy positions, national interests, and relevant historical context. Make it tournament-ready quality that would earn a Best Delegate award.`
    });
    setForm({ title: `${aiPrompt.country} - ${typeLabels[aiPrompt.docType]} - ${aiPrompt.committee}`, type: aiPrompt.docType, country: aiPrompt.country, committee: aiPrompt.committee, topic: aiPrompt.topic, content });
    setGenerating(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3 text-teal-200 text-sm"><span>🌍</span> Model United Nations</div>
        <h1 className="text-3xl font-bold font-heading mb-2">Model UN Hub</h1>
        <p className="text-teal-100 max-w-2xl">Research countries, write position papers, draft resolutions, prep speeches, and develop bloc strategy — all powered by AI.</p>
      </div>

      <Tabs defaultValue="generate">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl mb-6">
          <TabsTrigger value="generate" className="text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">AI Document Generator</TabsTrigger>
          <TabsTrigger value="library" className="text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">My Documents ({docs.length})</TabsTrigger>
          <TabsTrigger value="assistant" className="text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">AI Coach</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* AI Generator */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5 text-teal-600" /></div>
                <div>
                  <h3 className="font-bold text-slate-900 font-heading">AI Document Generator</h3>
                  <p className="text-xs text-slate-500">Generate tournament-ready MUN documents</p>
                </div>
              </div>
              <div className="space-y-3">
                <Input value={aiPrompt.country} onChange={e => setAiPrompt({ ...aiPrompt, country: e.target.value })} placeholder="Country (e.g., Brazil, Germany, China)" />
                <Input value={aiPrompt.committee} onChange={e => setAiPrompt({ ...aiPrompt, committee: e.target.value })} placeholder="Committee (e.g., UNSC, ECOSOC, WHO, GA1)" />
                <Input value={aiPrompt.topic} onChange={e => setAiPrompt({ ...aiPrompt, topic: e.target.value })} placeholder="Topic (e.g., Climate Change, Nuclear Non-Proliferation)" />
                <Select value={aiPrompt.docType} onValueChange={v => setAiPrompt({ ...aiPrompt, docType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={generateDoc} disabled={generating} className="w-full gap-2">
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {generating ? "Generating..." : "Generate Document"}
                </Button>
              </div>
            </div>

            {/* Save Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Save className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-900 font-heading">Document Editor</h3>
              </div>
              <div className="space-y-3">
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Document title" />
                <div className="grid grid-cols-2 gap-3">
                  <Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Country" />
                  <Input value={form.committee} onChange={e => setForm({ ...form, committee: e.target.value })} placeholder="Committee" />
                </div>
                <Input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="Topic" />
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Document content (paste AI output or write your own)..." rows={6} className="resize-none text-sm" />
                <Button onClick={() => createDoc.mutate(form)} disabled={!form.title || !form.content || createDoc.isPending} className="w-full gap-2">
                  <Save className="w-4 h-4" /> Save Document
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="library">
          {docs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Globe className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No MUN documents yet. Use the AI generator to create your first one.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map(doc => (
                <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium capitalize">{doc.type?.replace(/_/g, ' ')}</span>
                    <div className="flex gap-1">
                      <button onClick={() => toggleFavorite.mutate({ id: doc.id, val: !doc.isFavorite })} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        <Star className={`w-3.5 h-3.5 ${doc.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                      <button onClick={() => deleteDoc.mutate(doc.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">{doc.title}</h4>
                  <div className="flex gap-2 text-xs text-slate-500">
                    {doc.country && <span>{doc.country}</span>}
                    {doc.committee && <><span>•</span><span>{doc.committee}</span></>}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3">{doc.content}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assistant">
          <AIAssistant format="model_un" placeholder="Ask about country positions, resolution writing, bloc strategy, committee procedures..." />
        </TabsContent>
      </Tabs>
    </div>
  );
}