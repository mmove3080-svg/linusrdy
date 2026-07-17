import { motion } from "framer-motion";
import { USDeliveryMap } from "./map/USDeliveryMap";
import { TrackingCard } from "@/components/tracking/TrackingCard";
import { SECTION_IDS } from "@/lib/constants";

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
 * tracking card (full size preserved). Right: the animated US delivery
 * network — 50 randomized shipments with glowing routes and green
 * Delivered completions.
 */
export function Hero({ onTrack, trackingLoading }: HeroProps) {
  return (
    <section
      id={SECTION_IDS.home}
      aria-label="Home"
      className="relative overflow-hidden bg-white pb-6 pt-24 sm:pb-8 sm:pt-32"
    >
      <div className="shell relative grid items-center gap-6 lg:grid-cols-[0.42fr_0.58fr] lg:gap-8">
        {/* ── Left column ── */}
        <div className="relative z-10">
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="text-lg font-extrabold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[2rem] sm:leading-[1.12] xl:text-[2.5rem]"
          >
            Discreet Delivery.
            <span className="block text-brand-600">Delivered with Care.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="mt-4 max-w-md text-[13px] leading-snug tracking-[-0.01em] text-ink-soft lg:max-w-none xl:whitespace-nowrap"
          >
            Legal, Private, secure, and on-time delivery services you can trust—every time.
          </motion.p>

          {/* Tracking card — size intentionally preserved (primary action) */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            id={SECTION_IDS.track}
            className="mt-6 scroll-mt-28 sm:mt-7"
          >
            <TrackingCard onTrack={onTrack} loading={trackingLoading} />
          </motion.div>
        </div>

        {/* ── Right column: animated US delivery network ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-[240px] w-full sm:h-[380px] lg:h-[460px]"
        >
          <USDeliveryMap />
        </motion.div>
      </div>
    </section>
  );
}
