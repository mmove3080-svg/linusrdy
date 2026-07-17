import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { NAV_LINKS, SECTION_IDS } from "@/lib/constants";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { requestTrackingFocus } from "@/components/tracking/trackingFocus";

/**
 * Floating glass navbar: rounded white container, soft shadow, logo left,
 * navigation centered-right, active item in blue with an animated underline
 * (Framer Motion layoutId slides the indicator between items).
 */
export function Navbar() {
  const [active, setActive] = useState<string>(SECTION_IDS.home);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollTo = useSmoothScroll();

  // Scroll spy — keeps the blue underline on the section in view.
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.targetId);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleClick = (link: (typeof NAV_LINKS)[number]) => {
    setOpen(false);
    if (link.reload) {
      // Intentional product decision: Home resets the app to its initial state.
      window.location.reload();
      return;
    }
    scrollTo(link.targetId, link.focusTracking ? requestTrackingFocus : undefined);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <nav
        aria-label="Main"
        className={`glass-panel mx-auto flex max-w-shell items-center justify-between px-4 py-2.5 transition-shadow duration-300 sm:px-7 ${
          scrolled ? "shadow-lift" : ""
        }`}
      >
        <Logo />

        {/* Desktop navigation */}
        <ul className="hidden items-center gap-2 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.targetId;
            return (
              <li key={link.label} className="relative">
                <button
                  type="button"
                  onClick={() => handleClick(link)}
                  className={`relative px-3.5 py-2 text-sm font-semibold transition-colors duration-200 ${
                    isActive ? "text-brand-600" : "text-ink hover:text-brand-600"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-brand-600"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          className="rounded-lg p-2 text-ink lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="glass-panel mx-auto mt-2 max-w-shell overflow-hidden px-4 py-3 lg:hidden">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <button
                  type="button"
                  onClick={() => handleClick(link)}
                  className={`w-full rounded-xl px-4 py-3 text-left text-[15px] font-semibold transition-colors ${
                    active === link.targetId
                      ? "bg-brand-50 text-brand-600"
                      : "text-ink hover:bg-canvas-tint"
                  }`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
