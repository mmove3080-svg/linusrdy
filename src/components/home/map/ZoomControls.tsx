import { Plus, Minus, LocateFixed } from "lucide-react";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
}

/**
 * Floating map controls (right side): locate button on top, +/− stack below.
 * White rounded buttons, soft shadow, blue icons, hover lift — per reference.
 */
export function ZoomControls({ onZoomIn, onZoomOut, onLocate, canZoomIn, canZoomOut }: ZoomControlsProps) {
  return (
    <div className="pointer-events-auto absolute right-2 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2.5 sm:right-3">
      <button
        type="button"
        onClick={onLocate}
        aria-label="Center on active shipment"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-canvas-line bg-white text-brand-600 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift active:scale-95"
      >
        <LocateFixed className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
      </button>

      <div className="flex flex-col overflow-hidden rounded-xl border border-canvas-line bg-white shadow-card">
        <button
          type="button"
          onClick={onZoomIn}
          disabled={!canZoomIn}
          aria-label="Zoom in"
          className="flex h-10 w-10 items-center justify-center text-brand-600 transition-colors duration-150 hover:bg-brand-50 active:bg-brand-100 disabled:text-ink-faint disabled:hover:bg-white"
        >
          <Plus className="h-[1.125rem] w-[1.125rem]" strokeWidth={2.2} />
        </button>
        <span aria-hidden="true" className="mx-2 h-px bg-canvas-line" />
        <button
          type="button"
          onClick={onZoomOut}
          disabled={!canZoomOut}
          aria-label="Zoom out"
          className="flex h-10 w-10 items-center justify-center text-brand-600 transition-colors duration-150 hover:bg-brand-50 active:bg-brand-100 disabled:text-ink-faint disabled:hover:bg-white"
        >
          <Minus className="h-[1.125rem] w-[1.125rem]" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
