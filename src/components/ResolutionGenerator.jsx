import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Save, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PRESETS, CATEGORIES, COLOR_CLASSES } from "@/components/presetGenerator/presets";

const getInitialFields = (preset) => {
  const vals = {};
  preset.fields.forEach(f => { vals[f.key] = f.default || ''; });
  return vals;
};

export default function ResolutionGenerator({ projectId, onSaved }) {
  const { toast } = useToast();
  const [selectedPresetId, setSelectedPresetId] = useState('resolutions');
  const [fieldValues, setFieldValues] = useState(() => getInitialFields(PRESETS[0]));
  const [results, setResults] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingIdx, setSavingIdx] = useState(null);
  const [savedIdxs, setSavedIdxs] = useState(new Set());
  const [copiedIdx, setCopiedIdx] = useState(null);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.filter({ isArchived: false }),
    enabled: !projectId,
  });
  const [pickedProjectId, setPickedProjectId] = useState(projectId || "");

  const preset = PRESETS.find(p => p.id === selectedPresetId);
  const colors = COLOR_CLASSES[preset.color] || COLOR_CLASSES.indigo;

  const onPresetChange = (id) => {
    const p = PRESETS.find(x => x.id === id);
    setSelectedPresetId(id);
    setFieldValues(getInitialFields(p));
    setResults("");
    setSavedIdxs(new Set());
  };

  const generate = async () => {
    if (loading) return;
    const requiredMissing = preset.fields.filter(f => f.required && !fieldValues[f.key]?.trim());
    if (requiredMissing.length > 0) {
      toast({ title: `Please fill in: ${requiredMissing.map(f => f.label).join(', ')}`, variant: "destructive" });
      return;
    }
    setLoading(true);
    setResults("");
    setSavedIdxs(new Set());
    try {
      const res = await base44.integrations.Core.InvokeLLM({ prompt: preset.buildPrompt(fieldValues) });
      setResults(res);
    } catch {
      toast({ title: "Generation failed", variant: "destructive" });
    }
    setLoading(false);
  };

  const parsed = results ? preset.parseItems(results) : [];

  const copyItem = (text, idx) => {
    navigator.clipboard.writeText(preset.cleanItem(text));
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    toast({ title: "Copied!" });
  };

  const saveItem = useMutation({
    mutationFn: async ({ text, idx }) => {
      const clean = preset.cleanItem(text);
      const title = preset.titleFromItem(clean, fieldValues);
      const saveProjectId = projectId || pickedProjectId || "";
      const descParts = [preset.label];
      preset.fields.forEach(f => {
        if (fieldValues[f.key] && f.type !== 'select') descParts.push(fieldValues[f.key]);
      });
      return base44.entities.OtherDocument.create({
        title: title || preset.label,
        docLabel: preset.docLabel,
        content: clean,
        description: descParts.join(' • ').slice(0, 500),
        projectId: saveProjectId || undefined,
      });
    },
    onSuccess: (_, { idx }) => {
      setSavedIdxs(prev => new Set(prev).add(idx));
      toast({ title: "Saved to documents!" });
      if (onSaved) onSaved();
    },
    onError: () => toast({ title: "Could not save", variant: "destructive" }),
    onSettled: () => setSavingIdx(null),
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2">
        <div className={`w-9 h-9 ${colors.bg} rounded-xl flex items-center justify-center`}>
          <Sparkles className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 font-heading">Document Presets</h3>
          <p className="text-xs text-slate-500">Generate resolutions, MUN docs, Model Congress bills, and debate texts.</p>
        </div>
      </div>

      {/* CATEGORY + PRESET PICKER */}
      <div className="space-y-3">
        {CATEGORIES.map(cat => {
          const catPresets = PRESETS.filter(p => p.category === cat);
          return (
            <div key={cat}>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{cat}</div>
              <div className="flex flex-wrap gap-2">
                {catPresets.map(p => {
                  const PIcon = p.icon;
                  const isActive = p.id === selectedPresetId;
                  const pColors = COLOR_CLASSES[p.color] || COLOR_CLASSES.indigo;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onPresetChange(p.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                        isActive
                          ? `${pColors.bg} ${pColors.text} border-transparent ring-2 ${pColors.ring}`
                          : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <PIcon className="w-3.5 h-3.5" />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3 border border-slate-100">
        <span className="font-semibold text-slate-700">{preset.label}:</span> {preset.description}
      </div>

      {/* DYNAMIC FIELDS */}
      <div className="grid sm:grid-cols-2 gap-3">
        {preset.fields.map(f => (
          <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">
              {f.label}{f.required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            {f.type === 'select' ? (
              <Select value={fieldValues[f.key] || ''} onValueChange={v => setFieldValues(prev => ({ ...prev, [f.key]: v }))}>
                <SelectTrigger className="text-sm"><SelectValue placeholder={f.placeholder || 'Select...'} /></SelectTrigger>
                <SelectContent>
                  {f.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : f.type === 'textarea' ? (
              <Textarea
                value={fieldValues[f.key] || ''}
                onChange={e => setFieldValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                rows={2}
                className="text-sm"
              />
            ) : (
              <Input
                value={fieldValues[f.key] || ''}
                onChange={e => setFieldValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="text-sm"
              />
            )}
          </div>
        ))}
      </div>

      <Button onClick={generate} disabled={loading} className={`w-full h-11 gap-2 font-semibold ${colors.btn}`}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? "Generating..." : `Generate ${preset.label}`}
      </Button>

      {/* RESULTS */}
      {parsed.length > 0 && (
        <div className="border-t border-slate-100 pt-4 space-y-3">
          {!projectId && (
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Save to project (optional)</label>
              <Select value={pickedProjectId} onValueChange={setPickedProjectId}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Library only — or pick a project" /></SelectTrigger>
                <SelectContent>
                  {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            {parsed.map((block, idx) => {
              const isSaved = savedIdxs.has(idx);
              const clean = preset.cleanItem(block);
              return (
                <div key={idx} className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs font-medium text-slate-400 shrink-0">
                      {preset.multi ? `${idx + 1}` : preset.docLabel}
                    </p>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => copyItem(block, idx)} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-slate-600 transition-colors" title="Copy">
                        {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => { setSavingIdx(idx); saveItem.mutate({ text: block, idx }); }}
                        disabled={isSaved || savingIdx === idx}
                        className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-40"
                        title={isSaved ? "Saved" : "Save"}
                      >
                        {savingIdx === idx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isSaved ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Save className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <pre className="text-sm text-slate-800 whitespace-pre-wrap break-words font-sans leading-relaxed">{clean}</pre>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}