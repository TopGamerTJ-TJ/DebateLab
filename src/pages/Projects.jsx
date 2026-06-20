import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Folder, Plus, Trash2, ArrowRight, BookOpen, Archive, ArchiveRestore } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const FORMATS = [
  { v: "parliamentary", l: "Parliamentary" },
  { v: "public_forum", l: "Public Forum" },
  { v: "model_un", l: "Model UN" },
  { v: "model_congress", l: "Model Congress" },
];

const FORMAT_COLORS = {
  parliamentary: "bg-blue-100 text-blue-700",
  public_forum: "bg-indigo-100 text-indigo-700",
  model_un: "bg-teal-100 text-teal-700",
  model_congress: "bg-purple-100 text-purple-700",
};

export default function Projects() {
  const [showCreate, setShowCreate] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", format: "", resolution: "", side: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allProjects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date'),
  });

  const projects = allProjects.filter(p => !p.isArchived);
  const archivedProjects = allProjects.filter(p => p.isArchived);

  const createProject = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: "Project created!" });
      setShowCreate(false);
      setForm({ name: "", description: "", format: "", resolution: "", side: "" });
    }
  });

  const deleteProject = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); toast({ title: "Project deleted" }); }
  });

  const archiveProject = useMutation({
    mutationFn: ({ id, val }) => base44.entities.Project.update(id, { isArchived: val }),
    onSuccess: (_, { val }) => { queryClient.invalidateQueries({ queryKey: ['projects'] }); toast({ title: val ? "Project archived" : "Project unarchived" }); }
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28 lg:pb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">Organize your contentions, notes, and debate prep by project</p>
        </div>
        <div className="flex gap-2">
          {archivedProjects.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setShowArchived(!showArchived)} className="gap-1.5 text-xs">
              <Archive className="w-3.5 h-3.5" />{showArchived ? "Hide Archived" : `Archived (${archivedProjects.length})`}
            </Button>
          )}
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Folder className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="font-bold text-slate-700 font-heading mb-2">No projects yet</h3>
          <p className="text-slate-400 text-sm mb-6">Create a project to organize your contentions and debate prep</p>
          <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="w-4 h-4" /> Create First Project</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(showArchived ? archivedProjects : projects).map(p => (
            <div key={p.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${p.isArchived ? "opacity-60 border-slate-300" : "border-slate-200"}`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Folder className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={(e) => { e.preventDefault(); archiveProject.mutate({ id: p.id, val: !p.isArchived }); }}
                      className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-300 hover:text-amber-500 transition-all" title={p.isArchived ? "Unarchive" : "Archive"}
                    >
                      {p.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); if (confirm("Delete this project?")) deleteProject.mutate(p.id); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 font-heading mb-1 truncate">{p.name}</h3>
                {p.description && <p className="text-xs text-slate-500 line-clamp-2 mb-2">{p.description}</p>}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {p.format && <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${FORMAT_COLORS[p.format] || "bg-slate-100 text-slate-600"}`}>{p.format.replace(/_/g, ' ')}</span>}
                  {p.resolution && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full truncate max-w-[140px]">{p.resolution}</span>}
                </div>
              </div>
              <div className="px-5 pb-4">
                <Link to={`/projects/${p.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-primary text-slate-600 text-sm font-medium transition-all">
                  Open Project <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Project name *" autoFocus />
            <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description (optional)" rows={2} className="resize-none text-sm" />
            <Select value={form.format} onValueChange={v => setForm({...form, format: v})}>
              <SelectTrigger><SelectValue placeholder="Format (optional)" /></SelectTrigger>
              <SelectContent>{FORMATS.map(f => <SelectItem key={f.v} value={f.v}>{f.l}</SelectItem>)}</SelectContent>
            </Select>
            <Input value={form.resolution} onChange={e => setForm({...form, resolution: e.target.value})} placeholder="Resolution (optional)" />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button className="flex-1" disabled={!form.name.trim() || createProject.isPending}
                onClick={() => createProject.mutate({ name: form.name, description: form.description, format: form.format || undefined, resolution: form.resolution })}>
                {createProject.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}