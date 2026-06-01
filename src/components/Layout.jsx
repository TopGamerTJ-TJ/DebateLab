import { useState, useRef } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { ChevronDown, BookOpen, Globe, FileText, Trophy, User, Zap, Menu, X } from "lucide-react";

export default function Layout() {
  const location = useLocation();
  const [debateOpen, setDebateOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const timerRef = useRef(null);

  const active = (paths) => (Array.isArray(paths) ? paths : [paths]).some(p => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-slate-50 font-body">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900 font-heading">DebateLab</span>
            </Link>

            <div className="hidden md:flex items-center gap-0.5">
              <div
                className="relative"
                onMouseEnter={() => { clearTimeout(timerRef.current); setDebateOpen(true); }}
                onMouseLeave={() => { timerRef.current = setTimeout(() => setDebateOpen(false), 200); }}
              >
                <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${active(['/parliamentary', '/public-forum']) ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                  <BookOpen className="w-4 h-4" />
                  Debate
                  <ChevronDown className={`w-3 h-3 transition-transform ${debateOpen ? 'rotate-180' : ''}`} />
                </button>
                {debateOpen && (
                  <div className="absolute top-full left-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50">
                    <Link to="/parliamentary" onClick={() => setDebateOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-blue-50 hover:text-primary transition-colors ${active('/parliamentary') ? 'bg-blue-50 text-primary' : 'text-slate-700'}`}>
                      <span className="text-xl">🏛️</span>
                      <div>
                        <div className="font-medium">Parliamentary</div>
                        <div className="text-xs text-slate-400">BP, AP, MSPDP formats</div>
                      </div>
                    </Link>
                    <Link to="/public-forum" onClick={() => setDebateOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-blue-50 hover:text-primary transition-colors ${active('/public-forum') ? 'bg-blue-50 text-primary' : 'text-slate-700'}`}>
                      <span className="text-xl">🎤</span>
                      <div>
                        <div className="font-medium">Public Forum</div>
                        <div className="text-xs text-slate-400">NSDA Public Forum format</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {[
                ["/model-un", <Globe className="w-4 h-4" />, "Model UN"],
                ["/model-congress", <FileText className="w-4 h-4" />, "Model Congress"],
                ["/tournament", <Trophy className="w-4 h-4" />, "Tournament"],
                ["/profile", <User className="w-4 h-4" />, "Profile"],
              ].map(([to, icon, label]) => (
                <Link key={to} to={to} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${active(to) ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                  {icon}{label}
                </Link>
              ))}
            </div>

            <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {mobileOpen && (
            <div className="md:hidden border-t border-slate-100 py-2 space-y-0.5">
              {[
                ["/parliamentary", "🏛️ Parliamentary Debate"],
                ["/public-forum", "🎤 Public Forum Debate"],
                ["/model-un", "🌍 Model UN"],
                ["/model-congress", "🏛 Model Congress"],
                ["/tournament", "🏆 Tournament"],
                ["/profile", "👤 Profile"],
              ].map(([to, label]) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)} className={`block px-3 py-2 text-sm rounded-lg transition-colors ${active(to) ? 'bg-blue-50 text-primary font-medium' : 'hover:bg-slate-50 text-slate-700'}`}>{label}</Link>
              ))}
            </div>
          )}
        </div>
      </nav>
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
}