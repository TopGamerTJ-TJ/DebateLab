import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, BookOpen, Globe, FileText, Trophy, User, Zap, Menu, X, LayoutGrid, Folder, LogOut, LayoutDashboard, Brain, MessageSquare } from "lucide-react";

const doLogout = async () => {
  await base44.auth.logout();
  window.location.href = "/login";
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [debateOpen, setDebateOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dismissedNotifs, setDismissedNotifs] = useState(() => JSON.parse(sessionStorage.getItem('dismissed_notifs') || '[]'));
  const timerRef = useRef(null);

  // Detect if we're on a sub-route (not a root tab) for mobile back button
  const rootPaths = ["/home", "/projects", "/practice", "/profile"];
  const isSubRoute = !rootPaths.includes(location.pathname);

  const { data: notifications = [] } = useQuery({
    queryKey: ['platform_notifications'],
    queryFn: () => base44.entities.PlatformNotification.filter({ isActive: true }),
    refetchInterval: 60000,
  });

  const activeNotif = notifications.find(n => !dismissedNotifs.includes(n.id));

  const dismissNotif = (id) => {
    const next = [...dismissedNotifs, id];
    setDismissedNotifs(next);
    sessionStorage.setItem('dismissed_notifs', JSON.stringify(next));
  };

  const notifColors = { info: 'bg-blue-600', warning: 'bg-amber-500', success: 'bg-green-600', alert: 'bg-red-600' };

  const active = (paths) => (Array.isArray(paths) ? paths : [paths]).some(p => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-slate-50 font-body pb-[env(safe-area-inset-bottom)]">
      {/* Desktop + Mobile top nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">

            {/* Mobile: back button on sub-routes, logo on root */}
            <div className="lg:hidden flex items-center gap-2">
              {isSubRoute ? (
                <button onClick={() => navigate(-1)} className="p-2 -ml-1 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors select-none">
                  <ChevronDown className="w-5 h-5 text-slate-600 rotate-90" />
                </button>
              ) : (
                <Link to="/home" className="flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-base tracking-tight text-slate-900 font-heading">DebateLab</span>
                </Link>
              )}
            </div>

            {/* Desktop logo */}
            <Link to="/home" className="hidden lg:flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900 font-heading">DebateLab</span>
            </Link>

            <div className="hidden lg:flex items-center gap-1 flex-wrap justify-center">
              <div
                className="relative"
                onMouseEnter={() => { clearTimeout(timerRef.current); setDebateOpen(true); }}
                onMouseLeave={() => { timerRef.current = setTimeout(() => setDebateOpen(false), 200); }}
              >
                <button className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${active(['/parliamentary', '/public-forum']) ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
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
                ["/model-un", <Globe className="w-3.5 h-3.5" />, "MUN"],
                ["/model-congress", <FileText className="w-3.5 h-3.5" />, "Congress"],
                ["/forum", <MessageSquare className="w-3.5 h-3.5" />, "Forum"],
                ["/office-hours", <MessageSquare className="w-3.5 h-3.5" />, "Office Hours"],
                ["/projects", <Folder className="w-3.5 h-3.5" />, "Projects"],
                ["/formats", <LayoutGrid className="w-3.5 h-3.5" />, "Formats"],
                ["/tournament", <Trophy className="w-3.5 h-3.5" />, "Tournament"],
                ["/profile", <User className="w-3.5 h-3.5" />, "Profile"],
              ].map(([to, icon, label]) => (
                <Link key={to} to={to} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${active(to) ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                  {icon}{label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={doLogout}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all select-none"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Log out</span>
              </button>
              {/* Mobile: page title on sub-routes */}
              {isSubRoute && <span className="lg:hidden font-semibold text-slate-900 text-sm truncate max-w-[140px]">{location.pathname.split('/').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')).pop()}</span>}
              {/* Hidden top nav menu button since we moved it to the bottom bar */}
            </div>
          </div>

          {/* Removed old dropdown mobile menu */}
        </div>
      </nav>
      {activeNotif && (
        <div className={`${notifColors[activeNotif.type] || 'bg-blue-600'} text-white px-4 py-2.5 flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm font-semibold shrink-0">{activeNotif.title}</span>
            <span className="text-xs text-white/80 truncate">{activeNotif.message}</span>
          </div>
          <button onClick={() => dismissNotif(activeNotif.id)} className="text-white/70 hover:text-white shrink-0 text-lg leading-none">×</button>
        </div>
      )}
      <main className="min-h-[calc(100vh-4rem)] pb-8">
        <Outlet />
      </main>
    </div>
  );
}