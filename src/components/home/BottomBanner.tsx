import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

/**
 * Bottom banner: shield icon, bold headline, vertical divider, supporting
 * sentence, decorative dotted pattern fading in from the right.
 */
export function BottomBanner() {
  return (
    <section aria-label="Our guarantee" className="shell pb-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="card relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl px-5 py-4 sm:flex-row sm:items-center sm:gap-5 sm:px-6"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <ShieldCheck className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <h2 className="text-base font-extrabold text-ink sm:text-lg">
            100% Discreet. 100% Secure. Always.
          </h2>
        </div>

        <span aria-hidden="true" className="hidden h-8 w-px bg-canvas-line sm:block" />

        <p className="relative z-10 text-sm text-ink-soft">
          We go the extra mile—so you can have complete peace of mind.
        </p>

        {/* Decorative dotted pattern, right side */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-72 lg:block"
          viewBox="0 0 288 96"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="banner-dots" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="2" fill="#2145E6" />
            </pattern>
            <linearGradient id="dots-fade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="60%" stopColor="white" stopOpacity="0.35" />
              <stop offset="100%" stopColor="white" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <rect width="288" height="96" fill="url(#banner-dots)" opacity="0.18" />
          <rect width="288" height="96" fill="url(#dots-fade)" />
        </svg>
      </motion.div>
    </section>
  );
}
