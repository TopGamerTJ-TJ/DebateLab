import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share, Plus, PlusSquare, Rocket, X, Zap, Maximize, MousePointerClick, Smartphone, Layers, Info, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSafari } from "@/lib/platform";
import { base44 } from "@/api/base44Client";

const STEPS = [
  { icon: Share, title: "Tap the Share button", desc: "Open the Share menu at the bottom of Safari." },
  { icon: PlusSquare, title: "Find \"Add to Home Screen\"", desc: "Scroll down the list of actions until you see it." },
  { icon: Plus, title: "Tap \"Add\"", desc: "Confirm in the top-right corner to place the icon." },
  { icon: Rocket, title: "Launch from your Home Screen", desc: "Open the app directly, just like a native app." },
];

const BENEFITS = [
  { icon: Zap, label: "Faster launching" },
  { icon: Maximize, label: "Full-screen experience" },
  { icon: MousePointerClick, label: "Easy access" },
  { icon: Smartphone, label: "Native-like feel" },
  { icon: Layers, label: "Better multitasking" },
];

export default function AddToHomeScreenModal({ open, onClose }) {
  const safari = isSafari();

  useEffect(() => {
    if (!open) return;
    base44.analytics.track({ eventName: "onboarding_homescreen_opened" });
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleOpenInSafari = () => {
    // Best-effort: iOS has no reliable "open in Safari" scheme from another
    // in-app browser, so we surface the current URL for the user to copy/open.
    try {
      window.open(window.location.href, "_blank", "noopener,noreferrer");
    } catch {
      // ignore
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="a2hs-title"
          onClick={onClose}
        >
          <motion.div
            className="bg-background text-foreground rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto shadow-2xl border border-border"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 relative">
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <PlusSquare className="w-7 h-7 text-primary" />
                </div>
              </div>

              <h2 id="a2hs-title" className="text-xl font-bold font-heading text-center mb-1">
                Add to Home Screen
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Install in a few taps for the best experience.
              </p>

              {!safari && (
                <div className="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 mb-5">
                  <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-xs text-amber-800 dark:text-amber-300">
                    <p className="font-medium mb-2">Adding to the Home Screen works best in Safari.</p>
                    <Button size="sm" variant="outline" onClick={handleOpenInSafari} className="gap-1.5 h-8 text-xs">
                      <Compass className="w-3.5 h-3.5" /> Open in Safari
                    </Button>
                  </div>
                </div>
              )}

              <ol className="space-y-3 mb-6">
                {STEPS.map((s, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <s.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">{i + 1}.</span>
                        {s.title}
                      </div>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>

              <div className="rounded-xl bg-muted/50 border border-border p-4 mb-6">
                <p className="text-xs font-semibold mb-3">Why install?</p>
                <div className="flex flex-wrap gap-2">
                  {BENEFITS.map((b) => (
                    <span key={b.label} className="inline-flex items-center gap-1.5 text-xs bg-background border border-border rounded-full px-2.5 py-1">
                      <b.icon className="w-3.5 h-3.5 text-primary" /> {b.label}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                className="w-full rounded-xl font-medium"
                onClick={() => {
                  base44.analytics.track({ eventName: "onboarding_homescreen_completed" });
                  onClose();
                }}
              >
                Got it
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}