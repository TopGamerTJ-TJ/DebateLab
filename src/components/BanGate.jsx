import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function BanGate({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const check = async () => {
      try {
        const user = await base44.auth.me().catch(() => null);
        if (!user?.email) { setStatus("ok"); return; }
        const banned = await base44.entities.BannedUser.filter({ email: user.email.toLowerCase() }).catch(() => []);
        setStatus(banned.length > 0 ? "banned" : "ok");
      } catch {
        setStatus("ok");
      }
    };
    check();
  }, []);

  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "banned") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-sm w-full bg-white rounded-3xl border border-red-200 shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-heading mb-2">Account Suspended</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your account has been suspended from DebateLab. Contact{" "}
            <a href="mailto:DebateLab@outlook.com" className="text-primary hover:underline">DebateLab@outlook.com</a>{" "}
            if you believe this is an error.
          </p>
          <Button variant="outline" className="mt-6 w-full" onClick={() => base44.auth.logout()}>Sign Out</Button>
        </div>
      </div>
    );
  }

  return children;
}