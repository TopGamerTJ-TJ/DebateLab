import React, { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const BanContext = createContext(null);

export function useBans() {
  return useContext(BanContext) || { banForum: false, banFriends: false, banMatch: false };
}

export default function BanGate({ children }) {
  const [bans, setBans] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const user = await base44.auth.me().catch(() => null);
        if (!user?.email) {
          setBans({ banForum: false, banFriends: false, banMatch: false });
          setLoading(false);
          return;
        }
        const bannedRecords = await base44.entities.BannedUser.filter({ email: user.email.toLowerCase() }).catch(() => []);
        if (bannedRecords.length > 0) {
          setBans(bannedRecords[0]);
        } else {
          setBans({ banForum: false, banFriends: false, banMatch: false });
        }
      } catch {
        setBans({ banForum: false, banFriends: false, banMatch: false });
      } finally {
        setLoading(false);
      }
    };
    check();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // If fully banned from everything, maybe show full screen (optional, but let's just use granular)
  if (bans?.banForum && bans?.banFriends && bans?.banMatch && !bans.reason?.includes("granular")) {
     // Optional: If they are fully banned and not just granular, block app? Let's just let them use AI.
  }

  return (
    <BanContext.Provider value={bans}>
      {children}
    </BanContext.Provider>
  );
}