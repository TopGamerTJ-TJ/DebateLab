import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle, ShieldAlert, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ModerationPanel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reports = [] } = useQuery({
    queryKey: ["moderation_reports"],
    queryFn: () => base44.entities.ModerationReport.list("-created_date", 100),
    refetchInterval: 5000
  });

  useEffect(() => {
    const unsubscribe = base44.entities.ModerationReport.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["moderation_reports"] });
    });
    return unsubscribe;
  }, [queryClient]);

  const { data: settings = [] } = useQuery({
    queryKey: ["moderation_settings"],
    queryFn: () => base44.entities.AppSettings.filter({ key: "moderation_mode" })
  });

  const mode = settings[0]?.value || "manual";
  const pendingReports = reports.filter((r) => r.status === "pending");

  const setMode = useMutation({
    mutationFn: async (nextMode) => {
      if (settings[0]) return base44.entities.AppSettings.update(settings[0].id, { value: nextMode });
      return base44.entities.AppSettings.create({ key: "moderation_mode", value: nextMode });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation_settings"] });
      toast({ title: "Moderation mode updated" });
    }
  });

  const review = useMutation({
    mutationFn: ({ reportId, action }) => base44.functions.invoke("reviewModerationReport", { reportId, action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation_reports"] });
      queryClient.invalidateQueries({ queryKey: ["banned_users"] });
      toast({ title: "Report reviewed" });
    }
  });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h4 className="font-bold text-slate-900 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-500" /> Flagged Content</h4>
            <p className="text-xs text-slate-500 mt-1">Choose manual review or automatic AI review for new reports.</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant={mode === "manual" ? "default" : "outline"} onClick={() => setMode.mutate("manual")}>Manual</Button>
            <Button size="sm" variant={mode === "ai" ? "default" : "outline"} onClick={() => setMode.mutate("ai")} className="gap-1.5 text-slate-900 [&_svg]:text-slate-900"><Bot className="w-3.5 h-3.5" /> AI Auto</Button>
          </div>
        </div>
      </div>

      {pendingReports.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-8">No pending flagged content.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {pendingReports.map((report) => (
            <div key={report.id} className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="bg-white capitalize">{report.itemType}</Badge>
                    <span className="text-xs text-slate-500">Reported {new Date(report.created_date).toLocaleString()}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">By {report.contentAuthorName || "Anonymous"}</div>
                  <div className="text-xs text-slate-600 mt-1">Reason: {report.reason}</div>
                </div>
              </div>
              <p className="text-sm text-slate-800 bg-white border border-amber-100 rounded-lg p-3 whitespace-pre-wrap line-clamp-5">{report.content}</p>
              {report.aiReason && <p className="text-xs text-slate-500 mt-2">AI: {report.aiReason}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => review.mutate({ reportId: report.id, action: "ai" })} disabled={review.isPending} className="gap-1.5 text-slate-900 [&_svg]:text-slate-900"><Bot className="w-3.5 h-3.5" /> Check with AI</Button>
                <Button size="sm" onClick={() => review.mutate({ reportId: report.id, action: "violation" })} disabled={review.isPending} className="gap-1.5 bg-red-600 hover:bg-red-700"><CheckCircle className="w-3.5 h-3.5" /> Remove + Warn</Button>
                <Button size="sm" variant="ghost" onClick={() => review.mutate({ reportId: report.id, action: "dismiss" })} disabled={review.isPending} className="gap-1.5"><XCircle className="w-3.5 h-3.5" /> Dismiss</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}