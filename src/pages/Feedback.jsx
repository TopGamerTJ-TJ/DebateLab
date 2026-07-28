import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, FileText, Trash2, Star, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import FeedbackGenerator from "@/components/FeedbackGenerator";
import DocumentViewer from "@/components/DocumentViewer";
import AnimatedPage from "@/components/AnimatedPage";

export default function Feedback() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewDoc, setViewDoc] = useState(null);

  const { data: docs = [] } = useQuery({
    queryKey: ['other_documents'],
    queryFn: () => base44.entities.OtherDocument.list('-created_date'),
  });

  const feedbackDocs = docs.filter(d => d.docLabel === "AI Feedback");

  const deleteDoc = useMutation({
    mutationFn: (id) => base44.entities.OtherDocument.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['other_documents'] }),
  });

  const toggleFavorite = useMutation({
    mutationFn: ({ id, val }) => base44.entities.OtherDocument.update(id, { isFavorite: val }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['other_documents'] }),
  });

  return (
    <AnimatedPage>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28 lg:pb-8">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-8 mb-8 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3 text-amber-100 text-sm"><Sparkles className="w-4 h-4" /> AI Feedback Studio</div>
          <h1 className="text-3xl font-bold font-heading mb-2">Document Feedback Generator</h1>
          <p className="text-amber-50 max-w-2xl">Paste, upload, or select a document and get detailed coaching feedback. For Model UN projects, feedback is grounded in the Complete MUN Mastery Guide. Save feedback to your documents library.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <FeedbackGenerator onSaved={() => queryClient.invalidateQueries({ queryKey: ['other_documents'] })} />

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 font-heading">Saved Feedback ({feedbackDocs.length})</h3>
            </div>

            {feedbackDocs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <FileText className="w-10 h-10 text-slate-200 mb-3" />
                <p className="text-slate-500 text-sm">No feedback saved yet.</p>
                <p className="text-slate-400 text-xs mt-1">Generate feedback and save it to see it here.</p>
              </div>
            ) : (
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
                {feedbackDocs.map(doc => (
                  <div key={doc.id} className="bg-slate-50 rounded-xl border border-slate-100 p-4 hover:border-amber-200 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <button onClick={() => setViewDoc(doc)} className="text-left flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 text-sm hover:text-amber-700 transition-colors line-clamp-1">{doc.title}</h4>
                      </button>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => toggleFavorite.mutate({ id: doc.id, val: !doc.isFavorite })} className="p-1.5 hover:bg-white rounded-lg transition-colors">
                          <Star className={`w-3.5 h-3.5 ${doc.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                        <button onClick={() => { navigator.clipboard.writeText(doc.content); toast({ title: "Copied to clipboard!" }); }} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteDoc.mutate(doc.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{doc.content}</p>
                    <button onClick={() => setViewDoc(doc)} className="text-xs text-amber-600 font-medium mt-2 hover:underline">View feedback →</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DocumentViewer doc={viewDoc} onClose={() => setViewDoc(null)} onUpdate={(id, data) => base44.entities.OtherDocument.update(id, data).then(() => queryClient.invalidateQueries({ queryKey: ['other_documents'] }))} />
      </div>
    </AnimatedPage>
  );
}