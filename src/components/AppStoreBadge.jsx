// Official Apple logo silhouette (bitten apple with leaf).
function AppleLogo({ className = "" }) {
  return (
    <svg viewBox="0 0 384 512" className={className} fill="currentColor" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
    </svg>
  );
}

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
      <AppleLogo className="w-6 h-6 shrink-0" />
      <span className="flex flex-col items-start leading-none">
        <span className="text-[10px] font-medium tracking-wide">Download on the</span>
        <span className="text-lg font-semibold font-heading -mt-0.5">App Store</span>
      </span>
    </a>
  );
}