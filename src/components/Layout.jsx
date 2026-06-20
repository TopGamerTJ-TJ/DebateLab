import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, BookOpen, Globe, FileText, Trophy, User, Zap, Menu, X, LayoutGrid, Folder, LogOut, LayoutDashboard, Brain, MessageSquare, Target } from "lucide-react";

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
    <div className="min-h-[100dvh] bg-slate-50 font-body pb-0 lg:pb-[env(safe-area-inset-bottom)]">
      {/* Desktop + Mobile top nav */}
      <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">

            {/* Mobile: back button on sub-routes, logo on root */}
            <div className="lg:hidden flex items-center gap-2">
              {isSubRoute && location.pathname !== "/coach" ? (
                <button onClick={() => navigate(-1)} className="p-2 -ml-1 rounded-xl hover:bg-accent active:bg-accent/80 transition-colors select-none text-foreground">
                  <ChevronDown className="w-5 h-5 rotate-90" />
                </button>
              ) : (
                <Link to="/home" className="flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                    <Zap className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-base tracking-tight text-foreground font-heading">DebateLab</span>
                </Link>
              )}
            </div>

            {/* Desktop logo */}
            <Link to="/home" className="hidden lg:flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground font-heading">DebateLab</span>
            </Link>

            <div className="hidden lg:flex items-center gap-1 flex-wrap justify-center">
              <div
                className="relative"
                onMouseEnter={() => { clearTimeout(timerRef.current); setDebateOpen(true); }}
                onMouseLeave={() => { timerRef.current = setTimeout(() => setDebateOpen(false), 200); }}
              >
                <button className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${active(['/parliamentary', '/public-forum']) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}>
                  <BookOpen className="w-4 h-4" />
                  Debate
                  <ChevronDown className={`w-3 h-3 transition-transform ${debateOpen ? 'rotate-180' : ''}`} />
                </button>
                {debateOpen && (
                  <div className="absolute top-full left-0 mt-2 w-60 bg-card rounded-xl shadow-xl border border-border p-1.5 z-50">
                    <Link to="/parliamentary" onClick={() => setDebateOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active('/parliamentary') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}>
                      <span className="text-xl">🏛️</span>
                      <div>
                        <div className="font-medium">Parliamentary</div>
                        <div className="text-xs opacity-70">BP, AP, MSPDP formats</div>
                      </div>
                    </Link>
                    <Link to="/public-forum" onClick={() => setDebateOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active('/public-forum') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}>
                      <span className="text-xl">🎤</span>
                      <div>
                        <div className="font-medium">Public Forum</div>
                        <div className="text-xs opacity-70">NSDA Public Forum format</div>
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
                ["/formats", <LayoutGrid className="w-3.5 h-3.5" />, "Formats"],
              ].map(([to, icon, label]) => (
                <Link key={to} to={to} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${active(to) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}>
                  {icon}{label}
                </Link>
              ))}
              
              {/* Desktop More Button */}
              <button onClick={() => setMobileOpen(true)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-accent`}>
                <Menu className="w-3.5 h-3.5" /> More
              </button>
            </div>

            <div className="flex items-center gap-1">
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

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
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