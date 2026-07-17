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
 * Feature strip — four equal columns in a single rounded white bar,
 * circular outlined icons, vertical hairline separators, hover lift.
 */
export function FeatureStrip() {
  return (
    <section aria-label="Service guarantees" className="shell -mt-2 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="card grid grid-cols-1 divide-y divide-canvas-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
      >
        {FEATURES.map(({ icon: Icon, title, lines }) => (
          <div
            key={title}
            className="group flex items-center gap-4 px-6 py-6 transition-transform duration-200 hover:-translate-y-0.5 sm:px-7"
          >
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-brand-100 bg-white text-brand-600 transition-colors duration-200 group-hover:border-brand-300">
              <Icon className="h-7 w-7" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-[15px] font-extrabold uppercase tracking-wide text-ink">
                {title}
              </h3>
              <p className="mt-1 text-sm leading-snug text-ink-soft">
                {lines[0]}
                <br />
                {lines[1]}
              </p>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
