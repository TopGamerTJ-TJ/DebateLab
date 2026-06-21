import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import CoachChat from "@/pages/CoachChat";
import Forum from "@/pages/Forum";
import { ChevronDown, BookOpen, Globe, FileText, Trophy, User, Zap, Menu, X, LayoutGrid, Folder, LogOut, LayoutDashboard, Brain, MessageSquare, Target, Users, Sparkles } from "lucide-react";

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
  const rootPaths = ["/home", "/projects", "/practice", "/forum", "/coach"];
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
    <div className="min-h-[100dvh] bg-slate-50 font-body flex flex-col">
      {/* Desktop + Mobile top nav */}
      <nav 
        className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">

            {/* Mobile: back button on sub-routes, logo on root */}
            <div className="lg:hidden flex items-center gap-2 min-w-0 shrink-0">
              {isSubRoute && location.pathname !== "/coach" ? (
                <button onClick={() => navigate(-1)} className="p-2 -ml-1 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors select-none shrink-0">
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
                ["/projects", <Folder className="w-3.5 h-3.5" />, "Projects"],
                ["/friends", <Users className="w-3.5 h-3.5" />, "Friends"],
                ["/ai-editor", <Sparkles className="w-3.5 h-3.5" />, "AI Editor"],
                ["/formats", <LayoutGrid className="w-3.5 h-3.5" />, "Formats"],
              ].map(([to, icon, label]) => (
                <Link key={to} to={to} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${active(to) ? 'bg-primary text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                  {icon}{label}
                </Link>
              ))}
              
              {/* Desktop More Button */}
              <button onClick={() => setMobileOpen(true)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap text-slate-600 hover:text-slate-900 hover:bg-slate-100`}>
                <Menu className="w-3.5 h-3.5" /> More
              </button>
            </div>

            <div className="flex items-center gap-1 min-w-0 justify-end ml-2">
              {/* Mobile: page title on sub-routes */}
              {isSubRoute && <span className="lg:hidden font-semibold text-slate-900 text-sm truncate">{location.pathname.split('/').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')).pop()}</span>}
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
      <main className="flex-1 w-full pb-24 lg:pb-8 relative">
        <div className={location.pathname === '/home' ? 'block' : 'hidden'}><Dashboard /></div>
        <div className={location.pathname === '/projects' ? 'block' : 'hidden'}><Projects /></div>
        <div className={location.pathname.startsWith('/coach') ? 'block' : 'hidden'}><CoachChat /></div>
        <div className={location.pathname === '/forum' ? 'block' : 'hidden'}><Forum /></div>
        {(!['/home', '/projects', '/forum'].includes(location.pathname) && !location.pathname.startsWith('/coach')) && (
          <Outlet />
        )}
      </main>

      {/* Mobile bottom tab bar */}
      <nav 
        className="lg:hidden fixed left-0 right-0 w-full z-[60] bg-white border-t border-slate-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] transform-gpu"
        style={{ bottom: 'calc(-1 * env(safe-area-inset-bottom))', paddingBottom: 'calc(env(safe-area-inset-bottom) * 2)' }}
      >
        <div className="flex items-stretch h-14">
          {[
            { to: "/home", icon: LayoutDashboard, label: "Home" },
            { to: "/projects", icon: Folder, label: "Projects" },
            { to: "/coach", icon: Brain, label: "Coach" },
            { to: "/forum", icon: MessageSquare, label: "Forum" },
          ].map(({ to, icon: Icon, label }) => {
            const isActive = to === "/home" ? location.pathname === "/home" : location.pathname.startsWith(to);
            return (
              <Link key={to} to={to} className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 select-none transition-colors ${isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"}`}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
          <button 
            onClick={() => setMobileOpen(true)} 
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 select-none transition-colors text-slate-400 hover:text-slate-600`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* Full screen menu (Mobile + Desktop) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] bg-[#0B1120] pt-12 pb-24 px-4 overflow-y-auto flex flex-col items-center">
          <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-8 mt-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Navigation</h2>
            <button onClick={() => setMobileOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {[
              ["/home", LayoutDashboard, "Home"],
              ["/projects", Folder, "Projects"],
              ["/coach", Brain, "Coach"],
              ["/practice", Target, "Practice Rounds"],
              ["/forum", MessageSquare, "Forum"],
              ["/friends", Users, "Friends"],
              ["/ai-editor", Sparkles, "AI Editor"],
              ["/profile", User, "Profile"],
              ["/parliamentary", BookOpen, "Parliamentary"],
              ["/public-forum", BookOpen, "Public Forum"],
              ["/model-un", Globe, "Model UN"],
              ["/model-congress", FileText, "Congress"],
              ["/formats", LayoutGrid, "Formats"],
              ["/office-hours", MessageSquare, "Office Hours"],
              ["/tournament", Trophy, "Tournament"],
            ].map(([to, Icon, label]) => {
              const isActive = to === "/home" ? location.pathname === "/home" : location.pathname.startsWith(to);
              return (
                <Link 
                  key={to} 
                  to={to} 
                  onClick={() => setMobileOpen(false)} 
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl gap-2 transition-colors ${isActive ? 'bg-primary text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'}`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[11px] font-medium text-center leading-tight">{label}</span>
                </Link>
              );
            })}
            
            <button 
              onClick={() => { setMobileOpen(false); doLogout(); }}
              className="flex flex-col items-center justify-center p-4 rounded-2xl gap-2 transition-colors bg-slate-800/50 text-slate-400 hover:bg-red-900/30 hover:text-red-400"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-[11px] font-medium text-center leading-tight">Log out</span>
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}