import { motion } from "framer-motion";
import { ShieldCheck, Clock, Lock, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  lines: [string, string];
}

const FEATURES: Feature[] = [
  { icon: ShieldCheck, title: "100% Discreet", lines: ["Your privacy is", "always protected."] },
  { icon: Clock, title: "On-Time Delivery", lines: ["Advanced routes and", "real-time updates."] },
  { icon: Lock, title: "Secure Handling", lines: ["High-standard security", "at every step."] },
  { icon: Globe, title: "Nationwide Reach", lines: ["Reliable delivery across", "the United States."] },
];

/**
 * Feature strip.
 * Mobile: compact 2×2 grid (centered, stacked icon/text) — half the height
 * of four stacked rows. Desktop: original single row of four.
 * Hairline separators come from a 1px gap over the line color, which gives
 * clean dividers in both directions at every breakpoint.
 */
export function FeatureStrip() {
  return (
    <section aria-label="Service guarantees" className="shell pb-10 sm:pb-14">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="card overflow-hidden"
      >
        <div className="grid grid-cols-2 gap-px bg-canvas-line lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, lines }) => (
            <div
              key={title}
              className="group flex flex-col items-center gap-2.5 bg-white px-3 py-4 text-center transition-transform duration-200 hover:-translate-y-0.5 sm:flex-row sm:items-center sm:gap-3.5 sm:px-5 sm:py-5 sm:text-left"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-brand-100 bg-white text-brand-600 transition-colors duration-200 group-hover:border-brand-300 sm:h-[3.4rem] sm:w-[3.4rem]">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-[11.5px] font-extrabold uppercase tracking-wide text-ink sm:text-sm">
                  {title}
                </h3>
                <p className="mt-0.5 text-[11px] leading-snug text-ink-soft sm:mt-1 sm:text-[13px]">
                  {lines[0]}
                  <br className="hidden sm:block" />
                  <span className="sm:hidden"> </span>
                  {lines[1]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
