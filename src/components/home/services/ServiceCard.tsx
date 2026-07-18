import { motion } from "framer-motion";
import type { Service } from "./servicesData";
import { ServiceIcon } from "./ServiceIcons";

/**
 * Service card, harmonized with the site's card language:
 * rounded-2xl white card, hairline border, uniform height, gradient number
 * badge, 72px gradient-ring icon circle, centered title + description.
 * Hover: gentle lift, glow border, 3° icon rotation.
 */
export function ServiceCard({ service, index }: { service: Service; index: number }) {
  const { number, iconId, title, description } = service;

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col items-center rounded-2xl border border-[#EDF1FF] bg-white px-5 pb-6 pt-5 text-center shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#D9E4FF] hover:shadow-[0_14px_36px_-12px_rgba(45,140,255,0.2)]"
    >
      {/* Decorative futuristic corners */}
      <CornerAccent className="right-3 top-3" />
      <CornerAccent className="bottom-3 left-3 rotate-180" />

      {/* Number badge */}
      <span className="absolute left-4 top-4 flex h-7 w-8 items-center justify-center rounded-lg border border-[#C9DCFF] bg-gradient-to-b from-white to-[#EAF2FF] text-xs font-extrabold text-[#4A5BF5]">
        {number}
      </span>

      {/* Icon circle */}
      <span className="mt-3 inline-flex rounded-full bg-gradient-to-br from-[#2D8CFF]/50 to-[#6C2EFF]/50 p-px transition-transform duration-300 ease-out group-hover:rotate-3 group-hover:from-[#2D8CFF] group-hover:to-[#6C2EFF]">
        <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white">
          <ServiceIcon id={iconId} className="h-9 w-9" />
        </span>
      </span>

      {/* Title */}
      <h3 className="mt-4 text-[15px] font-bold leading-snug text-[#0F172A]">{title}</h3>

      {/* Description */}
      <p className="mt-2 max-w-[240px] text-[12.5px] leading-relaxed text-ink-soft">
        {description}
      </p>
    </motion.article>
  );
}

/** Thin blue futuristic corner outline. */
function CornerAccent({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 44 44"
      className={`pointer-events-none absolute h-7 w-7 opacity-50 ${className}`}
    >      <g stroke="#9BC1FF" strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M 14 2 H 38 Q 42 2 42 6 V 30" />
        <path d="M 30 9 L 37 16" opacity="0.7" />
      </g>
    </svg>
  );
}
