import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Trash2, Star, Copy, FileText, Folder, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import OtherDocGenerator from "@/components/OtherDocGenerator";
import DocumentViewer from "@/components/DocumentViewer";
import AnimatedPage from "@/components/AnimatedPage";

export default function OtherDocuments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewDoc, setViewDoc] = useState(null);

  const { data: docs = [] } = useQuery({
    queryKey: ['other_documents'],
    queryFn: () => base44.entities.OtherDocument.list('-created_date'),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date'),
  });

  const deleteDoc = useMutation({
    mutationFn: (id) => base44.entities.OtherDocument.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['other_documents'] }),
  });

  const toggleFavorite = useMutation({
    mutationFn: ({ id, val }) => base44.entities.OtherDocument.update(id, { isFavorite: val }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['other_documents'] }),
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const projectName = (pid) => projects.find(p => p.id === pid)?.name;

  return (
    <AnimatedPage>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28 lg:pb-8">
        <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-3xl p-8 mb-8 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3 text-violet-200 text-sm"><Sparkles className="w-4 h-4" /> Other Notes & Documents</div>
          <h1 className="text-3xl font-bold font-heading mb-2">Custom Document Studio</h1>
          <p className="text-violet-100 max-w-2xl">Generate any document you need that isn't covered by the dedicated sections — describe it, and the AI builds it. Save your documents to projects and find them in the project's "Other Documents" tab.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <OtherDocGenerator />

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-violet-500" />
              <h3 className="font-bold text-slate-900 font-heading">My Documents ({docs.length})</h3>
            </div>

            {docs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <FileText className="w-10 h-10 text-slate-200 mb-3" />
                <p className="text-slate-500 text-sm">No documents yet.</p>
                <p className="text-slate-400 text-xs mt-1">Describe what you need on the left to generate your first one.</p>
              </div>
            ) : (
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
                {docs.map(doc => (
                  <div key={doc.id} className="bg-slate-50 rounded-xl border border-slate-100 p-4 hover:border-violet-200 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <button onClick={() => setViewDoc(doc)} className="text-left flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 text-sm hover:text-violet-700 transition-colors line-clamp-1">{doc.title}</h4>
                      </button>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => toggleFavorite.mutate({ id: doc.id, val: !doc.isFavorite })} className="p-1.5 hover:bg-white rounded-lg transition-colors">
                          <Star className={`w-3.5 h-3.5 ${doc.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                        <button onClick={() => copyToClipboard(doc.content)} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteDoc.mutate(doc.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {doc.docLabel && <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">{doc.docLabel}</span>}
                      {doc.projectId && projectName(doc.projectId) && (
                        <Link to={`/projects/${doc.projectId}`} className="inline-flex items-center gap-1 text-slate-500 hover:text-violet-700">
                          <Folder className="w-3 h-3" />{projectName(doc.projectId)}
                        </Link>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{doc.content}</p>
                    <button onClick={() => setViewDoc(doc)} className="text-xs text-violet-600 font-medium mt-2 hover:underline">View full document →</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DocumentViewer doc={viewDoc} onClose={() => setViewDoc(null)} />
      </div>
    </AnimatedPage>
  );
}