import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Ban, Bell, Trash2, Send, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AdminPanel() {
  const [tab, setTab] = useState("bans");
  const [banEmail, setBanEmail] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banOptions, setBanOptions] = useState({ forum: true, friends: true, match: true });
  
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [notifType, setNotifType] = useState("info");
  const [notifTarget, setNotifTarget] = useState("all");
  const [notifGroup, setNotifGroup] = useState("");
  const [sendPush, setSendPush] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: banned = [] } = useQuery({
    queryKey: ['banned_users'],
    queryFn: () => base44.entities.BannedUser.list('-created_date'),
  });
  const { data: notifications = [] } = useQuery({
    queryKey: ['platform_notifications'],
    queryFn: () => base44.entities.PlatformNotification.list('-created_date'),
  });
  const { data: contactRequests = [] } = useQuery({
    queryKey: ['contact_requests'],
    queryFn: () => base44.entities.ContactRequest.list('-created_date'),
  });

  const addBan = useMutation({
    mutationFn: () => base44.entities.BannedUser.create({ 
      email: banEmail.trim().toLowerCase(), 
      reason: banReason,
      banForum: banOptions.forum,
      banFriends: banOptions.friends,
      banMatch: banOptions.match
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banned_users'] });
      toast({ title: `${banEmail} has been banned` });
      setBanEmail(""); setBanReason("");
      setBanOptions({ forum: true, friends: true, match: true });
    }
  });

  const removeBan = useMutation({
    mutationFn: (id) => base44.entities.BannedUser.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['banned_users'] }); toast({ title: "Ban removed" }); }
  });

  const sendNotif = useMutation({
    mutationFn: () => base44.entities.PlatformNotification.create({ 
      title: notifTitle, 
      message: notifMsg, 
      type: notifType, 
      isActive: true,
      targetAudience: notifTarget,
      targetGroup: notifGroup,
      sendPushNotification: sendPush
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform_notifications'] });
      toast({ title: sendPush ? "Push Notification Sent!" : "Notification sent!" });
      setNotifTitle(""); setNotifMsg(""); setSendPush(false); setNotifTarget("all"); setNotifGroup("");
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

  const markRead = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ContactRequest.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contact_requests'] })
  });

  const deleteContact = useMutation({
    mutationFn: (id) => base44.entities.ContactRequest.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contact_requests'] })
  });

  const newContacts = contactRequests.filter(c => c.status === "new").length;

  const tabs = [
    { id: "bans", icon: Ban, label: `Bans (${banned.length})` },
    { id: "notify", icon: Bell, label: "Notifications" },
    { id: "contacts", icon: Mail, label: `Contact Requests${newContacts > 0 ? ` (${newContacts} new)` : ""}` },
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

      <div className="flex border-b border-slate-100 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-all whitespace-nowrap ${tab === t.id ? "border-b-2 border-red-500 text-red-600" : "text-slate-500 hover:text-slate-700"}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === "bans" && (
          <div className="space-y-4">
            <div className="space-y-3">
              <Input value={banEmail} onChange={e => setBanEmail(e.target.value)} placeholder="Email address to ban" type="email" />
              <Input value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Reason (optional)" />
              <div className="flex items-center gap-4 text-sm px-1 py-1">
                <label className="flex items-center gap-1.5"><input type="checkbox" checked={banOptions.forum} onChange={e=>setBanOptions({...banOptions, forum: e.target.checked})} /> Forum</label>
                <label className="flex items-center gap-1.5"><input type="checkbox" checked={banOptions.friends} onChange={e=>setBanOptions({...banOptions, friends: e.target.checked})} /> Friends</label>
                <label className="flex items-center gap-1.5"><input type="checkbox" checked={banOptions.match} onChange={e=>setBanOptions({...banOptions, match: e.target.checked})} /> Live Match</label>
              </div>
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
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                         {[b.banForum && 'Forum', b.banFriends && 'Friends', b.banMatch && 'Match'].filter(Boolean).join(', ')} Restricted
                      </div>
                      {b.reason && <div className="text-xs text-slate-500 mt-0.5">{b.reason}</div>}
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
              <div className="grid grid-cols-2 gap-2">
                <Select value={notifType} onValueChange={setNotifType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">ℹ️ Info</SelectItem>
                    <SelectItem value="success">✅ Success</SelectItem>
                    <SelectItem value="warning">⚠️ Warning</SelectItem>
                    <SelectItem value="alert">🚨 Alert</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={notifTarget} onValueChange={setNotifTarget}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="select">Select Users</SelectItem>
                    <SelectItem value="group">User Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {notifTarget === "group" && (
                <Input value={notifGroup} onChange={e => setNotifGroup(e.target.value)} placeholder="e.g. parliamentary_debater, intermediate..." />
              )}
              {notifTarget === "select" && (
                <Input value={notifGroup} onChange={e => setNotifGroup(e.target.value)} placeholder="Comma separated emails..." />
              )}
              <label className="flex items-center gap-2 text-sm text-slate-700 py-1">
                <input type="checkbox" checked={sendPush} onChange={e => setSendPush(e.target.checked)} className="rounded" />
                Send Push Notification on Mobile App
              </label>
              <Button onClick={() => sendNotif.mutate()} disabled={!notifTitle || !notifMsg || sendNotif.isPending} className="w-full gap-2">
                <Send className="w-4 h-4" /> Send Notification
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

        {tab === "contacts" && (
          <div className="space-y-3">
            {contactRequests.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">No contact requests yet.</p>
            ) : contactRequests.map(c => (
              <div key={c.id} className={`rounded-xl border p-4 ${c.status === "new" ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{c.subject}</span>
                      {c.status === "new" && <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">NEW</span>}
                      {c.status === "resolved" && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                    </div>
                    <span className="text-xs text-slate-500">{c.email}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {c.status !== "resolved" && (
                      <button onClick={() => markRead.mutate({ id: c.id, status: "resolved" })}
                        className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full hover:bg-green-200 transition-colors">
                        Resolve
                      </button>
                    )}
                    <button onClick={() => deleteContact.mutate(c.id)} className="p-1 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{c.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}