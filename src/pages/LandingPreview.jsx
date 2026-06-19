import { Link } from "react-router-dom";
import { BookOpen, Globe, FileText, Trophy, Brain, Target, Layers, Archive, Columns, Sparkles, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: <Sparkles className="w-5 h-5 text-blue-600" />, title: "AI Contention Generator", desc: "Generate tournament-ready contentions with evidence, rebuttals, and crossfire prep for any resolution.", color: "bg-blue-50" },
  { icon: <Target className="w-5 h-5 text-green-600" />, title: "Practice Rounds", desc: "Simulate full debate rounds against an AI opponent and receive detailed judge feedback.", color: "bg-green-50" },
  { icon: <Brain className="w-5 h-5 text-violet-600" />, title: "AI Coach", desc: "Get personalized coaching, identify weaknesses, and track improvement over time.", color: "bg-violet-50" },
  { icon: <Globe className="w-5 h-5 text-teal-600" />, title: "Model UN Tools", desc: "Position papers, draft resolutions, country profiles, and committee prep — all AI-assisted.", color: "bg-teal-50" },
  { icon: <FileText className="w-5 h-5 text-purple-600" />, title: "Model Congress", desc: "Bill writing, speech drafting, and legislative strategy for Model Congress competitions.", color: "bg-purple-50" },
  { icon: <Columns className="w-5 h-5 text-cyan-600" />, title: "Digital Flow Sheet", desc: "Track arguments in real time with a structured flow sheet for any debate format.", color: "bg-cyan-50" },
  { icon: <Archive className="w-5 h-5 text-amber-600" />, title: "Evidence Locker", desc: "AI-powered research assistant to find, save, and organize evidence by topic.", color: "bg-amber-50" },
  { icon: <Trophy className="w-5 h-5 text-yellow-600" />, title: "Tournament Manager", desc: "Log results, track wins/losses, and analyze performance across tournaments.", color: "bg-yellow-50" },
];

const formats = [
  { name: "Parliamentary", desc: "British & American Parli formats with government/opposition roles and POIs" },
  { name: "Public Forum", desc: "NSDA PF with crossfire, weighing mechanisms, and summary/final focus strategy" },
  { name: "Model UN", desc: "Position papers, draft resolutions, bloc strategy, and moderated/unmod caucuses" },
  { name: "Model Congress", desc: "Bill drafting, authorship speeches, and floor debate strategy" },
];

export default function LandingPreview() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg font-heading">DebateLab</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Log In</Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Sign Up Free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-blue-100">
          <Sparkles className="w-3.5 h-3.5" /> AI-Powered Competitive Debate Platform
        </div>
        <h1 className="text-5xl font-bold text-slate-900 font-heading leading-tight mb-5">
          Win more debates.<br />
          <span className="text-blue-600">Prepare smarter.</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
          DebateLab is the complete preparation platform for Parliamentary, Public Forum, Model UN, and Model Congress. Generate contentions, practice rounds, and get AI coaching — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 h-12 text-base font-semibold">
              Get Started Free →
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="px-8 h-12 text-base">
              Log In
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-400">
          {["No credit card required", "All debate formats", "AI-powered"].map(t => (
            <span key={t} className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" />{t}</span>
          ))}
        </div>
      </div>

      {/* Formats */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-slate-900 font-heading text-center mb-8">Every format, fully covered</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {formats.map(f => (
            <div key={f.name} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="font-bold text-slate-900 mb-1.5 font-heading">{f.name}</div>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-slate-900 font-heading text-center mb-8">Everything you need to compete</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${f.color}`}>{f.icon}</div>
              <div className="font-semibold text-slate-900 text-sm mb-1">{f.title}</div>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl font-bold font-heading mb-3">Ready to level up your debate?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join debaters using DebateLab to prepare smarter and win more rounds.</p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 px-10 h-12 text-base font-semibold">
              Create Free Account →
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 py-8 px-6 text-center text-xs text-slate-400 space-x-4">
        <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
        <Link to="/terms" className="hover:text-primary transition-colors">Privacy Policy</Link>
        <a href="mailto:DebateLab@outlook.com" className="hover:text-primary transition-colors">DebateLab@outlook.com</a>
        <span>© 2025 DebateLab</span>
      </div>
    </div>
  );
}