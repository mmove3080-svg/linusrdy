import { useCallback } from "react";
import { NAV_OFFSET } from "@/lib/constants";

/** Smoothly scrolls to a section id, offset for the sticky navbar. */
export function useSmoothScroll() {
  return useCallback((targetId: string, onArrive?: () => void) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    if (onArrive) window.setTimeout(onArrive, reduced ? 0 : 650);
  }, []);
}
