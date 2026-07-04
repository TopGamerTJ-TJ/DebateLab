import { Apple } from "lucide-react";

// Apple-style "Download on the App Store" badge. Generic — the href is
// passed in by the caller (sourced from config), never hardcoded here.
export default function AppStoreBadge({ href, onClick, className = "" }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      aria-label="Download on the App Store"
      className={`inline-flex items-center gap-3 rounded-xl bg-black text-white px-5 py-2.5 shadow-sm hover:bg-black/90 active:opacity-80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className}`}
    >
      <Apple className="w-7 h-7 shrink-0" fill="currentColor" strokeWidth={0} />
      <span className="flex flex-col items-start leading-none">
        <span className="text-[10px] font-medium tracking-wide">Download on the</span>
        <span className="text-lg font-semibold font-heading -mt-0.5">App Store</span>
      </span>
    </a>
  );
}