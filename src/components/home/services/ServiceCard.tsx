import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Service } from "./servicesData";
import { SECTION_IDS } from "@/lib/constants";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { requestTrackingFocus } from "@/components/tracking/trackingFocus";

/**
 * Service card per reference: 28px radius white card with #EDF1FF border,
 * futuristic corner accents (top-right, bottom-left), gradient number badge
 * top-left, 100px gradient-ring icon circle, centered title/description,
 * gradient "Learn more →". Hover: -8px lift, glow border, icon rotates 3°.
 */
export function ServiceCard({ service, index }: { service: Service; index: number }) {
  const { number, icon: Icon, fast, title, description } = service;
  const scrollTo = useSmoothScroll();

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex min-h-[330px] flex-col items-center rounded-[28px] border border-[#EDF1FF] bg-white px-6 py-7 text-center shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition-all duration-[350ms] ease-out hover:-translate-y-2 hover:border-[#D9E4FF] hover:shadow-[0_16px_44px_-12px_rgba(45,140,255,0.22)]"
    >
      {/* Decorative futuristic corners */}
      <CornerAccent className="right-4 top-4" />
      <CornerAccent className="bottom-4 left-4 rotate-180" />

      {/* Number badge */}
      <span className="absolute left-6 top-6 flex h-9 w-10 items-center justify-center rounded-xl border border-[#C9DCFF] bg-gradient-to-b from-white to-[#EAF2FF] text-sm font-extrabold text-[#4A5BF5]">
        {number}
      </span>

      {/* Icon circle: thin gradient ring via padded gradient wrapper */}
      <span className="mt-2 inline-flex rounded-full bg-gradient-to-br from-[#2D8CFF]/55 to-[#6C2EFF]/55 p-[1.5px] transition-transform duration-[350ms] ease-out group-hover:rotate-3 group-hover:from-[#2D8CFF] group-hover:to-[#6C2EFF]">
        <span className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-white">
          <span className="relative">
            <Icon
              className="h-11 w-11"
              strokeWidth={1.6}
              stroke="url(#ld-services-gradient)"
              aria-hidden="true"
            />
            {fast && (
              <svg
                aria-hidden="true"
                viewBox="0 0 14 24"
                className="absolute -left-4 top-1/2 h-5 w-3 -translate-y-1/2"
              >
                <g stroke="url(#ld-services-gradient)" strokeWidth="2" strokeLinecap="round">
                  <line x1="2" y1="7" x2="12" y2="7" />
                  <line x1="5" y1="13" x2="12" y2="13" />
                  <line x1="2" y1="19" x2="9" y2="19" />
                </g>
              </svg>
            )}
          </span>
        </span>
      </span>

      {/* Title */}
      <h3 className="mt-6 text-xl font-bold leading-snug text-[#0F172A] lg:text-[22px]">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-3 max-w-[250px] text-[15px] leading-[1.8] text-[#6B7280]">{description}</p>

      {/* Learn more */}
      <button
        type="button"
        onClick={() => scrollTo(SECTION_IDS.track, requestTrackingFocus)}
        className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[15px] font-semibold"
      >
        <span className="bg-gradient-to-r from-[#2D8CFF] to-[#6C2EFF] bg-clip-text text-transparent">
          Learn more
        </span>
        <ArrowRight
          className="h-4 w-4 text-[#5A5BF7] transition-transform duration-[350ms] ease-out group-hover:translate-x-1"
          strokeWidth={2.2}
          aria-hidden="true"
        />
      </button>
    </motion.article>
  );
}

/** Thin blue futuristic corner outline. */
function CornerAccent({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 44 44"
      className={`pointer-events-none absolute h-9 w-9 opacity-60 ${className}`}
    >
      <g stroke="#9BC1FF" strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M 14 2 H 38 Q 42 2 42 6 V 30" />
        <path d="M 30 9 L 37 16" opacity="0.7" />
      </g>
    </svg>
  );
}
