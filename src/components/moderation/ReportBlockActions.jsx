import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Flag, UserX } from "lucide-react";

export default function ReportBlockActions({ user, item, itemType, postId, content, authorName, onBlocked, toast }) {
  const queryClient = useQueryClient();
  const authorId = item?.created_by_id;
  const isOwnContent = !authorId || user?.id === authorId;

  const createReport = async (reason) => {
    if (!user?.id) return;
    const report = await base44.entities.ModerationReport.create({
      reporterId: user.id,
      reporterEmail: user.email || "",
      itemType,
      itemId: item.id,
      postId: postId || item.id,
      contentAuthorId: authorId,
      contentAuthorName: authorName || "Anonymous",
      content: content || "",
      reason
    });
    await base44.functions.invoke("reviewModerationReport", { reportId: report.id, action: "auto" }).catch(() => null);
    queryClient.invalidateQueries({ queryKey: ["moderation_reports"] });
    toast?.({ title: "Report submitted", description: "Thanks. An admin will review it." });
  };

  const handleReport = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const reason = window.prompt("Why are you reporting this content?", "Objectionable or abusive content");
    if (!reason) return;
    await createReport(reason);
  };

  const handleBlock = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOwnContent) return;
    await base44.entities.BlockedUser.create({
      blockerId: user.id,
      blockedUserId: authorId,
      blockedUserName: authorName || "Anonymous",
      reason: "Blocked after abusive or objectionable content"
    });
    await createReport("Blocked user for abusive or objectionable content");
    queryClient.setQueryData(["blocked_users", user.id], (old = []) => [
      ...old,
      { id: `temp-${Date.now()}`, blockerId: user.id, blockedUserId: authorId, blockedUserName: authorName || "Anonymous" }
    ]);
    onBlocked?.(authorId);
    toast?.({ title: "User blocked", description: "Their content was removed from your feed." });
  };

  if (!user?.id) return null;

  return (
    <div className="flex items-center gap-3">
      <button onClick={handleReport} className="flex items-center gap-1.5 p-2 -m-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors">
        <Flag className="w-4 h-4" /> Report
      </button>
      {!isOwnContent && (
        <button onClick={handleBlock} className="flex items-center gap-1.5 p-2 -m-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
          <UserX className="w-4 h-4" /> Block
        </button>
      )}
    </div>
  );
}