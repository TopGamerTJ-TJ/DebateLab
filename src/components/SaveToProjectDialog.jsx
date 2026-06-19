import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Folder, Check, Plus } from "lucide-react";

const FORMATS = [
  { v: "parliamentary", l: "Parliamentary Debate" },
  { v: "public_forum", l: "Public Forum" },
  { v: "model_un", l: "Model UN" },
  { v: "model_congress", l: "Model Congress" },
];

export default function SaveToProjectDialog({ open, onClose, onSave, count = 1 }) {
  const [mode, setMode] = useState("select");
  const [newName, setNewName] = useState("");
  const [newFormat, setNewFormat] = useState("");
  const [selected, setSelected] = useState(null);
  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date'),
    enabled: open,
  });

  const createProject = useMutation({
    mutationFn: ({ name, format }) => base44.entities.Project.create({ name, format: format || undefined }),
    onSuccess: (p) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onSave(p.id, p.name);
      setNewName("");
      setNewFormat("");
    }
  });

  const handleSave = () => {
    if (mode === "new") {
      if (!newName.trim()) return;
      createProject.mutate({ name: newName.trim(), format: newFormat });
    } else {
      if (!selected) return;
      onSave(selected.id, selected.name);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save {count > 1 ? `${count} Contentions` : "Contention"} to Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setMode("select")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${mode === "select" ? "bg-primary text-white border-primary" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              Existing Project
            </button>
            <button onClick={() => setMode("new")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${mode === "new" ? "bg-primary text-white border-primary" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              <Plus className="w-3.5 h-3.5 inline mr-1" />New Project
            </button>
          </div>

          {mode === "select" ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {projects.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">No projects yet.<br />Switch to "New Project" to create one.</p>
              ) : projects.map(p => (
                <button key={p.id} onClick={() => setSelected(p)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selected?.id === p.id ? "border-primary bg-blue-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
                  <Folder className={`w-4 h-4 ${selected?.id === p.id ? "text-primary" : "text-slate-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{p.name}</div>
                    {p.format && <div className="text-xs text-slate-400 capitalize">{p.format.replace(/_/g, ' ')}</div>}
                  </div>
                  {selected?.id === p.id && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Project name *" autoFocus
                onKeyDown={e => e.key === "Enter" && handleSave()} />
              <Select value={newFormat} onValueChange={setNewFormat}>
                <SelectTrigger><SelectValue placeholder="Format (optional)" /></SelectTrigger>
                <SelectContent>{FORMATS.map(f => <SelectItem key={f.v} value={f.v}>{f.l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}
              disabled={mode === "select" ? !selected : !newName.trim() || createProject.isPending}>
              {createProject.isPending ? "Creating..." : `Save to Project`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}