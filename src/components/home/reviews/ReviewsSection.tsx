import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageSquareQuote } from "lucide-react";
import { ReviewCard } from "./ReviewCard";
import { StatisticsBar } from "./StatisticsBar";
import { REVIEWS } from "./reviewsData";
import { SECTION_IDS } from "@/lib/constants";
import { SciFiBackdrop } from "@/components/ui/SciFiBackdrop";

/**
 * "Customers Review — What Our Customers Say".
 * Header at site scale, horizontal snap carousel (2 cards per view on mobile,
 * 3 on desktop) with softly pulsing chevron controls, and the animated
 * statistics bar. White sci-fi backdrop shared with the rest of the site.
 */
export function ReviewsSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Bounded navigation: track scroll position so controls disable at the edges
  // and the carousel can never advance into empty space.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      const tolerance = 4;
      setAtStart(track.scrollLeft <= tolerance);
      setAtEnd(track.scrollLeft >= track.scrollWidth - track.clientWidth - tolerance);
    };
    update();
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollByPage = useCallback(
    (dir: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;
      if (dir === 1 && atEnd) return;
      if (dir === -1 && atStart) return;
      const max = track.scrollWidth - track.clientWidth;
      const target = Math.min(max, Math.max(0, track.scrollLeft + dir * track.clientWidth));
      track.scrollTo({ left: target, behavior: "smooth" });
    },
    [atStart, atEnd],
  );

  return (
    <section
      id={SECTION_IDS.reviews}
      aria-label="Customer reviews"
      className="relative scroll-mt-24 overflow-hidden bg-white py-9 lg:py-12"
    >
      <SciFiBackdrop radar />

      <div className="shell relative">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[#E6E9FF] bg-white px-3.5 shadow-soft">
            <MessageSquareQuote className="h-3 w-3 text-[#6C2EFF]" strokeWidth={2.2} aria-hidden="true" />
            <span className="text-[10px] font-bold tracking-[0.12em] text-ink-soft">
              CUSTOMER REVIEWS
            </span>
          </span>

          <h2 className="mt-3 text-xl font-extrabold leading-[1.12] tracking-[-0.02em] text-[#0F172A] sm:text-2xl xl:text-3xl">
            What Our{" "}
            <span className="bg-gradient-to-r from-[#2D8CFF] to-[#6C2EFF] bg-clip-text text-transparent">
              Customers
            </span>{" "}
            Say
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-ink-soft sm:text-[13px]">
            Real feedback from businesses and individuals who trust us to move their packages
            safely and on time.
          </p>

          <div className="mt-4 flex items-center justify-center" aria-hidden="true">
            <span className="h-1 w-1 rounded-full bg-[#2D8CFF] shadow-[0_0_5px_rgba(45,140,255,0.8)]" />
            <span className="h-px w-12 bg-gradient-to-r from-[#2D8CFF] to-[#6C2EFF]" />
            <span className="h-1 w-1 rounded-full bg-[#6C2EFF] shadow-[0_0_5px_rgba(108,46,255,0.8)]" />
          </div>
        </motion.div>

        {/* ── Carousel ── */}
        <div className="relative mt-6 lg:mt-8">
          <CarouselControl side="left" onClick={() => scrollByPage(-1)} disabled={atStart} />
          <CarouselControl side="right" onClick={() => scrollByPage(1)} disabled={atEnd} />

          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto overscroll-x-contain scroll-smooth px-0.5 pb-2 sm:gap-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="region"
            aria-label="Customer reviews carousel"
            tabIndex={0}
          >
            {REVIEWS.map((review, i) => (
              <div
                key={review.name}
                className="w-[calc(50%-5px)] shrink-0 snap-start sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
              >
                <ReviewCard review={review} index={i} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Statistics ── */}
        <div className="mt-5 lg:mt-6">
          <StatisticsBar />
        </div>
      </div>
    </section>
  );
}

/** Pulsing chevron control — gentle scale + glow loop signals interactivity. */
function CarouselControl({
  side,
  onClick,
  disabled,
}: {
  side: "left" | "right";
  onClick: () => void;
  disabled: boolean;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Previous reviews" : "Next reviews"}
      aria-disabled={disabled}
      className={`absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#E6E9FF] bg-white/95 text-[#5A5BF7] shadow-card backdrop-blur transition-all duration-200 sm:h-9 sm:w-9 ${
        disabled
          ? "cursor-default opacity-35"
          : "animate-pulse-soft hover:border-[#C9DCFF] hover:bg-white hover:text-[#6C2EFF]"
      } ${side === "left" ? "-left-1.5 sm:-left-3" : "-right-1.5 sm:-right-3"}`}
    >
      <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2.4} aria-hidden="true" />
    </button>
  );
}
