import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function PullToRefresh({ onRefresh, children }) {
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        setStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e) => {
      if (window.scrollY === 0 && startY > 0) {
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        if (diff > 0) {
          setPullDistance(Math.min(diff * 0.4, 80)); // Add resistance, max 80px
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > 50 && !refreshing) {
        setRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
      setStartY(0);
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [startY, pullDistance, refreshing, onRefresh]);

  return (
    <div style={{ transform: `translateY(${pullDistance}px)`, transition: pullDistance === 0 ? 'transform 0.2s ease-out' : 'none' }}>
      {refreshing && (
        <div className="flex justify-center items-center h-12 -mt-12 w-full text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      )}
      {children}
    </div>
  );
}