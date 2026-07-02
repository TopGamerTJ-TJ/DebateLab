import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Landmark, Plus } from "lucide-react";

const NONE = "__none__";

/**
 * Small select to link a saved Conference Rules/Context profile to a project or folder.
 * `value` = conferenceProfileId (or ""). `onChange(profileId)` fires on change.
 */
export default function ConferenceLinkSelect({ value, onChange, label = "Conference Rules/Context", compact = false }) {
  const { data: profiles = [] } = useQuery({
    queryKey: ["conference_profiles"],
    queryFn: () => base44.entities.ConferenceProfile.list("-created_date"),
  });

  return (
    <div>
      {label && (
        <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
          <Landmark className="w-3.5 h-3.5 text-slate-400" /> {label}
        </label>
      )}
      <Select value={value || NONE} onValueChange={(v) => onChange(v === NONE ? "" : v)}>
        <SelectTrigger className={compact ? "h-8 text-xs" : "text-sm"}>
          <SelectValue placeholder="None linked" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>None linked</SelectItem>
          {profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
        </SelectContent>
      </Select>
      {profiles.length === 0 && (
        <Link to="/conference-profiles" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1.5">
          <Plus className="w-3 h-3" /> Upload conference rules first
        </Link>
      )}
    </div>
  );
}