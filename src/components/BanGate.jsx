import React, { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle } from "lucide-react";

const BanContext = createContext(null);

export function useBans() {
  return useContext(BanContext) || { banPlatform: false, banForum: false, banFriends: false, banMatch: false };
}

export default function BanGate({ children }) {
  const [bans, setBans] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const user = await base44.auth.me().catch(() => null);
        if (!user?.email) {
          setBans({ banPlatform: false, banForum: false, banFriends: false, banMatch: false });
          setLoading(false);
          return;
        }
        const bannedRecords = await base44.entities.BannedUser.filter({ email: user.email.toLowerCase() }).catch(() => []);
        if (bannedRecords.length > 0) {
          setBans({
            banPlatform: bannedRecords.some(b => b.banPlatform),
            banForum: bannedRecords.some(b => b.banForum),
            banFriends: bannedRecords.some(b => b.banFriends),
            banMatch: bannedRecords.some(b => b.banMatch),
            reason: bannedRecords.find(b => b.reason)?.reason || ""
          });
        } else {
          setBans({ banPlatform: false, banForum: false, banFriends: false, banMatch: false });
        }
      } catch {
        setBans({ banPlatform: false, banForum: false, banFriends: false, banMatch: false });
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

  if (bans?.banPlatform) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 px-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-white/10 p-8 text-center shadow-2xl backdrop-blur">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 text-red-200">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="font-heading text-2xl font-bold">Account Banned</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Your account has been banned from DebateLab.
          </p>
          {bans.reason && (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-left">
              <div className="text-xs font-semibold uppercase tracking-wide text-red-200">Reason</div>
              <p className="mt-1 text-sm text-white">{bans.reason}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <BanContext.Provider value={bans}>
      {children}
    </BanContext.Provider>
  );
}