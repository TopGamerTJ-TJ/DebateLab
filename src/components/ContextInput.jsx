import { Textarea } from "@/components/ui/textarea";
import { MessageSquarePlus } from "lucide-react";

/**
 * Reusable optional "extra context" field for AI generation surfaces.
 * Lets the user steer the AI with their own notes, judge paradigm, case direction, etc.
 */
export default function ContextInput({ value, onChange, label = "Additional context (optional)", placeholder, rows = 2, className = "" }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
        <MessageSquarePlus className="w-3.5 h-3.5 text-slate-400" />
        {label}
      </label>
      <Textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || "Add anything to steer the AI — specific angle, judge preferences, tone, points to include or avoid..."}
        className="resize-none text-sm"
        rows={rows}
      />
    </div>
  );
}