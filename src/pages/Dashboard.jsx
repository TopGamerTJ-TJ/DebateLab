import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { BookOpen, Globe, FileText, Trophy, Brain, BarChart2, Zap, ArrowRight, Target, Layers, Archive, Columns } from "lucide-react";
import TourModal from "@/components/TourModal";

const StatCard = ({ label, value, color }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
    <div className={`text-3xl font-bold ${color} font-heading`}>{value}</div>
    <div className="text-sm text-slate-500 mt-1">{label}</div>
  </div>
);

const QuickAction = ({ to, icon, title, desc, color }) => (
  <Link to={to} className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex gap-4 items-start">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <div className="font-semibold text-slate-900 text-sm group-hover:text-primary transition-colors">{title}</div>
      <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</div>
    </div>
    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors shrink-0 mt-1 ml-auto" />
  </Link>
);

export default function Dashboard() {
  const { user } = useAuth();
  const { data: sessions = [] } = useQuery({ queryKey: ['practice_sessions'], queryFn: () => base44.entities.PracticeSession.list('-created_date', 50) });
  const { data: contentions = [] } = useQuery({ queryKey: ['contentions'], queryFn: () => base44.entities.Contention.list('-created_date', 100) });
  const { data: tournaments = [] } = useQuery({ queryKey: ['tournaments'], queryFn: () => base44.entities.Tournament.list('-created_date', 100) });

  const wins = sessions.filter(s => s.winner === 'user').length;
  const losses = sessions.filter(s => s.winner === 'ai').length;
  const winRate = sessions.length > 0 ? Math.round((wins / sessions.length) * 100) : 0;

  const recentSessions = sessions.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TourModal />
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2 text-blue-200 text-sm font-medium">
          <Zap className="w-4 h-4" /> DebateLab
        </div>
        <h1 className="text-3xl font-bold font-heading mb-2">Welcome back, {user?.full_name?.split(" ")[0] || 'Debater'}.</h1>
        <p className="text-blue-100 max-w-xl">Your complete competitive debate preparation platform. Generate contentions, practice rounds, and manage tournaments — all powered by AI.</p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link to="/parliamentary" className="bg-white text-blue-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors">
            Parliamentary Debate →
          </Link>
          <Link to="/public-forum" className="bg-blue-500/50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-500/70 transition-colors">
            Public Forum →
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Practice Sessions" value={sessions.length} color="text-blue-600" />
        <StatCard label="Contentions Saved" value={contentions.length} color="text-blue-600" />
        <StatCard label="Tournaments" value={tournaments.length} color="text-blue-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 font-heading mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <QuickAction to="/parliamentary" icon={<BookOpen className="w-5 h-5 text-blue-600" />} title="Parliamentary Debate" desc="Generate contentions, practice rounds, and AI coaching" color="bg-blue-50" />
            <QuickAction to="/public-forum" icon={<BookOpen className="w-5 h-5 text-indigo-600" />} title="Public Forum" desc="PF resolution analysis, contentions, and crossfire prep" color="bg-indigo-50" />
            <QuickAction to="/model-un" icon={<Globe className="w-5 h-5 text-teal-600" />} title="Model UN" desc="Country research, position papers, and resolutions" color="bg-teal-50" />
            <QuickAction to="/model-congress" icon={<FileText className="w-5 h-5 text-purple-600" />} title="Model Congress" desc="Bill writing, committee prep, and speeches" color="bg-purple-50" />
            <QuickAction to="/evidence-locker" icon={<Archive className="w-5 h-5 text-amber-600" />} title="Evidence Locker" desc="Save and organize your research and evidence" color="bg-amber-50" />
            <QuickAction to="/case-vault" icon={<Layers className="w-5 h-5 text-rose-600" />} title="Case Vault" desc="Store and manage your complete debate cases" color="bg-rose-50" />
            <QuickAction to="/flowing-tool" icon={<Columns className="w-5 h-5 text-cyan-600" />} title="Flowing Tool" desc="Digital flow sheet for tracking arguments" color="bg-cyan-50" />
            <QuickAction to="/practice" icon={<Target className="w-5 h-5 text-green-600" />} title="Practice Round" desc="AI-powered debate simulation with judge feedback" color="bg-green-50" />
            <QuickAction to="/ai-coach" icon={<Brain className="w-5 h-5 text-violet-600" />} title="AI Coach" desc="Performance analytics and personalized recommendations" color="bg-violet-50" />
            <QuickAction to="/tournament" icon={<Trophy className="w-5 h-5 text-yellow-600" />} title="Tournament" desc="Manage tournaments, rounds, and results" color="bg-yellow-50" />
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading mb-4">Recent Practice</h2>
          <div className="space-y-3">
            {recentSessions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <Target className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No practice sessions yet.</p>
                <Link to="/practice" className="text-primary text-sm font-medium hover:underline mt-2 block">Start your first round →</Link>
              </div>
            ) : recentSessions.map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900 capitalize">{s.format?.replace('_', ' ')}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.winner === 'user' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {s.winner === 'user' ? 'Win' : 'Loss'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{s.resolution || 'Practice round'}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span className="capitalize">{s.side}</span>
                  <span>•</span>
                  <span className="capitalize">{s.difficulty}</span>
                  {s.speakerPoints && <><span>•</span><span>{s.speakerPoints} pts</span></>}
                </div>
              </div>
            ))}
          </div>

          {/* AI Coach tip */}
          <div className="mt-4 bg-blue-50 rounded-2xl border border-blue-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">AI Coach Tip</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">Practice crossfire by generating contentions and drilling the crossfire questions section. Strong crossfire wins rounds.</p>
            <Link to="/ai-coach" className="text-primary text-xs font-medium hover:underline mt-2 block">View full analysis →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}