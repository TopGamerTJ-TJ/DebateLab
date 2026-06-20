import { Link } from "react-router-dom";
import { Zap, Sparkles, Target, Brain, Trophy, FileText, Globe, Columns, Archive, CheckCircle, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Sparkles, label: "AI Contentions", desc: "Generate tournament-ready arguments with evidence, rebuttals, and crossfire prep.", color: "text-blue-400" },
  { icon: Target, label: "Practice Rounds", desc: "Simulate full rounds against an AI judge and get detailed round-by-round feedback.", color: "text-green-400" },
  { icon: Brain, label: "AI Coach", desc: "Personalized coaching to identify weaknesses and track your improvement over time.", color: "text-violet-400" },
  { icon: Trophy, label: "Tournament Tracker", desc: "Log results, track wins and losses, and analyze performance across tournaments.", color: "text-amber-400" },
  { icon: Globe, label: "Model UN Tools", desc: "Position papers, draft resolutions, and country profiles — all AI-assisted.", color: "text-teal-400" },
  { icon: FileText, label: "Model Congress", desc: "Bill writing, speech drafting, and legislative strategy for Model Congress.", color: "text-pink-400" },
  { icon: Columns, label: "Digital Flow Sheet", desc: "Track arguments in real time with a structured flow sheet for any format.", color: "text-cyan-400" },
  { icon: Archive, label: "Evidence Locker", desc: "Find, save, and organize evidence by topic with AI research assistance.", color: "text-orange-400" },
];

const formats = [
  { name: "Parliamentary", tag: "Parli" },
  { name: "Public Forum", tag: "PF" },
  { name: "Model UN", tag: "MUN" },
  { name: "Model Congress", tag: "Congress" },
];

export default function LandingPreview() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-body">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg font-heading tracking-tight">DebateLab</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 font-semibold">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-semibold px-4 py-2 rounded-full mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Competitive Debate Platform
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold font-heading leading-[1.1] mb-6 tracking-tight">
          Your debate prep,{" "}
          <span className="text-blue-400">supercharged.</span>
        </h1>

        <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          Generate contentions, practice rounds, coach feedback, and research tools — 
          built for Parliamentary, Public Forum, Model UN, and Model Congress debaters.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap mb-10">
          <Link to="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 h-13 px-8 text-base font-semibold shadow-xl shadow-blue-600/25 gap-2">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="h-13 px-8 text-base border-white/15 text-white hover:bg-white/10 hover:border-white/25">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm text-white/35 flex-wrap">
          {["No credit card required", "All major debate formats", "AI-powered tools"].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />{t}
            </span>
          ))}
        </div>
      </div>

      {/* Format pills */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {formats.map(f => (
            <div key={f.name} className="flex items-center gap-2 bg-white/6 border border-white/10 rounded-full px-5 py-2.5 text-sm font-medium text-white/80">
              <span className="w-5 h-5 bg-blue-600/80 rounded-full flex items-center justify-center text-[9px] font-bold text-white">{f.tag[0]}</span>
              {f.name}
            </div>
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold font-heading text-center text-white mb-2">Everything you need to compete</h2>
        <p className="text-white/40 text-center mb-10 text-sm">One platform for every stage of debate preparation</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="bg-white/4 border border-white/8 rounded-2xl p-5 hover:bg-white/7 hover:border-white/14 transition-all group">
              <Icon className={`w-6 h-6 mb-3 ${color}`} />
              <div className="font-semibold text-white text-sm mb-1.5">{label}</div>
              <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA banner */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 text-center shadow-2xl shadow-blue-600/20">
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-800/30 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl font-bold font-heading mb-3">Ready to win more debates?</h2>
            <p className="text-blue-100/80 mb-8 text-base max-w-lg mx-auto">Join debaters using DebateLab to prepare smarter, argue sharper, and walk into every round with confidence.</p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 px-10 h-12 text-base font-bold gap-2 shadow-xl">
                Create Free Account <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/8 py-8 px-6 text-center text-xs text-white/25 space-x-5">
        <Link to="/terms" className="hover:text-white/50 transition-colors">Terms of Service</Link>
        <Link to="/terms" className="hover:text-white/50 transition-colors">Privacy Policy</Link>
        <a href="mailto:DebateLab@outlook.com" className="hover:text-white/50 transition-colors">DebateLab@outlook.com</a>
        <span>© 2026 DebateLab</span>
      </div>
    </div>
  );
}