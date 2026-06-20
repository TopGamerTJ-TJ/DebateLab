import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap, Sparkles, Brain, Trophy, FileText, Globe,
  TrendingUp, Search, MessageSquare
} from "lucide-react";

const NAV_TABS = [
  { id: "home", label: "Home" },
  { id: "discover", label: "Discover" },
  { id: "formats", label: "Formats" },
  { id: "about", label: "About" },
];

const FORMATS = [
  {
    name: "Parliamentary",
    tag: "Parli",
    desc: "British Parliamentary, American Parliamentary, and MSPDP formats with government/opposition roles, POIs, and prep time management.",
    tools: ["AI Contentions", "Practice Rounds", "Flow Sheet", "Case Vault"],
    dotClass: "bg-blue-400",
  },
  {
    name: "Public Forum",
    tag: "PF",
    desc: "NSDA Public Forum with crossfire prep, weighing mechanisms, summary/final focus strategy, and evidence pairing for both sides.",
    tools: ["Contentions", "Crossfire Prep", "Evidence", "Flow Sheet"],
    dotClass: "bg-violet-400",
  },
  {
    name: "Model UN",
    tag: "MUN",
    desc: "Complete MUN toolkit — position papers, draft resolutions, working papers, bloc strategy memos, and speech scripts for any committee.",
    tools: ["Position Papers", "Resolutions", "Country Profiles", "Speeches"],
    dotClass: "bg-teal-400",
  },
  {
    name: "Model Congress",
    tag: "Congress",
    desc: "Draft bills and resolutions, write authorship and floor debate speeches, and prepare legislative strategy for any chamber.",
    tools: ["Bill Drafting", "Speeches", "Floor Strategy", "Committee Prep"],
    dotClass: "bg-amber-400",
  },
];

const FEATURES = [
  { icon: Sparkles, label: "AI Contentions", desc: "Generate tournament-ready arguments for any resolution in seconds." },
  { icon: Brain, label: "AI Coaching", desc: "Get personalized performance insights and a custom prep plan." },
  { icon: MessageSquare, label: "Practice Rounds", desc: "Debate against an AI opponent and receive a full judge decision." },
];

export default function LandingPreview() {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-body">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-neutral-950 border-b border-white border-opacity-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-neutral-900 border border-white border-opacity-10 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-bold text-white text-base font-heading">DebateLab</span>
          </div>

          {/* Center tabs */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm transition-all ${
                  activeTab === tab.id
                    ? "text-blue-400 font-semibold"
                    : "text-white text-opacity-40 hover:text-opacity-70"
                }`}
              >
                {activeTab === tab.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                )}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-2">
            <Link to="/login">
              <button className="px-4 py-1.5 text-sm text-white border border-white border-opacity-20 rounded-lg transition-all hover:border-opacity-40">
                Sign In
              </button>
            </Link>
            <Link to="/register">
              <button className="px-4 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                Get Started
              </button>
            </Link>
            <Link to="/home" className="hidden md:block">
              <button className="px-4 py-1.5 text-sm font-semibold bg-white text-black rounded-lg hover:bg-gray-200 transition-all">
                Dashboard
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HOME */}
      {activeTab === "home" && (
        <div className="flex flex-col items-center text-center px-6">
          <div className="mt-16 mb-8 w-16 h-16 bg-neutral-900 border border-white border-opacity-10 rounded-2xl flex items-center justify-center shadow-2xl">
            <Zap className="w-8 h-8 text-blue-400" />
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold font-heading leading-tight mb-4 max-w-2xl">
            Your debate prep,{" "}
            <span className="text-blue-400">supercharged.</span>
          </h1>

          <p className="text-white text-opacity-50 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
            AI-powered contentions, practice rounds, MUN documents, and coaching — all in one place.
          </p>

          <div className="flex items-center gap-3 mb-16">
            <Link to="/register">
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all text-sm">
                Get Started Free <span>→</span>
              </button>
            </Link>
            <Link to="/login">
              <button className="px-6 py-3 text-sm text-white border border-white border-opacity-20 rounded-xl hover:border-opacity-40 transition-all">
                Sign In
              </button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl w-full mb-20">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-neutral-900 border border-white border-opacity-10 rounded-2xl p-6 text-left hover:border-opacity-20 transition-all">
                <Icon className="w-5 h-5 text-blue-400 mb-3" />
                <div className="font-semibold text-white text-sm mb-1.5">{label}</div>
                <p className="text-xs text-white text-opacity-40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DISCOVER */}
      {activeTab === "discover" && (
        <div className="max-w-3xl mx-auto px-6 pt-6 pb-20">
          <div className="bg-neutral-900 border border-white border-opacity-10 rounded-2xl p-12 text-center mb-8">
            <div className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-md mb-6 tracking-wide uppercase">
              Demo Mode
            </div>
            <h2 className="text-4xl font-bold font-heading mb-4">
              Prepare your next{" "}
              <span className="text-blue-400">argument.</span>
            </h2>
            <p className="text-white text-opacity-40 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              AI-powered debate prep that adapts to your style.<br />
              Create an account for personalized contentions and coaching.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/register">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all text-sm">
                  Get Started Free <Sparkles className="w-3.5 h-3.5" />
                </button>
              </Link>
              <Link to="/login">
                <button className="px-6 py-2.5 text-sm text-white border border-white border-opacity-20 rounded-xl hover:border-opacity-40 transition-all">
                  Sign In
                </button>
              </Link>
            </div>
          </div>

          <div className="flex gap-3 mb-8">
            <div className="flex-1 flex items-center gap-2 bg-neutral-900 border border-white border-opacity-10 rounded-xl px-4">
              <Search className="w-4 h-4 text-white text-opacity-30 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search resolutions, formats, topics..."
                className="flex-1 bg-transparent text-sm text-white placeholder-white outline-none py-3"
                style={{ opacity: 1 }}
              />
            </div>
            <button className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all text-sm">
              Search
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 text-white font-semibold mb-4">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Trending Topics
            </div>
            <div className="bg-neutral-900 border border-white border-opacity-10 rounded-2xl p-12 text-center">
              <TrendingUp className="w-8 h-8 text-white text-opacity-20 mx-auto mb-3" />
              <p className="text-white text-opacity-30 text-sm">Trending topics will appear as debaters practice. Check back soon!</p>
            </div>
          </div>
        </div>
      )}

      {/* FORMATS */}
      {activeTab === "formats" && (
        <div className="max-w-3xl mx-auto px-6 pt-12 pb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-heading mb-3">Every format, covered.</h2>
            <p className="text-white text-opacity-40 text-base max-w-md mx-auto">
              Purpose-built toolkits for the four major competitive debate and speech formats.
            </p>
          </div>
          <div className="space-y-4">
            {FORMATS.map(f => (
              <div key={f.name} className="bg-neutral-900 border border-white border-opacity-10 rounded-2xl p-6 hover:border-opacity-20 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${f.dotClass}`} />
                  <h3 className="font-bold text-white font-heading">{f.name}</h3>
                  <span className="text-xs text-white text-opacity-30 bg-white bg-opacity-5 px-2 py-0.5 rounded-full">{f.tag}</span>
                </div>
                <p className="text-white text-opacity-40 text-sm leading-relaxed mb-4 ml-5">{f.desc}</p>
                <div className="flex flex-wrap gap-2 ml-5">
                  {f.tools.map(t => (
                    <span key={t} className="text-xs text-white text-opacity-50 bg-white bg-opacity-5 border border-white border-opacity-10 px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/register">
              <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all text-sm">
                Get Started Free →
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* ABOUT */}
      {activeTab === "about" && (
        <div className="max-w-2xl mx-auto px-6 pt-16 pb-20 text-center">
          <div className="w-16 h-16 bg-neutral-900 border border-white border-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold font-heading mb-4">Built for serious debaters</h2>
          <p className="text-white text-opacity-40 leading-relaxed mb-6">
            DebateLab was built by competitors for competitors. Every tool is designed around the real workflows of Parliamentary, Public Forum, Model UN, and Model Congress debaters — from first-round prep to final-round strategy.
          </p>
          <p className="text-white text-opacity-30 text-sm leading-relaxed mb-10">
            Whether you're a first-year student or a seasoned debater, DebateLab gives you the AI tools to prepare faster and argue smarter.
          </p>
          <div className="border-t border-white border-opacity-10 pt-8 text-xs text-white text-opacity-20 flex items-center justify-center gap-5 flex-wrap">
            <Link to="/terms" className="hover:text-opacity-50 transition-colors">Terms of Service</Link>
            <Link to="/terms" className="hover:text-opacity-50 transition-colors">Privacy Policy</Link>
            <a href="mailto:DebateLab@outlook.com" className="hover:text-opacity-50 transition-colors">DebateLab@outlook.com</a>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-white border-opacity-10 py-6 px-6 text-center text-xs text-white text-opacity-20 flex items-center justify-center gap-5">
        <Link to="/terms" className="hover:text-opacity-40 transition-colors">Terms</Link>
        <Link to="/terms" className="hover:text-opacity-40 transition-colors">Privacy</Link>
        <a href="mailto:DebateLab@outlook.com" className="hover:text-opacity-40 transition-colors">Contact</a>
        <span>© 2026 DebateLab</span>
      </div>
    </div>
  );
}