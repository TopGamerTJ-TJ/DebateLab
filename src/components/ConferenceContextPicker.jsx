import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Landmark, Gavel, ScrollText, Plus } from "lucide-react";

const NONE = "__none__";

/**
 * Builds the combined rules/context text for a ConferenceProfile so the AI can read it.
 */
export function buildConferenceContextText(profile) {
  if (!profile) return "";
  const parts = [];
  parts.push(`CONFERENCE RULES/CONTEXT — "${profile.name}"${profile.conferenceType ? ` (${profile.conferenceType.replace(/_/g, " ")})` : ""}.`);
  if (profile.notes) parts.push(`Notes: ${profile.notes}`);
  if (profile.procedureText) parts.push(`RULES OF PROCEDURE:\n${profile.procedureText}`);
  if (profile.billTemplateText) parts.push(`REQUIRED DOCUMENT/BILL TEMPLATE (follow this format exactly):\n${profile.billTemplateText}`);
  return parts.join("\n\n");
}

/**
 * Reusable "Conference Rules/Context file" picker for AI surfaces.
 * Lets the user pick a saved conference profile whose uploaded rules the AI will follow.
 * `value` = selected profile id (or ""). `onChange(profileId, profile)` fires with the full profile.
 */
export default function ConferenceContextPicker({ value, onChange, label = "Conference Rules/Context (optional)", className = "" }) {
  const { data: profiles = [] } = useQuery({
    queryKey: ["conference_profiles"],
    queryFn: () => base44.entities.ConferenceProfile.list("-created_date"),
  });

  const selected = profiles.find(p => p.id === value) || null;

  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
        <Landmark className="w-3.5 h-3.5 text-slate-400" />
        {label}
      </label>
      <Select value={value || NONE} onValueChange={(v) => {
        const id = v === NONE ? "" : v;
        onChange(id, profiles.find(p => p.id === id) || null);
      }}>
        <SelectTrigger className="text-sm">
          <SelectValue placeholder="None — AI uses general rules" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>None — AI uses general rules</SelectItem>
          {profiles.map(p => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selected ? (
        <div className="flex flex-wrap gap-2 mt-2">
          {(selected.procedureText || selected.procedureFileUrl) && (
            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"><Gavel className="w-3 h-3" /> Rules of Procedure</span>
          )}
          {(selected.billTemplateText || selected.billTemplateFileUrl) && (
            <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full"><ScrollText className="w-3 h-3" /> Template</span>
          )}
          <span className="text-xs text-slate-400">The AI will follow these rules.</span>
        </div>
      ) : profiles.length === 0 ? (
        <Link to="/conference-profiles" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">
          <Plus className="w-3 h-3" /> Upload conference rules
        </Link>
      ) : null}
    </div>
  );
}