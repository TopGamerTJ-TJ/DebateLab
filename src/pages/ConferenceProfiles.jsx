import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Landmark, Plus, Loader2, Trash2, Upload, FileText, Gavel, ScrollText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import AnimatedPage from "@/components/AnimatedPage";

const CONF_TYPES = [
  { value: "model_congress", label: "Model Congress" },
  { value: "model_un", label: "Model UN" },
  { value: "debate", label: "Debate" },
  { value: "other", label: "Other" },
];

const emptyForm = {
  name: "", conferenceType: "model_congress", notes: "",
  procedureText: "", procedureFileUrl: "", procedureFileName: "",
  billTemplateText: "", billTemplateFileUrl: "", billTemplateFileName: "",
};

export default function ConferenceProfiles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(null);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["conference_profiles"],
    queryFn: () => base44.entities.ConferenceProfile.list("-created_date"),
  });

  const createProfile = useMutation({
    mutationFn: (data) => base44.entities.ConferenceProfile.create({ ...data, ownerUserId: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conference_profiles"] });
      toast({ title: "Conference profile saved!" });
      setForm(emptyForm);
      setOpen(false);
    },
    onError: () => toast({ title: "Couldn't save profile", variant: "destructive" }),
  });

  const deleteProfile = useMutation({
    mutationFn: (id) => base44.entities.ConferenceProfile.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conference_profiles"] }),
  });

  const handleUpload = async (e, kind) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(kind);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      // Extract the text so the AI can read the document later.
      const res = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: { type: "object", properties: { fullText: { type: "string" } } },
      });
      const text = res?.output?.fullText || "";
      if (kind === "procedure") {
        setForm(f => ({ ...f, procedureFileUrl: file_url, procedureFileName: file.name, procedureText: text || f.procedureText }));
      } else {
        setForm(f => ({ ...f, billTemplateFileUrl: file_url, billTemplateFileName: file.name, billTemplateText: text || f.billTemplateText }));
      }
      toast({ title: `${file.name} uploaded` });
    } catch {
      toast({ title: "Upload failed. You can paste the text manually instead.", variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  return (
    <AnimatedPage>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28 lg:pb-8">
        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-3xl p-8 mb-8 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3 text-teal-100 text-sm"><Landmark className="w-4 h-4" /> Conference Profiles</div>
          <h1 className="text-3xl font-bold font-heading mb-2">Conference-Specific Rules & Templates</h1>
          <p className="text-teal-50 max-w-2xl">Every conference runs differently. Upload the rules of procedure and bill template for your conference (like Harvard Model Congress) so the AI teaches procedure and formats bills exactly the way your chairs expect.</p>
        </div>

        <div className="flex justify-between items-center mb-5">
          <h2 className="font-bold text-slate-900 font-heading text-lg">Your Conferences ({profiles.length})</h2>
          <Button onClick={() => { setForm(emptyForm); setOpen(true); }} className="gap-2"><Plus className="w-4 h-4" /> Add Conference</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : profiles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Landmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No conference profiles yet. Add one to tailor the AI to your conference's exact procedure and bill format.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {profiles.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900">{p.name}</h3>
                    <span className="text-xs text-slate-500 capitalize">{p.conferenceType?.replace(/_/g, " ")}</span>
                  </div>
                  <button onClick={() => deleteProfile.mutate(p.id)} className="min-w-[44px] min-h-[44px] -m-2 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {p.notes && <p className="text-sm text-slate-500 mb-3 line-clamp-2">{p.notes}</p>}
                <div className="flex flex-wrap gap-2 mt-2">
                  {(p.procedureText || p.procedureFileUrl) && (
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full"><Gavel className="w-3 h-3" /> Procedure</span>
                  )}
                  {(p.billTemplateText || p.billTemplateFileUrl) && (
                    <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full"><ScrollText className="w-3 h-3" /> Bill Template</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add Conference Profile</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Conference name (e.g. Harvard Model Congress)" />
              <Select value={form.conferenceType} onValueChange={v => setForm({ ...form, conferenceType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CONF_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional) — anything unique about this conference" rows={2} className="resize-none text-sm" />

              <div className="border-t border-slate-100 pt-4">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2"><Gavel className="w-4 h-4 text-blue-600" /> Rules of Procedure</label>
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-3 text-sm text-slate-500 cursor-pointer hover:border-blue-300 hover:text-blue-600 transition-colors mb-2">
                  {uploading === "procedure" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {form.procedureFileName || "Upload procedure document (PDF, DOC, TXT)"}
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.csv" onChange={e => handleUpload(e, "procedure")} />
                </label>
                <Textarea value={form.procedureText} onChange={e => setForm({ ...form, procedureText: e.target.value })} placeholder="…or paste the rules of procedure here" rows={3} className="resize-none text-sm" />
              </div>

              <div className="border-t border-slate-100 pt-4">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2"><ScrollText className="w-4 h-4 text-purple-600" /> Bill / Document Template</label>
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-3 text-sm text-slate-500 cursor-pointer hover:border-purple-300 hover:text-purple-600 transition-colors mb-2">
                  {uploading === "bill" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  {form.billTemplateFileName || "Upload bill template (PDF, DOC, TXT)"}
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.csv" onChange={e => handleUpload(e, "bill")} />
                </label>
                <Textarea value={form.billTemplateText} onChange={e => setForm({ ...form, billTemplateText: e.target.value })} placeholder="…or paste the required bill format/template here" rows={3} className="resize-none text-sm" />
              </div>

              <Button onClick={() => createProfile.mutate(form)} disabled={!form.name || createProfile.isPending} className="w-full gap-2">
                {createProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Save Conference
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedPage>
  );
}