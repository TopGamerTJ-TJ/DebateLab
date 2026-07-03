import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Folder, FileText, Landmark } from "lucide-react";

const NONE = "__none__";

/**
 * Lets the user pick material to memorize: a project (uses its contentions),
 * a saved Model UN document, or a saved Model Congress bill.
 * onChange(text, label) fires with the extracted source text.
 */
export default function MemorySourcePicker({ value, onChange }) {
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await base44.entities.Project.list("-created_date")).filter(p => !p.isArchived),
  });
  const { data: munDocs = [] } = useQuery({
    queryKey: ["mun_documents"],
    queryFn: () => base44.entities.MUNDocument.list("-created_date", 100),
  });
  const { data: bills = [] } = useQuery({
    queryKey: ["congress_bills"],
    queryFn: () => base44.entities.CongressBill.list("-created_date", 100),
  });

  const handleChange = async (v) => {
    if (v === NONE) { onChange("", ""); return; }
    const [kind, id] = v.split(":");
    if (kind === "project") {
      const p = projects.find(x => x.id === id);
      const cons = await base44.entities.Contention.filter({ projectId: id }, "-created_date", 50);
      const text = cons.map((c, i) =>
        `${i + 1}. ${c.title}\nClaim: ${c.claim || ""}\nWarrant: ${c.warrant || ""}\nImpact: ${c.impact || ""}`
      ).join("\n\n");
      onChange(text || (p?.notes || ""), p?.name || "Project");
    } else if (kind === "mun") {
      const d = munDocs.find(x => x.id === id);
      onChange(d?.content || "", d?.title || "Document");
    } else if (kind === "bill") {
      const b = bills.find(x => x.id === id);
      onChange(b?.content || "", b?.title || "Bill");
    }
  };

  return (
    <div className="mb-4">
      <label className="text-sm font-medium text-slate-700 mb-1.5 block">Pull material from a project or document (optional)</label>
      <Select value={value || NONE} onValueChange={handleChange}>
        <SelectTrigger className="text-sm"><SelectValue placeholder="Or paste your own below" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>None — I'll paste my own</SelectItem>
          {projects.length > 0 && projects.map(p => (
            <SelectItem key={p.id} value={`project:${p.id}`}>
              <span className="inline-flex items-center gap-1.5"><Folder className="w-3.5 h-3.5 text-primary" /> {p.name}</span>
            </SelectItem>
          ))}
          {munDocs.map(d => (
            <SelectItem key={d.id} value={`mun:${d.id}`}>
              <span className="inline-flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5 text-teal-600" /> {d.title}</span>
            </SelectItem>
          ))}
          {bills.map(b => (
            <SelectItem key={b.id} value={`bill:${b.id}`}>
              <span className="inline-flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-blue-600" /> {b.title}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}