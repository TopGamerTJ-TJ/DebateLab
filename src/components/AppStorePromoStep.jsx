import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppStoreBadge from "@/components/AppStoreBadge";
import AddToHomeScreenModal from "@/components/AddToHomeScreenModal";
import { appConfig } from "@/lib/app-config";
import { isDesktop } from "@/lib/platform";
import { base44 } from "@/api/base44Client";

// Generic App Store download promo, designed to slot into an onboarding flow.
// All app-specific data (store URL) comes from appConfig — nothing hardcoded here.
export default function AppStorePromoStep({ onContinue }) {
  const [guideOpen, setGuideOpen] = useState(false);
  const desktop = isDesktop();
  const storeUrl = appConfig.appStoreUrl;

  useEffect(() => {
    base44.analytics.track({ eventName: "onboarding_appstore_viewed" });
  }, []);

  return (
    <div className="text-center">
      <motion.div
        className="flex justify-center mb-6"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="relative w-28 h-44 rounded-[1.75rem] bg-gradient-to-b from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-900 p-1.5 shadow-2xl">
          <div className="w-full h-full rounded-[1.4rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
            <Smartphone className="w-12 h-12 text-primary" />
          </div>
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full bg-slate-700" />
        </div>
      </motion.div>

      <h2 className="text-2xl font-bold font-heading mb-3">Take us with you.</h2>
      <p className="text-muted-foreground mb-8 leading-relaxed">
        Get the best experience by downloading the iPhone app. Enjoy faster performance,
        native notifications, quick launching, and a more seamless experience.
      </p>

      <div className="flex flex-col items-center gap-3 mb-4">
        <AppStoreBadge
          href={storeUrl}
          onClick={() => base44.analytics.track({ eventName: "onboarding_appstore_clicked" })}
        />
        <Button
          variant="ghost"
          className="text-muted-foreground font-medium"
          onClick={() => {
            base44.analytics.track({ eventName: "onboarding_continue_web" });
            onContinue?.();
          }}
        >
          Continue on Web
        </Button>
      </div>

      {!desktop && (
        <button
          onClick={() => setGuideOpen(true)}
          className="text-sm text-primary hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          Using the web? Learn how to add this app to your Home Screen.
        </button>
      )}

      <AddToHomeScreenModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}