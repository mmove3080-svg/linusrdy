import { useEffect, useMemo, useRef, useState } from "react";
import { X, Volume2, VolumeX } from "lucide-react";
import { useCctvAmbience } from "@/hooks/useCctvAmbience";

interface CctvOverlayProps {
  onClose: () => void;
}

/**
 * Source framing.
 *
 * real.mp4 is 834x1112 (portrait). A perfect square crop takes the full width
 * and 834px of height — 75% of the frame. The retained region is biased toward
 * the top so it begins at the observation windows on the rear doors and ends
 * at the metal bench bases.
 *
 * CROP_Y_PERCENT is the vertical anchor passed to object-position:
 *   0% keeps the very top, 50% centres, 100% keeps the bottom.
 * Adjust this single value if the framing needs nudging.
 */
const CROP_Y_PERCENT = 22;

/** "2026-10-20 Mon 21:05:09" — real date, 24-hour clock, ticking live. */
function useCctvTimestamp(): { date: string; time: string } {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const weekday = now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    return {
      date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${weekday}`,
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    };
  }, [now]);
}

/**
 * Live CCTV viewer — a square surveillance panel covering the map card,
 * including the Live Map / Shipment Details tab headings.
 *
 * The footage is square-cropped, given a subtle surveillance treatment
 * (desaturation, lifted contrast, vignette, scanlines, sensor noise) and a
 * 70% dark grade blended into the image so it reads as part of the original
 * recording rather than a layer on top of it.
 */
export function CctvOverlay({ onClose }: CctvOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { date, time } = useCctvTimestamp();
  const [audioBlocked, setAudioBlocked] = useState(false);

  // Synthesized room tone, DVR noise and status beeps, layered under the
  // video's own audio. Loudness follows the device's volume controls.
  useCctvAmbience(!audioBlocked);

  // Play with sound as soon as the overlay opens. The overlay is only opened
  // by a click, satisfying the browser's autoplay gesture requirement; if a
  // policy still blocks it we fall back to a muted loop.
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
      className="absolute inset-0 z-30 flex flex-col overflow-hidden rounded-2xl bg-[#080D1C]"
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
            audioBlocked ? "Tap the feed to enable audio" : "Audio live — use your device volume"
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

      {/* ── Square surveillance panel ── */}
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
        {/* The square frame: sized by the shorter axis so it always fits
            exactly, with no bars or empty margin inside it. */}
        <div
          className="relative aspect-square h-full max-h-full w-auto max-w-full overflow-hidden"
          style={{ containerType: "inline-size" }}
        >
          <video
            ref={videoRef}
            src="/media/truck-cctv.mp4"
            className="h-full w-full object-cover"
            style={{
              // Square crop from a portrait source: full width, anchored high
              // so the frame runs from the observation windows down to the
              // bench bases. Proportions are untouched.
              objectPosition: `50% ${CROP_Y_PERCENT}%`,
              // Surveillance-camera treatment: slightly desaturated, lifted
              // contrast and a cooler cast, as commercial CCTV sensors render.
              filter: "saturate(0.72) contrast(1.14) brightness(0.94)",
            }}
            autoPlay
            loop
            playsInline
            // No controls at all: no fullscreen, play, pause or volume slider.
            controls={false}
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
          />

          {/* Lens vignette — darker corners, as surveillance optics produce. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.5) 100%)",
            }}
          />

          {/* Interlace scanlines — very fine, low opacity. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)",
            }}
          />

          {/* Sensor noise — static grain typical of low-light CCTV. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          {/* ── Overlay graphics, inside the video frame ── */}
          {/* CAM ident */}
          <span
            className="pointer-events-none absolute left-[3%] top-[3%] font-mono text-[clamp(11px,2.6cqw,20px)] font-bold tracking-widest text-white/90"
            style={{ textShadow: "0 0 4px rgba(0,0,0,0.95), 0 1px 2px rgba(0,0,0,0.9)" }}
          >
            CAM 02
          </span>

          {/* Date and time top-right, with the REC indicator beneath them —
              the arrangement commercial DVR systems use. */}
          <div
            className="pointer-events-none absolute right-[3%] top-[3%] text-right font-mono text-[clamp(10px,2.2cqw,17px)] font-bold text-white/90"
            style={{ textShadow: "0 0 4px rgba(0,0,0,0.95), 0 1px 2px rgba(0,0,0,0.9)" }}
          >
            <span className="block tracking-wider">
              {date} {time}
            </span>
            <span className="mt-1 flex items-center justify-end gap-1.5 tracking-widest">
              <span className="inline-flex h-[0.55em] w-[0.55em] animate-pulse rounded-full bg-red-500" />
              REC
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
