import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Folder, Save, Plus } from "lucide-react";

const NONE = "__none__";

/**
 * Reusable dialog for saving any AI-generated item.
 * User can save it standalone (to their library) or attach it to a project.
 * onSave({ projectId }) is called with the chosen project (or "" for standalone).
 */
export default function SaveGeneratedDialog({ open, onClose, onSave, saving = false, itemLabel = "item" }) {
  const [projectId, setProjectId] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const all = await base44.entities.Project.list("-created_date");
      return all.filter(p => !p.isArchived);
    },
    enabled: open,
  });

  const handleSave = async () => {
    let finalProjectId = projectId;
    if (projectId === "__new__") {
      if (!newName.trim()) return;
      setCreating(true);
      const p = await base44.entities.Project.create({ name: newName.trim() });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      finalProjectId = p.id;
      setCreating(false);
    }
    onSave({ projectId: finalProjectId === NONE ? "" : finalProjectId });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save {itemLabel}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Save this to your library on its own, or attach it to a project.</p>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-slate-400" /> Project (optional)
            </label>
            <Select value={projectId || NONE} onValueChange={setProjectId}>
              <SelectTrigger className="text-sm"><SelectValue placeholder="Save on its own" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Save on its own (library)</SelectItem>
                {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                <SelectItem value="__new__"><span className="inline-flex items-center gap-1"><Plus className="w-3 h-3" /> New project…</span></SelectItem>
              </SelectContent>
            </Select>
          </div>

          {projectId === "__new__" && (
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New project name *" autoFocus />
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1 gap-2" onClick={handleSave}
              disabled={saving || creating || (projectId === "__new__" && !newName.trim())}>
              <Save className="w-4 h-4" />{saving || creating ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}