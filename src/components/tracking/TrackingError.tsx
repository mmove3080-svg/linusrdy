import { motion } from "framer-motion";
import { PackageX, RotateCcw } from "lucide-react";

interface TrackingErrorProps {
  message: string;
  trackingNumber?: string;
  onTrackAnother: () => void;
}

/**
 * Professional empty/error state: illustrated icon, clear explanation, and a
 * prominent action returning the customer to the tracking input.
 */
export function TrackingError({ message, trackingNumber, onTrackAnother }: TrackingErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      role="alert"
      className="card rounded-2xl px-6 py-10 text-center sm:py-12"
    >
      {/* Illustration */}
      <span className="relative mx-auto flex h-20 w-20 items-center justify-center" aria-hidden="true">
        <span className="absolute inset-0 rounded-full bg-brand-50" />
        <span className="absolute inset-2 rounded-full border border-dashed border-brand-200" />
        <PackageX className="relative h-9 w-9 text-brand-600" strokeWidth={1.5} />
      </span>

      <h3 className="mt-5 text-lg font-extrabold text-ink">No shipment found</h3>

      <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-ink-soft">{message}</p>

      {trackingNumber && (
        <p className="mx-auto mt-3 inline-block rounded-lg bg-canvas-tint px-3 py-1.5 font-mono text-xs font-semibold text-ink-soft">
          {trackingNumber}
        </p>
      )}

      <p className="mx-auto mt-4 max-w-sm text-[12px] leading-relaxed text-ink-faint">
        Double-check the number for typos, or allow up to 24 hours after dispatch for a new
        shipment to appear in our system.
      </p>

      <button
        type="button"
        onClick={onTrackAnother}
        className="btn-primary mx-auto mt-6 rounded-xl px-6 py-3 text-xs sm:text-sm"
      >
        <RotateCcw className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
        Track Another Shipment
      </button>
    </motion.div>
  );
}
