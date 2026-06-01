import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Columns, Plus, Trash2, Save, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const PF_COLS = ["1AC", "CX→", "1NC", "CX→", "1AR", "CX→", "1NR", "CX→", "2AS", "GCX→", "2NS", "2AF", "2NF"];
const PARLI_COLS = ["PM", "LO", "DPM", "DLO", "MG", "MO", "GW", "OW"];
const FORMAT_COLS = { public_forum: PF_COLS, parliamentary: PARLI_COLS };

export default function FlowingTool() {
  const [activeFlowId, setActiveFlowId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newFormat, setNewFormat] = useState("public_forum");
  const [newResolution, setNewResolution] = useState("");
  const [columns, setColumns] = useState({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: flows = [] } = useQuery({ queryKey: ['flows'], queryFn: () => base44.entities.Flow.list('-created_date') });

  const activeFlow = flows.find(f => f.id === activeFlowId);
  const colLabels = activeFlow ? (FORMAT_COLS[activeFlow.format] || PF_COLS) : [];

  const create = useMutation({
    mutationFn: () => base44.entities.Flow.create({ title: newTitle, format: newFormat, resolution: newResolution, columns: {} }),
    onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ['flows'] }); setActiveFlowId(data.id); setColumns({}); setNewTitle(""); setNewResolution(""); }
  });

  const save = useMutation({
    mutationFn: () => base44.entities.Flow.update(activeFlowId, { columns }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['flows'] }); toast({ title: "Flow saved!" }); }
  });

  const del = useMutation({
    mutationFn: (id) => base44.entities.Flow.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['flows'] }); if (activeFlowId === del.variables) setActiveFlowId(null); }
  });

  const openFlow = (flow) => { setActiveFlowId(flow.id); setColumns(flow.columns || {}); };

  const setCol = (col, val) => setColumns(prev => ({ ...prev, [col]: val }));

  return (
    <div className="max-w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-8 mb-8 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3 text-cyan-100 text-sm"><span>📋</span> Flowing Tool</div>
          <h1 className="text-3xl font-bold font-heading mb-2">Digital Flow Sheet</h1>
          <p className="text-cyan-100 max-w-2xl">Track every argument, response, and clash in real time. Save your flows and review them to improve strategy.</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-4">
              <h3 className="font-bold text-slate-900 font-heading text-sm mb-4">New Flow</h3>
              <div className="space-y-3">
                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Flow name (e.g., Round 1 vs. Lincoln)" />
                <Select value={newFormat} onValueChange={setNewFormat}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public_forum">Public Forum</SelectItem>
                    <SelectItem value="parliamentary">Parliamentary</SelectItem>
                  </SelectContent>
                </Select>
                <Input value={newResolution} onChange={e => setNewResolution(e.target.value)} placeholder="Resolution (optional)" />
                <Button onClick={() => create.mutate()} disabled={!newTitle || create.isPending} className="w-full gap-2 text-sm">
                  <Plus className="w-4 h-4" /> Create Flow
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 font-heading text-sm mb-3">Saved Flows</h3>
              {flows.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No flows yet</p>
              ) : (
                <div className="space-y-2">
                  {flows.map(f => (
                    <div key={f.id} className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${f.id === activeFlowId ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'}`} onClick={() => openFlow(f)}>
                      <div className="min-w-0">
                        <div className={`text-sm font-medium truncate ${f.id === activeFlowId ? 'text-primary' : 'text-slate-700'}`}>{f.title}</div>
                        <div className="text-xs text-slate-400 capitalize">{f.format?.replace('_', ' ')}</div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); del.mutate(f.id); }} className="p-1 hover:bg-red-50 rounded ml-2 shrink-0">
                        <Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Flow sheet */}
          <div className="lg:col-span-3">
            {!activeFlowId ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                <Columns className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Select or create a flow</h3>
                <p className="text-slate-500">Create a new flow or select one from the sidebar to start tracking arguments.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 font-heading">{activeFlow?.title}</h3>
                    <p className="text-xs text-slate-500 capitalize">{activeFlow?.format?.replace('_', ' ')} · {activeFlow?.resolution || 'No resolution set'}</p>
                  </div>
                  <Button onClick={() => save.mutate()} disabled={save.isPending} size="sm" className="gap-2">
                    <Save className="w-4 h-4" /> Save Flow
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <div className="flex min-w-max p-4 gap-3">
                    {colLabels.map((col) => (
                      <div key={col} className="flex-shrink-0 w-52">
                        <div className="bg-blue-50 rounded-t-lg px-3 py-2 text-center">
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">{col}</span>
                        </div>
                        <Textarea
                          value={columns[col] || ""}
                          onChange={e => setCol(col, e.target.value)}
                          placeholder={`${col} arguments...`}
                          className="resize-none rounded-t-none border-t-0 text-xs h-80 leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                  <p className="text-xs text-slate-400 text-center">Tip: Use → to mark extensions, ✓ for dropped arguments, and * for key voting issues</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}