import { motion } from "framer-motion";
import { ShieldCheck, Clock, Lock, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SECTION_IDS } from "@/lib/constants";
import { SciFiBackdrop } from "@/components/ui/SciFiBackdrop";

interface Pillar {
  icon: LucideIcon;
  title: string;
  description: string;
}

const PILLARS: Pillar[] = [
  { icon: ShieldCheck, title: "100% Discreet", description: "Your privacy is always protected, from pickup to doorstep." },
  { icon: Clock, title: "On-Time Delivery", description: "Advanced routes and real-time updates keep every shipment on schedule." },
  { icon: Lock, title: "Secure Handling", description: "High-standard security at every step of the journey." },
  { icon: Globe, title: "Nationwide Reach", description: "Reliable delivery across the United States, coast to coast." },
];

/**
 * "Why Choose Us" — replaces the former feature strip beneath the hero.
 * Header typography is IDENTICAL to What We Do / Customers Review
 * (same badge, heading scale/weight/tracking, subtitle, divider).
 */
export function WhyChooseUsSection() {
  return (
    <section
      id={SECTION_IDS.whyChooseUs}
      aria-label="Why choose us"
      className="relative scroll-mt-24 overflow-hidden bg-white py-9 lg:py-12"
    >
      <SciFiBackdrop intensity="soft" flip />

      {/* Shared gradient for the pillar icons */}
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="ld-why-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2D8CFF" />
            <stop offset="100%" stopColor="#6C2EFF" />
          </linearGradient>
        </defs>
      </svg>

      <div className="shell relative">
        {/* ── Header — identical pattern to the other sections ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[#E6E9FF] bg-white px-3.5 shadow-soft">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#6C2EFF]" />
            <span className="text-[10px] font-bold tracking-[0.12em] text-ink-soft">
              WHY CHOOSE US
            </span>
          </span>

          <h2 className="mt-3 text-xl font-extrabold leading-[1.12] tracking-[-0.02em] text-[#0F172A] sm:text-2xl xl:text-3xl">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-[#2D8CFF] to-[#6C2EFF] bg-clip-text text-transparent">
              Linus Delivery
            </span>
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-ink-soft sm:text-[13px]">
            Security, precision, and care—built into every mile of your delivery.
          </p>

          <div className="mt-4 flex items-center justify-center" aria-hidden="true">
            <span className="h-1 w-1 rounded-full bg-[#2D8CFF] shadow-[0_0_5px_rgba(45,140,255,0.8)]" />
            <span className="h-px w-12 bg-gradient-to-r from-[#2D8CFF] to-[#6C2EFF]" />
            <span className="h-1 w-1 rounded-full bg-[#6C2EFF] shadow-[0_0_5px_rgba(108,46,255,0.8)]" />
          </div>
        </motion.div>

        {/* ── Pillar cards ── */}
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:mt-8 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, description }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="group relative flex h-full flex-col items-center rounded-2xl border border-[#EDF1FF] bg-white px-2.5 pb-4 pt-4 text-center shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#D9E4FF] hover:shadow-[0_12px_30px_-12px_rgba(45,140,255,0.2)] sm:px-4 sm:pb-5"
            >
              <span className="inline-flex rounded-full bg-gradient-to-br from-[#2D8CFF]/50 to-[#6C2EFF]/50 p-px transition-transform duration-300 ease-out group-hover:rotate-3 group-hover:from-[#2D8CFF] group-hover:to-[#6C2EFF]">
                <span className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-white sm:h-[56px] sm:w-[56px]">
                  <Icon
                    className="h-[22px] w-[22px] sm:h-6 sm:w-6"
                    strokeWidth={1.7}
                    stroke="url(#ld-why-gradient)"
                    aria-hidden="true"
                  />
                </span>
              </span>
              <h3 className="mt-2.5 text-[12px] font-bold leading-snug text-[#0F172A] sm:text-[13.5px]">
                {title}
              </h3>
              <p className="mt-1.5 max-w-[220px] text-[10.5px] leading-relaxed text-ink-soft sm:text-[12px]">
                {description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
