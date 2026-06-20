import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap, Sparkles, Target, Brain, Trophy, FileText, Globe,
  Columns, Archive, CheckCircle, ArrowRight, ChevronRight,
  BookOpen, Users, BarChart3, MessageSquare, Mic, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_TABS = [
  { id: "home", label: "Home" },
  { id: "features", label: "Features" },
  { id: "formats", label: "Formats" },
  { id: "about", label: "About" },
];

const FEATURES = [
  { icon: Sparkles, label: "AI Contentions", desc: "Generate complete, tournament-ready arguments with claims, warrants, impacts, evidence, rebuttals, and crossfire prep for any resolution.", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { icon: Target, label: "Practice Rounds", desc: "Simulate full debate rounds against an AI opponent that argues back. Receive a detailed judge RFD with speaker points and improvement tips.", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  { icon: Brain, label: "AI Coach", desc: "Get personalized performance coaching after every session. Identify your weaknesses, track trends, and get a custom prep plan.", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { icon: Globe, label: "Model UN Tools", desc: "AI-assisted position papers, draft resolutions, working papers, country profiles, and committee prep for NMUN and THIMUN standards.", color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20" },
  { icon: FileText, label: "Model Congress", desc: "Craft compelling bills, authorship speeches, and floor debate strategy tailored to your chamber and policy area.", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
  { icon: Columns, label: "Digital Flow Sheet", desc: "Track arguments in real time with a structured flow sheet. Color-coded by speaker, exportable, and built for every format.", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { icon: Archive, label: "Evidence Locker", desc: "AI-powered research assistant to find, summarize, and store evidence. Tag by topic and pull cards into any case in seconds.", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  { icon: Trophy, label: "Tournament Tracker", desc: "Log every tournament, track wins/losses, speaker points, and get a season-wide performance summary.", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
];

const FORMATS = [
  {
    name: "Parliamentary",
    tag: "Parli",
    desc: "Full support for British Parliamentary, American Parliamentary, and MSPDP formats with government/opposition roles, POIs, and prep time management.",
    tools: ["AI Contentions", "Practice Rounds", "Flow Sheet", "Case Vault"],
    color: "from-blue-600/20 to-blue-600/5 border-blue-500/30",
    dot: "bg-blue-500",
  },
  {
    name: "Public Forum",
    tag: "PF",
    desc: "NSDA Public Forum with crossfire prep, weighing mechanisms, summary/final focus strategy, and evidence pairing for both sides.",
    tools: ["Contentions", "Crossfire Prep", "Evidence", "Flow Sheet"],
    color: "from-violet-600/20 to-violet-600/5 border-violet-500/30",
    dot: "bg-violet-500",
  },
  {
    name: "Model UN",
    tag: "MUN",
    desc: "Complete MUN toolkit — position papers, draft resolutions, working papers, bloc strategy memos, and speech scripts for any committee.",
    tools: ["Position Papers", "Resolutions", "Country Profiles", "Speeches"],
    color: "from-teal-600/20 to-teal-600/5 border-teal-500/30",
    dot: "bg-teal-500",
  },
  {
    name: "Model Congress",
    tag: "Congress",
    desc: "Draft bills and resolutions, write authorship and floor debate speeches, and prepare legislative strategy for any Model Congress chamber.",
    tools: ["Bill Drafting", "Speeches", "Floor Strategy", "Committee Prep"],
    color: "from-amber-600/20 to-amber-600/5 border-amber-500/30",
    dot: "bg-amber-500",
  },
];

const STATS = [
  { value: "10+", label: "Debate tools" },
  { value: "4", label: "Formats supported" },
  { value: "AI", label: "Powered coaching" },
  { value: "Free", label: "To get started" },
];

export default function LandingPreview() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-body">
      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur border-b border-white/8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-base font-heading tracking-tight">DebateLab</span>
          </div>

          {/* Center tabs */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 text-sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 font-semibold text-sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HOME TAB ── */}
      {(activeTab === "home" || activeTab === "about") && (
        <>
          {/* Hero */}
          <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-semibold px-4 py-2 rounded-full mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Competitive Debate Platform
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold font-heading leading-[1.08] mb-6 tracking-tight">
              Your debate prep,{" "}
              <span className="text-blue-400">supercharged.</span>
            </h1>

            <p className="text-lg text-white/45 max-w-2xl mx-auto mb-10 leading-relaxed">
              Generate contentions, simulate practice rounds, get AI coaching, and manage your entire competitive season — all in one place for Parliamentary, PF, MUN, and Congress.
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap mb-12">
              <Link to="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 h-12 px-8 text-base font-semibold shadow-xl shadow-blue-600/25 gap-2">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base border-white/15 text-white bg-transparent hover:bg-white/8 hover:border-white/25">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Trust row */}
            <div className="flex items-center justify-center gap-6 text-sm text-white/30 flex-wrap">
              {["No credit card required", "All major debate formats", "AI-powered tools"].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500/70" />{t}
                </span>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="max-w-3xl mx-auto px-6 pb-20">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STATS.map(s => (
                <div key={s.label} className="bg-white/4 border border-white/8 rounded-2xl p-5 text-center">
                  <div className="text-3xl font-bold text-white font-heading mb-1">{s.value}</div>
                  <div className="text-xs text-white/40">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature trio cards */}
          <div className="max-w-5xl mx-auto px-6 pb-20">
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: Sparkles, label: "AI Contentions", desc: "Generate complete tournament-ready arguments for any resolution in seconds.", color: "text-blue-400" },
                { icon: Target, label: "Practice Rounds", desc: "Debate against an AI opponent and receive a full judge decision and feedback.", color: "text-green-400" },
                { icon: Brain, label: "AI Coach", desc: "Personalized coaching to find your weaknesses and sharpen your strengths.", color: "text-violet-400" },
              ].map(({ icon: Icon, label, desc, color }) => (
                <div key={label} className="bg-white/4 border border-white/8 rounded-2xl p-6 hover:bg-white/6 transition-all">
                  <Icon className={`w-7 h-7 mb-4 ${color}`} />
                  <div className="font-bold text-white text-base mb-2 font-heading">{label}</div>
                  <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {activeTab === "about" && (
            <div className="max-w-3xl mx-auto px-6 pb-20">
              <div className="bg-white/4 border border-white/8 rounded-3xl p-10 text-center">
                <Shield className="w-10 h-10 text-blue-400 mx-auto mb-5" />
                <h2 className="text-2xl font-bold font-heading mb-4">Built for serious debaters</h2>
                <p className="text-white/50 leading-relaxed mb-6">DebateLab was built by competitors for competitors. Every tool is designed around the real workflows of Parliamentary, Public Forum, Model UN, and Model Congress debaters — from first-round prep to final-round strategy.</p>
                <p className="text-white/40 text-sm leading-relaxed">Whether you're a first-year student or an experienced debater, DebateLab gives you the AI tools to prepare faster and argue smarter.</p>
                <div className="mt-8 pt-6 border-t border-white/8 text-xs text-white/25 space-x-4">
                  <Link to="/terms" className="hover:text-white/50 transition-colors">Terms of Service</Link>
                  <Link to="/terms" className="hover:text-white/50 transition-colors">Privacy Policy</Link>
                  <a href="mailto:DebateLab@outlook.com" className="hover:text-white/50 transition-colors">DebateLab@outlook.com</a>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── FEATURES TAB ── */}
      {activeTab === "features" && (
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-20">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold font-heading mb-4">Everything you need to compete</h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">One platform covering every stage of debate preparation — research, practice, coaching, and more.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, label, desc, color, bg }) => (
              <div key={label} className={`bg-white/4 border rounded-2xl p-5 hover:bg-white/6 transition-all`}>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="font-semibold text-white text-sm mb-2">{label}</div>
                <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 text-center shadow-2xl">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <h3 className="text-2xl font-bold font-heading mb-3">Ready to level up?</h3>
              <p className="text-blue-100/70 mb-6 text-sm">Create your free account and start preparing smarter today.</p>
              <Link to="/register">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold gap-2 px-8">
                  Get Started Free <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── FORMATS TAB ── */}
      {activeTab === "formats" && (
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-20">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold font-heading mb-4">Every format, fully covered</h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">DebateLab is purpose-built for the four major competitive formats — each with its own dedicated toolkit.</p>
          </div>

          <div className="space-y-5">
            {FORMATS.map(f => (
              <div key={f.name} className={`bg-gradient-to-br ${f.color} border rounded-2xl p-7`}>
                <div className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${f.dot}`} />
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-white text-lg font-heading">{f.name}</h3>
                      <span className="text-xs font-bold text-white/40 bg-white/8 px-2 py-0.5 rounded-full">{f.tag}</span>
                    </div>
                    <p className="text-white/50 text-sm leading-relaxed mb-4">{f.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {f.tools.map(t => (
                        <span key={t} className="text-xs text-white/60 bg-white/8 border border-white/10 px-2.5 py-1 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/25 gap-2 font-semibold px-10">
                Start Preparing Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-white/8 py-8 px-6 text-center text-xs text-white/20 space-x-5">
        <Link to="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
        <Link to="/terms" className="hover:text-white/50 transition-colors">Privacy</Link>
        <a href="mailto:DebateLab@outlook.com" className="hover:text-white/50 transition-colors">Contact</a>
        <span>© 2026 DebateLab</span>
      </div>
    </div>
  );
}