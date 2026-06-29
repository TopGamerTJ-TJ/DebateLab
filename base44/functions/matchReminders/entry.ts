import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Runs as service role
    const now = new Date();
    const lobbies = await base44.asServiceRole.entities.DebateLobby.filter({ status: "open" });
    
    const intervals = [
      { key: "10m", ms: 10 * 60000, label: "10 minutes" },
      { key: "30m", ms: 30 * 60000, label: "30 minutes" },
      { key: "1h", ms: 60 * 60000, label: "1 hour" },
      { key: "2h", ms: 120 * 60000, label: "2 hours" },
      { key: "1d", ms: 24 * 60 * 60000, label: "1 day" }
    ];

    for (const lobby of lobbies) {
      if (!lobby.scheduledTime) continue;
      const scheduled = new Date(lobby.scheduledTime);
      const diffMs = scheduled.getTime() - now.getTime();
      if (diffMs <= 0) continue;

      for (const inv of intervals) {
        // If the match is within the interval + 5 minutes
        if (diffMs <= inv.ms && diffMs > inv.ms - 300000) {
          // Check if we already sent this reminder to prevent duplicates.
          // For simplicity, we just send it. Realistically we'd track it in the DB.
          
          // Notify creator
          const creatorProfile = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: lobby.creatorId });
          if (!creatorProfile[0] || creatorProfile[0].notificationsEnabled !== false) {
             await base44.asServiceRole.entities.UserNotification.create({
                userId: lobby.creatorId,
                title: "Match Reminder",
                message: `Your scheduled match "${lobby.topic}" starts in ${inv.label}.`,
                link: `/match`,
                type: "reminder"
             });
          }
          
          // Notify joined user if any
          if (lobby.joinedUserId) {
            const joinedProfile = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: lobby.joinedUserId });
            if (!joinedProfile[0] || joinedProfile[0].notificationsEnabled !== false) {
               await base44.asServiceRole.entities.UserNotification.create({
                  userId: lobby.joinedUserId,
                  title: "Match Reminder",
                  message: `Your scheduled match "${lobby.topic}" starts in ${inv.label}.`,
                  link: `/match`,
                  type: "reminder"
               });
            }
          }
          break; // Don't send multiple intervals at once
        }
      }
    }
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});