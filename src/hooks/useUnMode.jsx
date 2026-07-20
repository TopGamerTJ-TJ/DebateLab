import { useState, useEffect } from "react";
import { isUnMode } from "@/lib/un-mode";

export function useUnMode() {
  const [on, setOn] = useState(isUnMode());
  useEffect(() => {
    const handler = () => setOn(isUnMode());
    window.addEventListener('un-mode-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('un-mode-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);
  return on;
}