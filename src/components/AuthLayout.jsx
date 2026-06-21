import React from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-[100dvh] flex bg-gradient-to-br from-slate-900 to-blue-950">
      {/* Left branding panel - hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between w-96 bg-gradient-to-br from-blue-600 to-blue-700 p-10 text-white shrink-0">
        <div>
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl font-heading">DebateLab</span>
          </div>
          <h2 className="text-3xl font-bold font-heading mb-4 leading-tight">The complete debate prep platform</h2>
          <p className="text-blue-100 leading-relaxed text-sm">AI-powered contentions, practice rounds, MUN documents, and coaching — all in one place.</p>
        </div>
        <div className="space-y-3">
          {["Parliamentary & Public Forum", "Model UN & Model Congress", "AI Practice Rounds", "Tournament Tracking"].map(f => (
            <div key={f} className="flex items-center gap-2.5 text-sm text-blue-100">
              <div className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
              {f}
            </div>
          ))}
          <div className="pt-4 text-xs text-blue-200">
            <Link to="/terms" className="hover:text-white transition-colors">Terms & Privacy</Link>
            {" · "}
            <a href="mailto:DebateLab@outlook.com" className="hover:text-white transition-colors">DebateLab@outlook.com</a>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-lg font-heading">DebateLab</span>
        </div>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white font-heading">{title}</h1>
            {subtitle && <p className="text-slate-400 mt-1.5 text-sm">{subtitle}</p>}
          </div>
          <div className="bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-8 [&_.google-btn]:border-slate-300 [&_.google-btn]:text-slate-900 [&_.google-btn]:hover:bg-slate-50 [&_.or-divider]:border-slate-300 [&_.or-label]:bg-white [&_.or-label]:text-slate-500 [&_label]:text-slate-900 [&_input]:text-slate-900 [&_input]:dark:text-slate-900 [&_a]:text-blue-600">
            {children}
          </div>
          {footer && (
            <p className="text-center text-sm text-slate-400 mt-6">{footer}</p>
          )}
          <p className="text-center text-xs text-slate-500 mt-4">
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms & Privacy</Link>
            {" · "}
            <a href="mailto:DebateLab@outlook.com" className="hover:text-slate-300 transition-colors">DebateLab@outlook.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}