import { motion } from "framer-motion";
import { PackageSearch } from "lucide-react";

/**
 * Loading experience: an indeterminate progress bar plus skeleton placeholders
 * that mirror the real dashboard layout, so the transition to results is
 * visually seamless.
 */
export function LoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
      role="status"
      aria-live="polite"
      aria-label="Looking up your shipment"
    >
      {/* Progress header */}
      <div className="card overflow-hidden rounded-2xl">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <PackageSearch className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </span>
          <p className="text-sm font-bold text-ink">Locating your shipment…</p>
        </div>
        <div className="h-1 w-full overflow-hidden bg-canvas-line">
          <motion.div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Banner skeleton */}
      <div className="card overflow-hidden rounded-2xl">
        <div className="grid gap-px bg-canvas-line sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 bg-white px-4 py-3.5">
              <Shimmer className="h-9 w-9 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Shimmer className="h-2 w-16 rounded" />
                <Shimmer className="h-3 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Body skeleton */}
      <div className="grid gap-4 lg:grid-cols-[minmax(280px,34%)_1fr]">
        <div className="card space-y-4 rounded-2xl p-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <Shimmer className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5 pt-1">
                <Shimmer className="h-3 w-2/3 rounded" />
                <Shimmer className="h-2.5 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <Shimmer className="h-[300px] w-full rounded-2xl" />
          <div className="card space-y-3 rounded-2xl p-5">
            {[0, 1, 2, 3].map((i) => (
              <Shimmer key={i} className="h-3 w-full rounded" />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Shimmer({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`block animate-pulse bg-canvas-tint ${className}`} />;
}
