import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Save, Target, BookOpen, Trophy, Brain, Settings, CheckCircle, Shield } from "lucide-react";
import AdminPanel from "@/components/AdminPanel";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

const FORMATS = ["Parliamentary Debate", "Public Forum", "Model UN", "Model Congress"];
const LEVELS = ["beginner", "intermediate", "advanced", "expert"];
const GRADES = ["6th Grade", "7th Grade", "8th Grade", "9th Grade", "10th Grade", "11th Grade", "12th Grade", "Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

export default function ProfilePage() {
  const [form, setForm] = useState({ displayName: "", school: "", gradeLevel: "", preferredFormat: "", skillLevel: "intermediate", bio: "" });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({ queryKey: ['user_profiles'], queryFn: () => base44.entities.UserProfile.list() });
  const { data: sessions = [] } = useQuery({ queryKey: ['practice_sessions'], queryFn: () => base44.entities.PracticeSession.list('-created_date', 100) });
  const { data: contentions = [] } = useQuery({ queryKey: ['contentions'], queryFn: () => base44.entities.Contention.list() });
  const { data: tournaments = [] } = useQuery({ queryKey: ['tournaments'], queryFn: () => base44.entities.Tournament.list() });

  const profile = profiles[0];

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || "",
        school: profile.school || "",
        gradeLevel: profile.gradeLevel || "",
        preferredFormat: profile.preferredFormat || "",
        skillLevel: profile.skillLevel || "intermediate",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: (data) => profile ? base44.entities.UserProfile.update(profile.id, data) : base44.entities.UserProfile.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_profiles'] });
      setSaved(true);
      toast({ title: "Profile saved!" });
      setTimeout(() => setSaved(false), 2000);
    }
  });

  const wins = sessions.filter(s => s.winner === 'user').length;
  const losses = sessions.filter(s => s.winner === 'ai').length;
  const winRate = sessions.length > 0 ? Math.round((wins / sessions.length) * 100) : 0;

  const levelColors = { beginner: "bg-green-100 text-green-700", intermediate: "bg-blue-100 text-blue-700", advanced: "bg-purple-100 text-purple-700", expert: "bg-red-100 text-red-600" };
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-3xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">{form.displayName || "Your Profile"}</h1>
            <p className="text-slate-300">{form.school || "No school set"} {form.gradeLevel ? `· ${form.gradeLevel}` : ""}</p>
            {form.skillLevel && <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 inline-block capitalize ${levelColors[form.skillLevel] || 'bg-slate-100 text-slate-700'}`}>{form.skillLevel}</span>}
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
        <button onClick={() => setActiveTab("profile")} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === "profile" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <User className="w-3.5 h-3.5" /> Profile
        </button>
        {isAdmin && (
          <button onClick={() => setActiveTab("admin")} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === "admin" ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            <Shield className="w-3.5 h-3.5" /> Admin Panel
          </button>
        )}
      </div>

      {activeTab === "admin" && isAdmin && <AdminPanel />}

      {activeTab === "profile" && <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Settings className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-slate-900 font-heading">Profile Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Display Name</label>
                  <Input value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} placeholder="Your name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">School / Program</label>
                  <Input value={form.school} onChange={e => setForm({ ...form, school: e.target.value })} placeholder="School or debate program" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Grade / Year</label>
                  <Select value={form.gradeLevel} onValueChange={v => setForm({ ...form, gradeLevel: v })}>
                    <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                    <SelectContent>{GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Skill Level</label>
                  <Select value={form.skillLevel} onValueChange={v => setForm({ ...form, skillLevel: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{LEVELS.map(l => <SelectItem key={l} value={l} className="capitalize">{l.charAt(0).toUpperCase() + l.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Preferred Format</label>
                <Select value={form.preferredFormat} onValueChange={v => setForm({ ...form, preferredFormat: v })}>
                  <SelectTrigger><SelectValue placeholder="Select your main format" /></SelectTrigger>
                  <SelectContent>{FORMATS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Bio / Goals</label>
                <Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Your debate goals, experience, or anything you'd like to note..." rows={3} className="resize-none text-sm" />
              </div>
              <Button onClick={() => save.mutate(form)} disabled={save.isPending} className="w-full gap-2">
                {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? "Saved!" : "Save Profile"}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 font-heading text-sm mb-4">Your Stats</h3>
            <div className="space-y-3">
              {[
                { icon: Target, label: "Practice Sessions", value: sessions.length, color: "text-blue-600" },
                { icon: BookOpen, label: "Contentions Saved", value: contentions.length, color: "text-indigo-600" },
                { icon: Trophy, label: "Tournaments", value: tournaments.length, color: "text-amber-600" },
                { icon: Brain, label: "Win Rate", value: `${winRate}%`, color: wins >= losses ? "text-green-600" : "text-red-500" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-sm text-slate-600">{label}</span>
                  </div>
                  <span className={`font-bold font-heading ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
            <h3 className="font-bold text-slate-900 font-heading text-sm mb-3">Quick Links</h3>
            <div className="space-y-2">
              {[
                ["/practice", "Start Practice Round"],
                ["/ai-coach", "AI Performance Coach"],
                ["/evidence-locker", "Evidence Locker"],
                ["/case-vault", "Case Vault"],
                ["/wiki", "Debate Wiki"],
              ].map(([to, label]) => (
                <Link key={to} to={to} className="flex items-center justify-between text-sm text-primary hover:text-blue-700 hover:underline py-1">
                  {label} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}