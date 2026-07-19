import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import type { Review } from "./reviewsData";

/**
 * Review card per the approved design, at site scale:
 * hexagonal gradient quote chip, five amber stars, review text, avatar
 * (gradient-ring initials, or photo when provided), navy name, violet
 * location, purple right-edge accent bar, futuristic corner accents.
 */
export function ReviewCard({ review, index }: { review: Review; index: number }) {
  const { name, location, text, avatarUrl } = review;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: (index % 3) * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex h-full flex-col rounded-2xl border border-[#EDF1FF] bg-white p-3 shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#D9E4FF] hover:shadow-[0_12px_30px_-12px_rgba(108,46,255,0.18)] sm:p-4"
    >
      {/* Purple right-edge accent */}
      <span
        aria-hidden="true"
        className="absolute right-0 top-1/2 h-1/3 w-[3px] -translate-y-1/2 rounded-l-full bg-gradient-to-b from-[#2D8CFF] to-[#6C2EFF] opacity-70"
      />
      {/* Futuristic corner accents */}
      <CornerAccent className="right-2.5 top-2.5" />
      <CornerAccent className="bottom-2.5 left-2.5 rotate-180" />

      {/* Quote chip + stars */}
      <div className="flex items-start justify-between">
        <span
          className="flex h-8 w-8 items-center justify-center bg-gradient-to-br from-[#2D8CFF] to-[#6C2EFF] text-white sm:h-9 sm:w-9"
          style={{ clipPath: "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)" }}
        >
          <Quote className="h-3.5 w-3.5 fill-white sm:h-4 sm:w-4" strokeWidth={0} aria-hidden="true" />
        </span>
        <span className="flex gap-0.5" role="img" aria-label="Rated 5 out of 5 stars">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star
              key={i}
              className="h-3 w-3 fill-[#F5A623] text-[#F5A623] sm:h-3.5 sm:w-3.5"
              strokeWidth={0}
              aria-hidden="true"
            />
          ))}
        </span>
      </div>

      {/* Review text */}
      <p className="mt-2.5 text-[10.5px] leading-relaxed text-ink-soft sm:text-[12px]">{text}</p>

      {/* Reviewer */}
      <div className="mt-auto flex items-center gap-2.5 pt-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            loading="lazy"
            className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-soft ring-1 ring-[#D9E4FF] sm:h-9 sm:w-9"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2D8CFF] to-[#6C2EFF] text-[10px] font-extrabold text-white ring-2 ring-white sm:h-9 sm:w-9 sm:text-[11px]">
            {initials(name)}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-[11.5px] font-extrabold text-[#0F172A] sm:text-[12.5px]">
            {name}
          </p>
          <p className="truncate text-[9.5px] font-semibold text-[#7C6FF0] sm:text-[10.5px]">
            {location}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function CornerAccent({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 44 44"
      className={`pointer-events-none absolute hidden h-5 w-5 opacity-45 sm:block ${className}`}
    >
      <g stroke="#C0B4F5" strokeWidth="1.5" fill="none" strokeLinecap="round">
        <path d="M 14 2 H 38 Q 42 2 42 6 V 30" />
      </g>
    </svg>
  );
}
