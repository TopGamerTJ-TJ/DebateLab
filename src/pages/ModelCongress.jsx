import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AIAssistant from "@/components/AIAssistant";
import { FileText, Sparkles, Loader2, Star, Trash2, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const BILL_TYPES = ["bill", "resolution", "amendment", "speech", "committee_prep"];
const POLICY_AREAS = ["Healthcare", "Education", "Environment", "Economy", "Foreign Policy", "Criminal Justice", "Immigration", "Technology", "Defense", "Infrastructure"];

export default function ModelCongress() {
  const [form, setForm] = useState({ title: "", type: "bill", sponsor: "", topic: "", policyArea: "", content: "", status: "draft" });
  const [generating, setGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState({ topic: "", policyArea: "", stance: "pro", docType: "bill", sponsor: "", conferenceId: "" });
  const [coachConferenceId, setCoachConferenceId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bills = [] } = useQuery({ queryKey: ['congress_bills'], queryFn: () => base44.entities.CongressBill.list('-created_date') });
  const { data: conferences = [] } = useQuery({ queryKey: ['conference_profiles'], queryFn: () => base44.entities.ConferenceProfile.list('-created_date') });

  const createBill = useMutation({
    mutationFn: (data) => base44.entities.CongressBill.create(data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['congress_bills'] });
      const previousBills = queryClient.getQueryData(['congress_bills']);
      queryClient.setQueryData(['congress_bills'], old => [
        { id: 'temp-' + Date.now(), ...newData, created_date: new Date().toISOString() },
        ...(old || [])
      ]);
      setForm({ title: "", type: "bill", sponsor: "", topic: "", policyArea: "", content: "", status: "draft" });
      return { previousBills };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['congress_bills'], context.previousBills);
      toast({ title: "Error saving document", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['congress_bills'] });
    },
    onSuccess: () => { 
      toast({ title: "Document saved!" }); 
    }
  });

  const deleteBill = useMutation({
    mutationFn: (id) => base44.entities.CongressBill.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['congress_bills'] })
  });

  const toggleFav = useMutation({
    mutationFn: ({ id, val }) => base44.entities.CongressBill.update(id, { isFavorite: val }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['congress_bills'] })
  });

  const generateDoc = async () => {
    if (!aiPrompt.topic) { toast({ title: "Please enter a topic", variant: "destructive" }); return; }
    setGenerating(true);
    const typeMap = { bill: "Bill", resolution: "Resolution", amendment: "Amendment", speech: "Authorship/Pro/Con Speech", committee_prep: "Committee Preparation Brief" };
    const conference = conferences.find(c => c.id === aiPrompt.conferenceId);
    // Inject the conference's own procedure + bill template so output matches their exact required format.
    const conferenceContext = conference ? `

IMPORTANT — This is for "${conference.name}". Follow THIS conference's specific requirements exactly, overriding any generic defaults:
${conference.billTemplateText ? `\nRequired bill/document format template:\n"""${conference.billTemplateText.slice(0, 4000)}"""` : ""}
${conference.procedureText ? `\nConference rules of procedure (for context on structure and expectations):\n"""${conference.procedureText.slice(0, 4000)}"""` : ""}
Match the formatting, section headings, and conventions of the template above precisely.` : "";
    const content = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a comprehensive, high-quality Model Congress ${typeMap[aiPrompt.docType] || aiPrompt.docType} for:
Topic: ${aiPrompt.topic}
Policy Area: ${aiPrompt.policyArea || "General Policy"}
Stance: ${aiPrompt.stance}
${aiPrompt.sponsor ? `Sponsor/Author: ${aiPrompt.sponsor}` : ""}

Write in proper legislative format. For bills: include WHEREAS clauses, BE IT ENACTED language, numbered sections, and specific policy provisions. For speeches: write a compelling 3-5 minute speech with opening hook, main arguments, evidence, rebuttals, and closing. For amendments: follow proper amendment format. Make it tournament-quality that demonstrates deep policy knowledge and would earn recognition at competitive Model Congress tournaments.${conferenceContext}`
    });
    setForm({
      title: `${typeMap[aiPrompt.docType]}: ${aiPrompt.topic}`,
      type: aiPrompt.docType, topic: aiPrompt.topic,
      policyArea: aiPrompt.policyArea, sponsor: aiPrompt.sponsor, content, status: "draft"
    });
    setGenerating(false);
  };

  const statusColors = { draft: "bg-slate-100 text-slate-600", submitted: "bg-blue-100 text-blue-700", passed: "bg-green-100 text-green-700", failed: "bg-red-100 text-red-600" };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28 lg:pb-8">
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3 text-purple-200 text-sm"><span>🏛</span> Model Congress</div>
        <h1 className="text-3xl font-bold font-heading mb-2">Model Congress Hub</h1>
        <p className="text-purple-100 max-w-2xl">Write bills, draft resolutions, prepare speeches, and master congressional procedure with AI-powered tools.</p>
        <div className="flex flex-wrap gap-3 mt-5">
          {["Bill Writing", "Committee Prep", "Floor Speeches", "Parliamentary Procedure"].map(f => (
            <span key={f} className="bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full">{f}</span>
          ))}
        </div>
      </div>

      <Tabs defaultValue="generate">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl mb-6">
          <TabsTrigger value="generate" className="text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">AI Generator</TabsTrigger>
          <TabsTrigger value="library" className="text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">My Documents ({bills.length})</TabsTrigger>
          <TabsTrigger value="assistant" className="text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">AI Coach</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <h3 className="font-bold text-slate-900 font-heading">AI Legislative Generator</h3>
                  <p className="text-xs text-slate-500">Bills, resolutions, speeches, and more</p>
                </div>
              </div>
              <div className="space-y-3">
                <Input value={aiPrompt.topic} onChange={e => setAiPrompt({ ...aiPrompt, topic: e.target.value })} placeholder="Policy topic (e.g., Universal Basic Income, Climate Policy)" />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={aiPrompt.policyArea} onValueChange={v => setAiPrompt({ ...aiPrompt, policyArea: v })}>
                    <SelectTrigger><SelectValue placeholder="Policy area" /></SelectTrigger>
                    <SelectContent>{POLICY_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={aiPrompt.stance} onValueChange={v => setAiPrompt({ ...aiPrompt, stance: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pro">Pro (Support)</SelectItem>
                      <SelectItem value="con">Con (Oppose)</SelectItem>
                      <SelectItem value="neutral">Neutral/Informational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Select value={aiPrompt.docType} onValueChange={v => setAiPrompt({ ...aiPrompt, docType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{BILL_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>)}</SelectContent>
                </Select>
                <Input value={aiPrompt.sponsor} onChange={e => setAiPrompt({ ...aiPrompt, sponsor: e.target.value })} placeholder="Your name (optional)" />
                {conferences.length > 0 && (
                  <Select value={aiPrompt.conferenceId || "none"} onValueChange={v => setAiPrompt({ ...aiPrompt, conferenceId: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Conference format (optional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Standard format</SelectItem>
                      {conferences.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
                <Button onClick={generateDoc} disabled={generating} className="w-full gap-2">
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {generating ? "Generating..." : "Generate Document"}
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Save className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-900 font-heading">Document Editor</h3>
              </div>
              <div className="space-y-3">
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Document title" />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{BILL_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["draft", "submitted", "passed", "failed"].map(s => <SelectItem key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="Topic" />
                <Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Paste AI-generated content or write your document here..." rows={7} className="resize-none text-sm" />
                <Button onClick={() => createBill.mutate(form)} disabled={!form.title || !form.content || createBill.isPending} className="w-full gap-2">
                  <Save className="w-4 h-4" /> Save Document
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="library">
          {bills.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No documents yet. Use the AI generator to write your first bill or speech.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bills.map(bill => (
                <div key={bill.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>{bill.type?.replace(/_/g, ' ')}</span>
                    <div className="flex gap-2 items-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[bill.status] || statusColors.draft} mr-1`}>{bill.status}</span>
                      <button onClick={() => toggleFav.mutate({ id: bill.id, val: !bill.isFavorite })} className="min-w-[44px] min-h-[44px] -m-2 flex items-center justify-center rounded-lg hover:bg-slate-100">
                        <Star className={`w-4 h-4 ${bill.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                      <button onClick={() => deleteBill.mutate(bill.id)} className="min-w-[44px] min-h-[44px] -m-2 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">{bill.title}</h4>
                  {bill.policyArea && <span className="text-xs text-slate-500">{bill.policyArea}</span>}
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3">{bill.content}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assistant">
          {conferences.length > 0 && (
            <div className="mb-4 flex items-center gap-3 flex-wrap">
              <span className="text-sm text-slate-600">Tailor advice to a conference:</span>
              <Select value={coachConferenceId || "none"} onValueChange={v => setCoachConferenceId(v === "none" ? "" : v)}>
                <SelectTrigger className="w-64"><SelectValue placeholder="Standard procedure" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Standard procedure</SelectItem>
                  {conferences.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <AIAssistant
            key={coachConferenceId || 'default'}
            format="model_congress"
            placeholder="Ask about bill writing, congressional procedure, committee strategy, speeches..."
            extraContext={(() => {
              const c = conferences.find(x => x.id === coachConferenceId);
              if (!c) return "";
              return `The delegate is preparing for "${c.name}". Base your procedural guidance on THIS conference's rules where relevant.${c.procedureText ? `\n\nConference rules of procedure:\n"""${c.procedureText.slice(0, 5000)}"""` : ""}${c.billTemplateText ? `\n\nRequired bill/document format:\n"""${c.billTemplateText.slice(0, 3000)}"""` : ""}`;
            })()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}