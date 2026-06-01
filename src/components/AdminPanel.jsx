import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Ban, Bell, Key, Trash2, Plus, Send, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AdminPanel() {
  const [tab, setTab] = useState("code");
  const [newCode, setNewCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [banEmail, setBanEmail] = useState("");
  const [banReason, setBanReason] = useState("");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [notifType, setNotifType] = useState("info");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: codeSettings = [] } = useQuery({
    queryKey: ['app_settings', 'access_code'],
    queryFn: () => base44.entities.AppSettings.filter({ key: "access_code" }),
  });
  const { data: banned = [] } = useQuery({
    queryKey: ['banned_users'],
    queryFn: () => base44.entities.BannedUser.list('-created_date'),
  });
  const { data: notifications = [] } = useQuery({
    queryKey: ['platform_notifications'],
    queryFn: () => base44.entities.PlatformNotification.list('-created_date'),
  });

  const currentCode = codeSettings[0];

  const updateCode = useMutation({
    mutationFn: async (code) => {
      if (currentCode) return base44.entities.AppSettings.update(currentCode.id, { value: code });
      return base44.entities.AppSettings.create({ key: "access_code", value: code });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app_settings'] });
      toast({ title: "Access code updated!" });
      setNewCode("");
    }
  });

  const addBan = useMutation({
    mutationFn: () => base44.entities.BannedUser.create({ email: banEmail.trim().toLowerCase(), reason: banReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banned_users'] });
      toast({ title: `${banEmail} has been banned` });
      setBanEmail(""); setBanReason("");
    }
  });

  const removeBan = useMutation({
    mutationFn: (id) => base44.entities.BannedUser.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['banned_users'] }); toast({ title: "Ban removed" }); }
  });

  const sendNotif = useMutation({
    mutationFn: () => base44.entities.PlatformNotification.create({ title: notifTitle, message: notifMsg, type: notifType, isActive: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform_notifications'] });
      toast({ title: "Notification sent to all users!" });
      setNotifTitle(""); setNotifMsg("");
    }
  });

  const toggleNotif = useMutation({
    mutationFn: ({ id, val }) => base44.entities.PlatformNotification.update(id, { isActive: val }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platform_notifications'] })
  });

  const deleteNotif = useMutation({
    mutationFn: (id) => base44.entities.PlatformNotification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platform_notifications'] })
  });

  const tabs = [
    { id: "code", icon: Key, label: "Access Code" },
    { id: "bans", icon: Ban, label: `Bans (${banned.length})` },
    { id: "notify", icon: Bell, label: "Notifications" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-red-600 to-rose-600 p-5 text-white flex items-center gap-3">
        <Shield className="w-5 h-5" />
        <div>
          <h3 className="font-bold font-heading">Admin Panel</h3>
          <p className="text-red-100 text-xs">Platform management tools</p>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex border-b border-slate-100">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-all ${tab === t.id ? "border-b-2 border-red-500 text-red-600" : "text-slate-500 hover:text-slate-700"}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === "code" && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-3">The access code is required for anyone to use DebateLab — even after logging in. Change it here to immediately lock out all sessions.</p>
              <div className="bg-slate-50 rounded-xl p-4 mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Current code</div>
                  <div className="font-mono font-bold text-lg text-slate-900">
                    {showCode ? (currentCode?.value || "001122") : "••••••"}
                  </div>
                </div>
                <button onClick={() => setShowCode(!showCode)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                  {showCode ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Input value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="New alphanumeric code (e.g. AB1234)" className="font-mono" maxLength={20} />
              <Button onClick={() => updateCode.mutate(newCode)} disabled={!newCode.trim() || updateCode.isPending} className="bg-red-600 hover:bg-red-700 shrink-0">
                Update
              </Button>
            </div>
            <p className="text-xs text-slate-400">Changing the code logs out all current sessions immediately.</p>
          </div>
        )}

        {tab === "bans" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Input value={banEmail} onChange={e => setBanEmail(e.target.value)} placeholder="Email address to ban" type="email" />
              <Input value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Reason (optional)" />
              <Button onClick={() => addBan.mutate()} disabled={!banEmail.trim() || addBan.isPending} className="w-full bg-red-600 hover:bg-red-700 gap-2">
                <Ban className="w-4 h-4" /> Ban User
              </Button>
            </div>
            {banned.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-4">No banned users.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {banned.map(b => (
                  <div key={b.id} className="flex items-center justify-between bg-red-50 rounded-xl px-3 py-2.5">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{b.email}</div>
                      {b.reason && <div className="text-xs text-slate-500">{b.reason}</div>}
                    </div>
                    <button onClick={() => removeBan.mutate(b.id)} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors text-red-400 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "notify" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Input value={notifTitle} onChange={e => setNotifTitle(e.target.value)} placeholder="Notification title" />
              <Textarea value={notifMsg} onChange={e => setNotifMsg(e.target.value)} placeholder="Message to all users..." rows={3} className="resize-none text-sm" />
              <Select value={notifType} onValueChange={setNotifType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">ℹ️ Info</SelectItem>
                  <SelectItem value="success">✅ Success</SelectItem>
                  <SelectItem value="warning">⚠️ Warning</SelectItem>
                  <SelectItem value="alert">🚨 Alert</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => sendNotif.mutate()} disabled={!notifTitle || !notifMsg || sendNotif.isPending} className="w-full gap-2">
                <Send className="w-4 h-4" /> Push Notification
              </Button>
            </div>
            {notifications.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <div className="text-xs font-medium text-slate-500 mb-1">Sent notifications</div>
                {notifications.map(n => (
                  <div key={n.id} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{n.title}</div>
                      <div className="text-xs text-slate-500 truncate">{n.message}</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toggleNotif.mutate({ id: n.id, val: !n.isActive })}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${n.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {n.isActive ? "Live" : "Off"}
                      </button>
                      <button onClick={() => deleteNotif.mutate(n.id)} className="p-1 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}