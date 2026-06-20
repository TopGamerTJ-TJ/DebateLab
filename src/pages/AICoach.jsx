import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Brain, Target, TrendingUp, Award, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AICoach() {
  const { data: sessions = [] } = useQuery({ queryKey: ['practice_sessions'], queryFn: () => base44.entities.PracticeSession.list('-created_date', 100) });
  const { data: contentions = [] } = useQuery({ queryKey: ['contentions'], queryFn: () => base44.entities.Contention.list('-created_date', 100) });
  const { data: tournaments = [] } = useQuery({ queryKey: ['tournaments'], queryFn: () => base44.entities.Tournament.list('-created_date', 100) });

  const wins = sessions.filter(s => s.winner === 'user').length;
  const losses = sessions.filter(s => s.winner === 'ai').length;
  const winRate = sessions.length > 0 ? Math.round((wins / sessions.length) * 100) : 0;
  const avgSpeakerPts = sessions.length > 0
    ? Math.round(sessions.filter(s => s.speakerPoints).reduce((a, s) => a + (s.speakerPoints || 0), 0) / sessions.filter(s => s.speakerPoints).length) || 0
    : 0;

  // Format distribution
  const formatCounts = sessions.reduce((acc, s) => { acc[s.format] = (acc[s.format] || 0) + 1; return acc; }, {});
  const formatData = Object.entries(formatCounts).map(([name, value]) => ({ name: name.replace('_', ' '), value }));

  // Weekly sessions (last 8 weeks mock from data)
  const sessionsByDate = sessions.slice(-16).reduce((acc, s, i) => {
    const week = `W${Math.floor(i / 2) + 1}`;
    const existing = acc.find(a => a.week === week);
    if (existing) existing.sessions++;
    else acc.push({ week, sessions: 1, wins: s.winner === 'user' ? 1 : 0 });
    return acc;
  }, []);

  // Strength/weakness aggregation
  const allStrengths = sessions.flatMap(s => s.strengths || []);
  const allWeaknesses = sessions.flatMap(s => s.weaknesses || []);
  const topStrengths = [...new Set(allStrengths)].slice(0, 5);
  const topWeaknesses = [...new Set(allWeaknesses)].slice(0, 5);

  // Tournament win rate
  const tourneyWins = tournaments.reduce((a, t) => a + (t.wins || 0), 0);
  const tourneyLosses = tournaments.reduce((a, t) => a + (t.losses || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3 text-violet-200 text-sm"><Brain className="w-4 h-4" /> AI Performance Coach</div>
        <h1 className="text-3xl font-bold font-heading mb-2">AI Coach Dashboard</h1>
        <p className="text-violet-100 max-w-2xl">Track your progress, identify patterns in your performance, and get personalized training recommendations.</p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No practice data yet</h3>
          <p className="text-slate-500 mb-6">Complete practice rounds to see your performance analytics and get personalized coaching.</p>
          <Link to="/practice">
            <button className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto">
              <Target className="w-4 h-4" /> Start a Practice Round <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Practice Sessions", value: sessions.length, icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Win Rate", value: `${winRate}%`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
              { label: "Avg Speaker Points", value: avgSpeakerPts || "—", icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Tournament Win Rate", value: tourneyWins + tourneyLosses > 0 ? `${Math.round((tourneyWins / (tourneyWins + tourneyLosses)) * 100)}%` : "—", icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className={`text-3xl font-bold font-heading ${color}`}>{value}</div>
                <div className="text-sm text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Win/Loss by session */}
            {sessionsByDate.length > 0 && (
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 font-heading mb-4">Practice Session History</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={sessionsByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Sessions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Format distribution */}
            {formatData.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 font-heading mb-4">Format Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={formatData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 10 }}>
                      {formatData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Strengths and weaknesses */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 font-heading mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" /> Your Strengths
              </h3>
              {topStrengths.length === 0 ? (
                <p className="text-sm text-slate-400">Complete more practice rounds to identify your strengths.</p>
              ) : (
                <ul className="space-y-2">
                  {topStrengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700 bg-green-50 rounded-lg p-3">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 font-heading mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" /> Areas to Improve
              </h3>
              {topWeaknesses.length === 0 ? (
                <p className="text-sm text-slate-400">Complete more practice rounds to identify areas for improvement.</p>
              ) : (
                <ul className="space-y-2">
                  {topWeaknesses.map((w, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700 bg-amber-50 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />{w}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
            <h3 className="font-bold text-slate-900 font-heading mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" /> Personalized Recommendations
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { title: "Practice Crossfire", desc: "Drilling crossfire questions is the fastest way to gain speaker points.", to: "/practice" },
                { title: "Build More Contentions", desc: `You have ${contentions.length} contentions saved. Strong debaters keep 10+ per resolution.`, to: "/parliamentary" },
                { title: "Review Your Flows", desc: "Regularly reviewing past flows helps identify recurring clashes and improve strategy.", to: "/flowing-tool" },
              ].map(({ title, desc, to }) => (
                <Link key={title} to={to} className="bg-white rounded-xl p-4 border border-blue-100 hover:border-primary/30 hover:shadow-md transition-all group">
                  <h4 className="font-semibold text-slate-900 text-sm group-hover:text-primary transition-colors mb-1">{title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
                  <div className="text-xs text-primary font-medium mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Go <ArrowRight className="w-3 h-3" /></div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}