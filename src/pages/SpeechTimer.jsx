import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Timer, Bell } from "lucide-react";
import { haptic } from "@/lib/native";
import AnimatedPage from "@/components/AnimatedPage";

// Common debate speech lengths (seconds). Users can pick a preset to time a speech.
const PRESETS = [
  { label: "Constructive", sub: "4 min", seconds: 240 },
  { label: "Rebuttal", sub: "4 min", seconds: 240 },
  { label: "Summary", sub: "3 min", seconds: 180 },
  { label: "Final Focus", sub: "2 min", seconds: 120 },
  { label: "Crossfire", sub: "3 min", seconds: 180 },
  { label: "Prep Time", sub: "3 min", seconds: 180 },
];

export default function SpeechTimer() {
  const [total, setTotal] = useState(240);
  const [remaining, setRemaining] = useState(240);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const firedRef = useRef({});

  useEffect(() => () => clearInterval(intervalRef.current), []);

  // Haptic signals at key debate milestones: halfway, 30s left, 10s countdown, and time up.
  const checkSignals = (secLeft) => {
    if (secLeft === Math.floor(total / 2) && !firedRef.current.half) {
      firedRef.current.half = true;
      haptic(20);
    }
    if (secLeft === 30 && !firedRef.current.thirty) {
      firedRef.current.thirty = true;
      haptic([30, 50, 30]);
    }
    if (secLeft <= 10 && secLeft > 0) {
      haptic(15);
    }
    if (secLeft === 0 && !firedRef.current.done) {
      firedRef.current.done = true;
      haptic([100, 60, 100, 60, 200]);
    }
  };

  const tick = () => {
    setRemaining(prev => {
      const next = prev - 1;
      checkSignals(next);
      if (next <= 0) {
        clearInterval(intervalRef.current);
        setRunning(false);
        return 0;
      }
      return next;
    });
  };

  const start = () => {
    if (remaining <= 0) return;
    haptic(15);
    setRunning(true);
    intervalRef.current = setInterval(tick, 1000);
  };

  const pause = () => {
    haptic(10);
    setRunning(false);
    clearInterval(intervalRef.current);
  };

  const reset = () => {
    haptic(10);
    setRunning(false);
    clearInterval(intervalRef.current);
    firedRef.current = {};
    setRemaining(total);
  };

  const selectPreset = (seconds) => {
    haptic(10);
    setRunning(false);
    clearInterval(intervalRef.current);
    firedRef.current = {};
    setTotal(seconds);
    setRemaining(seconds);
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const pct = total > 0 ? (remaining / total) * 100 : 0;
  const danger = remaining <= 30;

  return (
    <AnimatedPage>
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-3xl p-8 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2 text-slate-300 text-sm font-medium">
            <Timer className="w-4 h-4" /> Speech Timer
          </div>
          <h1 className="text-2xl font-bold font-heading mb-1">Time your speeches</h1>
          <p className="text-slate-300 text-sm max-w-md">Vibration signals at the halfway point, 30 seconds left, the final countdown, and time up — feel your time without looking down.</p>
        </div>

        {/* Preset picker */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => selectPreset(p.seconds)}
              className={`rounded-xl border p-3 text-center transition-all ${total === p.seconds ? "bg-primary text-white border-primary shadow-sm" : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"}`}
            >
              <div className="text-xs font-bold">{p.label}</div>
              <div className={`text-[11px] ${total === p.seconds ? "text-white/80" : "text-slate-400"}`}>{p.sub}</div>
            </button>
          ))}
        </div>

        {/* Timer dial */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col items-center">
          <div className="relative w-56 h-56 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100" />
              <circle
                cx="50" cy="50" r="45" fill="none" strokeWidth="6" strokeLinecap="round"
                className={danger ? "text-red-500 transition-all" : "text-primary transition-all"}
                stroke="currentColor"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 * (1 - pct / 100)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-bold font-heading tabular-nums ${danger ? "text-red-500" : "text-slate-900"}`}>{fmt(remaining)}</span>
              {remaining === 0 && (
                <span className="flex items-center gap-1 text-red-500 text-sm font-semibold mt-2 animate-pulse">
                  <Bell className="w-4 h-4" /> Time!
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3 w-full">
            {running ? (
              <Button onClick={pause} variant="outline" className="flex-1 gap-2 h-12">
                <Pause className="w-5 h-5" /> Pause
              </Button>
            ) : (
              <Button onClick={start} disabled={remaining === 0} className="flex-1 gap-2 h-12">
                <Play className="w-5 h-5" /> {remaining < total ? "Resume" : "Start"}
              </Button>
            )}
            <Button onClick={reset} variant="outline" className="gap-2 h-12">
              <RotateCcw className="w-5 h-5" /> Reset
            </Button>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}