import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Lock, AlertTriangle } from "lucide-react";

const SESSION_KEY = "dl_access_code";

export default function AccessCodeGate({ children }) {
  const [status, setStatus] = useState("loading"); // loading | checking | code_required | banned | granted
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const getCorrectCode = async () => {
    try {
      const settings = await base44.entities.AppSettings.filter({ key: "access_code" });
      return settings[0]?.value || null;
    } catch {
      return null;
    }
  };

  const checkBanned = async (email) => {
    if (!email) return false;
    try {
      const results = await base44.entities.BannedUser.filter({ email: email.toLowerCase() });
      return results.length > 0;
    } catch {
      return false;
    }
  };

  const checkAccess = async () => {
    setStatus("loading");
    const correctCode = await getCorrectCode();
    const storedCode = sessionStorage.getItem(SESSION_KEY);

    if (!correctCode || storedCode === correctCode) {
      // Code still valid — also check if user is banned
      const user = await base44.auth.me().catch(() => null);
      if (user) {
        const banned = await checkBanned(user.email);
        if (banned) { setStatus("banned"); return; }
      }
      setStatus("granted");
    } else {
      sessionStorage.removeItem(SESSION_KEY);
      setStatus("code_required");
    }
  };

  const verify = async () => {
    if (!input.trim()) return;
    setVerifying(true);
    setError("");
    const correctCode = await getCorrectCode();
    if (correctCode && input.trim() === correctCode) {
      // Check if banned before granting
      const user = await base44.auth.me().catch(() => null);
      if (user) {
        const banned = await checkBanned(user.email);
        if (banned) { setStatus("banned"); setVerifying(false); return; }
      }
      sessionStorage.setItem(SESSION_KEY, correctCode);
      setStatus("granted");
    } else {
      setError("Incorrect code. Please try again.");
    }
    setVerifying(false);
  };

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
          <p className="text-slate-500 text-sm">Your account has been suspended from DebateLab. Please contact an administrator if you believe this is an error.</p>
          <Button variant="outline" className="mt-6 w-full" onClick={() => base44.auth.logout()}>Sign Out</Button>
        </div>
      </div>
    );
  }

  if (status === "code_required") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950 p-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white font-heading">DebateLab</h1>
            <p className="text-slate-400 text-sm mt-1">Enter your access code to continue</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-blue-300" />
              <span className="text-white text-sm font-medium">Access Code Required</span>
            </div>
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && verify()}
              placeholder="Enter access code"
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 font-mono text-center text-lg tracking-widest mb-3"
              autoFocus
            />
            {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}
            <Button onClick={verify} disabled={verifying || !input.trim()} className="w-full bg-blue-600 hover:bg-blue-700 h-11 font-semibold">
              {verifying ? "Verifying..." : "Enter Platform →"}
            </Button>
          </div>
          <p className="text-center text-slate-500 text-xs mt-4">Contact DebateLab@Outlook.com for the access code.</p>
        </div>
      </div>
    );
  }

  return children;
}