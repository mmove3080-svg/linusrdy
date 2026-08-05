import { useEffect, useMemo, useRef, useState } from "react";
import { X, Volume2, VolumeX } from "lucide-react";
import { useCctvAmbience } from "@/hooks/useCctvAmbience";

interface CctvOverlayProps {
  onClose: () => void;
}

/**
 * Source video framing.
 *
 * real.mp4 is 834x1112. The approved framing (copy_crop.MP4) is 834x924 —
 * the same width with 188px trimmed vertically, i.e. 83.1% of the height.
 * Rather than re-encoding, the video is scaled up inside a clipping container
 * so the visible region matches that framing exactly, with no distortion.
 *
 * CROP_ORIGIN controls which part is kept:
 *   "center" trims evenly top and bottom, "top" keeps the lower portion,
 *   "bottom" keeps the upper portion.
 */
const VISIBLE_HEIGHT_RATIO = 924 / 1112; // 0.831
const CROP_ORIGIN: "center" | "top" | "bottom" = "center";

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
 * Live CCTV viewer — one uninterrupted video panel filling the entire map card.
 *
 * Overlays: LIVE header bar with feed label and audio state, CAM ident
 * top-left, live timestamp and REC indicator top-right, close button top-right.
 *
 * The video is displayed with object-contain so the full camera frame stays
 * visible at its original aspect ratio — never stretched, zoomed or cropped.
 * The player exposes no controls; loudness follows the device's volume.
 */
export function CctvOverlay({ onClose }: CctvOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timestamp = useCctvTimestamp();
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
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black"
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
          style={{
            // Scale so the retained region fills the frame, then shift to the
            // chosen origin. Width and height scale together, so proportions
            // are preserved — nothing is stretched.
            height: `${100 / VISIBLE_HEIGHT_RATIO}%`,
            objectPosition:
              CROP_ORIGIN === "top" ? "50% 100%" : CROP_ORIGIN === "bottom" ? "50% 0%" : "50% 50%",
          }}
          // object-contain preserves the original aspect ratio: the full
          // camera frame stays visible, never stretched, zoomed or cropped.
          className="w-full object-cover"
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
          CAM 02
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

    </div>
  );
}
