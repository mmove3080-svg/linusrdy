import { motion } from "framer-motion";
import { AnimatedWorldMap } from "./AnimatedWorldMap";
import { TrackingCard } from "@/components/tracking/TrackingCard";
import { SECTION_IDS } from "@/lib/constants";
import vanImage from "@/assets/van.png";

interface HeroProps {
  onTrack: (trackingNumber: string) => void;
  trackingLoading?: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

/**
 * Hero — left: two-line headline (second line blue), supporting copy,
 * tracking card. Right: animated dot-matrix world map with live delivery
 * routes, faint skyline wash, and the delivery van floating above its shadow.
 */
export function Hero({ onTrack, trackingLoading }: HeroProps) {
  return (
    <section
      id={SECTION_IDS.home}
      aria-label="Home"
      className="relative overflow-hidden bg-white pb-10 pt-32 sm:pt-36"
    >
      {/* Skyline wash — faint blue city silhouette across the lower hero */}
      <Skyline />

      <div className="shell relative grid items-center gap-10 lg:grid-cols-[44%_56%]">
        {/* ── Left column ── */}
        <div className="relative z-10">
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="text-display-sm text-ink sm:text-display-md xl:text-display-lg"
          >
            Discreet Delivery.
            <span className="block text-brand-600">Delivered with Care.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft"
          >
            Private, secure, and on-time delivery services you can trust—every time.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            id={SECTION_IDS.track}
            className="mt-8 scroll-mt-32"
          >
            <TrackingCard onTrack={onTrack} loading={trackingLoading} />
          </motion.div>
        </div>

        {/* ── Right column: map + van ── */}
        <div className="relative min-h-[320px] sm:min-h-[420px] lg:min-h-[520px]">
          <div className="absolute inset-0 -top-8">
            <AnimatedWorldMap />
          </div>

          {/* Delivery van — floats with subtle suspension movement */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 bottom-0 flex justify-center lg:justify-end lg:pr-4"
          >
            <div className="relative w-[88%] max-w-xl animate-suspension">
              <img
                src={vanImage}
                alt="Linus Delivery van"
                loading="eager"
                fetchPriority="high"
                className="relative z-10 w-full select-none drop-shadow-xl"
                draggable={false}
              />
              {/* Ground shadow + reflection */}
              <div
                aria-hidden="true"
                className="absolute -bottom-3 left-1/2 h-8 w-[78%] -translate-x-1/2 rounded-[100%] bg-ink/15 blur-xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** Faint blue city skyline across the lower hero, fading into white. */
function Skyline() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-56 opacity-[0.10]">
      <svg viewBox="0 0 1440 220" preserveAspectRatio="none" className="h-full w-full">
        <path
          fill="#2145E6"
          d="M0 220V150h40v-30h30v30h25V95h35v55h20v-70h45v70h30v-40h25v40h50V60h15V40h20v20h15v90h40v-55h35v55h30v-85h45v85h25v-35h30v35h55V70h40v80h30v-50h25v50h45V55h15V30h20v25h15v95h40v-60h35v60h30v-90h45v90h25v-40h30v40h50V85h40v65h30v-45h25v45h45v-70h35v70h20v-30h30v30h40v70H0Z"
        />
        {/* fade to white toward the top */}
        <rect x="0" y="0" width="1440" height="120" fill="url(#sky-fade)" />
        <defs>
          <linearGradient id="sky-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
