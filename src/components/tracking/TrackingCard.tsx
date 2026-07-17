import { useEffect, useRef, useState } from "react";
import { Package, ShieldCheck } from "lucide-react";
import { onTrackingFocusRequest } from "./trackingFocus";

interface TrackingCardProps {
  onTrack: (trackingNumber: string) => void;
  loading?: boolean;
}

/**
 * Hero tracking card — the primary action on the page.
 * White rounded card, package icon, input, blue TRACK PACKAGE button,
 * privacy reassurance row beneath. The navbar "Track" link focuses the
 * input and triggers a brief glow animation.
 */
export function TrackingCard({ onTrack, loading = false }: TrackingCardProps) {
  const [value, setValue] = useState("");
  const [glow, setGlow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(
    () =>
      onTrackingFocusRequest(() => {
        inputRef.current?.focus();
        setGlow(true);
        window.setTimeout(() => setGlow(false), 1600);
      }),
    [],
  );

  const submit = () => {
    if (!value.trim() || loading) return;
    onTrack(value);
  };

  return (
    <div className="card w-full max-w-xl p-4 sm:p-5">
      <div
        className={`flex items-stretch gap-2 rounded-2xl border border-canvas-line bg-white p-1.5 transition-shadow duration-300 focus-within:border-brand-300 focus-within:shadow-glowInput ${
          glow ? "border-brand-300 shadow-glowInput" : ""
        }`}
      >
        <div className="flex items-center pl-3 text-brand-600" aria-hidden="true">
          <Package className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="Enter Tracking Number"
          aria-label="Tracking number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="min-w-0 flex-1 bg-transparent px-2 text-[15px] font-semibold text-ink outline-none ring-0 placeholder:text-ink-faint focus-visible:ring-0"
        />
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="btn-primary shrink-0 rounded-xl px-4 py-3 text-xs sm:px-6 sm:text-sm"
        >
          {loading ? "Tracking…" : "Track Package"}
        </button>
      </div>

      <div className="mt-4 flex items-start gap-3 px-1">
        <span className="mt-0.5 text-brand-600" aria-hidden="true">
          <ShieldCheck className="h-6 w-6" strokeWidth={1.8} />
        </span>
        <p className="text-sm leading-relaxed text-ink-soft">
          <span className="font-semibold text-ink">Your privacy is our priority.</span>
          <br />
          All deliveries are 100% discreet and secure.
        </p>
      </div>
    </div>
  );
}
