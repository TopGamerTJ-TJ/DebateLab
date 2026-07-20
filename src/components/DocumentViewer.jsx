import { useState } from "react";
import { Copy, Download, Plus, X, Maximize2, Minimize2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import MarkdownContent from "@/components/MarkdownContent";

export default function DocumentViewer({ doc, onClose, onAddContention, addContentionLabel = "Add as Contention" }) {
  const { toast } = useToast();
  const [fullscreen, setFullscreen] = useState(false);
  if (!doc) return null;

  const copy = () => {
    navigator.clipboard.writeText(doc.content || "");
    toast({ title: "Copied to clipboard!" });
  };

  const download = () => {
    const blob = new Blob([doc.content || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(doc.title || "document").replace(/[^a-z0-9]+/gi, "_").slice(0, 60)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full flex flex-col ${fullscreen ? "max-w-6xl max-h-[96vh]" : "max-w-3xl max-h-[88vh]"}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-100">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-1">
              {doc.docLabel && <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">{doc.docLabel}</span>}
              {doc.type && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium capitalize">{doc.type.replace(/_/g, " ")}</span>}
            </div>
            <h3 className="font-bold text-slate-900 font-heading truncate">{doc.title}</h3>
            {(doc.country || doc.committee) && <p className="text-xs text-slate-500 mt-0.5">{[doc.country, doc.committee].filter(Boolean).join(" • ")}</p>}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0 justify-end">
            <button onClick={copy} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-primary bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"><Copy className="w-3.5 h-3.5" /> Copy</button>
            <button onClick={download} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-primary bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"><Download className="w-3.5 h-3.5" /> .txt</button>
            <button onClick={() => setFullscreen(f => !f)} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-primary bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">{fullscreen ? <><Minimize2 className="w-3.5 h-3.5" /> Exit Fullscreen</> : <><Maximize2 className="w-3.5 h-3.5" /> Fullscreen</>}</button>
            {onAddContention && <button onClick={() => onAddContention(doc)} className="flex items-center gap-1.5 text-xs text-white bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-lg transition-colors"><Plus className="w-3.5 h-3.5" /> {addContentionLabel}</button>}
            {onClose && <button onClick={onClose} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"><X className="w-3.5 h-3.5" /> Close</button>}
          </div>
        </div>
        <div className="p-6 overflow-y-auto">
          <MarkdownContent content={doc.content} />
        </div>
      </div>
    </div>
  );
}