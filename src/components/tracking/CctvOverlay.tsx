import { useEffect, useMemo, useRef, useState } from "react";
import { X, Package, MapPin, Volume2, VolumeX } from "lucide-react";
import type { Shipment } from "@/types/shipment";
import type { ShipmentJourney } from "@/hooks/useShipmentJourney";
import { formatPlace } from "@/utils/format";
import { useCctvAmbience } from "@/hooks/useCctvAmbience";

interface CctvOverlayProps {
  shipment: Shipment;
  journey: ShipmentJourney;
  onClose: () => void;
}

/** "2026-10-20 Mon 21:05:09" — real date, 24-hour clock, ticking live. */
function useCctvTimestamp(): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const day = now.toLocaleDateString("en-US", { weekday: "short" });
    return (
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${day} ` +
      `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    );
  }, [now]);
}

/**
 * Live CCTV viewer — fills the entire map card.
 *
 * Recreates the reference overlay: LIVE header bar with feed label, CAM ident
 * top-left, live timestamp and REC indicator top-right, and a footer showing
 * the current stop (from the shared journey) and estimated arrival.
 *
 * The player deliberately exposes no controls: it autoplays, loops, and is
 * muted so browsers permit playback.
 */
export function CctvOverlay({ shipment, journey, onClose }: CctvOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timestamp = useCctvTimestamp();
  const current = journey.currentStep;
  const [audioBlocked, setAudioBlocked] = useState(false);

  // Synthesized room tone, camera servo and beacon, layered under the video's
  // own audio track. Loudness follows the device's volume controls.
  useCctvAmbience(!audioBlocked);

  // Play with sound as soon as the overlay opens. The overlay is only ever
  // opened by a click, which satisfies the browser's autoplay gesture
  // requirement; if a policy still blocks it we fall back to a muted loop.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1; // device volume governs actual loudness
    video.play().catch(() => {
      video.muted = true;
      setAudioBlocked(true);
      video.play().catch(() => {
        /* playback unavailable on this device */
      });
    });
  }, []);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Silence the video on unmount so nothing lingers after closing.
  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (video) {
        video.pause();
        video.muted = true;
      }
    };
  }, []);

  const stopName = current?.event.status ?? shipment.status;
  const stopPlace =
    formatPlace(current?.event.city, current?.event.state) ||
    shipment.currentLocation.city ||
    shipment.destination.city;

  const eta = shipment.deliveryWindow ?? shipment.estimatedDelivery ?? "";

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col overflow-hidden rounded-2xl bg-[#0B1533]"
      role="dialog"
      aria-label="Live delivery truck CCTV footage"
    >
      {/* ── Header bar ── */}
      <div className="flex shrink-0 items-center gap-3 px-3 py-2 sm:px-4 sm:py-2.5">
        <span className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          <span className="text-[13px] font-extrabold tracking-wide text-white sm:text-base">
            LIVE
          </span>
        </span>
        <span aria-hidden="true" className="h-4 w-px bg-white/25" />
        <span className="truncate text-[11px] font-medium text-white/70 sm:text-[13px]">
          Real-time Delivery Feed
        </span>
        <span
          className="hidden items-center gap-1.5 text-[10px] font-semibold text-white/55 sm:flex"
          title={
            audioBlocked
              ? "Tap the feed to enable audio"
              : "Audio live — use your device volume"
          }
        >
          {audioBlocked ? (
            <VolumeX className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          )}
          {audioBlocked ? "TAP FOR AUDIO" : "AUDIO"}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close live footage and return to the map"
          className="ml-auto rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
        >
          <X className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2.2} />
        </button>
      </div>

      {/* ── Video with overlays ── */}
      <div
        className="relative flex-1 overflow-hidden bg-black"
        onClick={() => {
          // Recovers audio if an autoplay policy muted the feed.
          const video = videoRef.current;
          if (video && audioBlocked) {
            video.muted = false;
            void video.play();
            setAudioBlocked(false);
          }
        }}
      >
        <video
          ref={videoRef}
          src="/media/truck-cctv.mp4"
          className="h-full w-full object-cover"
          autoPlay
          loop
          playsInline
          // No controls at all: no fullscreen, play, pause or volume slider.
          // Loudness is governed entirely by the device's own volume controls.
          controls={false}
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
        />

        {/* CAM ident */}
        <span className="pointer-events-none absolute left-3 top-2.5 text-[13px] font-extrabold tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] sm:text-lg">
          CAM 04
        </span>

        {/* Timestamp + REC */}
        <div className="pointer-events-none absolute right-3 top-2.5 text-right">
          <p className="font-mono text-[10px] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] sm:text-[13px]">
            {timestamp}
          </p>
          <p className="mt-1 flex items-center justify-end gap-1.5 text-[10px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] sm:text-xs">
            <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            REC
          </p>
        </div>
      </div>

      {/* ── Footer: current stop + ETA ── */}
      <div className="flex items-center gap-3 border-t border-white/10 bg-white/95 px-3 py-2 backdrop-blur sm:px-4 sm:py-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas-tint text-ink sm:h-9 sm:w-9">
          <Package className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-wider text-ink-faint sm:text-[11px]">
            Current Stop
          </p>
          <p className="truncate text-[12px] font-extrabold text-ink sm:text-[15px]">{stopName}</p>
          <p className="flex items-center gap-1 truncate text-[10px] text-ink-soft sm:text-xs">
            <MapPin className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden="true" />
            {stopPlace}
          </p>
        </div>
        <span aria-hidden="true" className="h-8 w-px bg-canvas-line" />
        <div className="text-right">
          <p className="text-[9px] font-bold uppercase tracking-wider text-ink-faint sm:text-[11px]">
            Est. Arrival
          </p>
          <p className="text-[12px] font-extrabold text-ink sm:text-[15px]">{eta || "—"}</p>
          <p className="text-[10px] font-semibold text-brand-600 sm:text-xs">
            {journey.delivered ? "Delivered" : "Today"}
          </p>
        </div>
      </div>
    </div>
  );
}
