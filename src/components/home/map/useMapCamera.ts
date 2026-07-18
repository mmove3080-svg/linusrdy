import { useCallback, useRef, useState } from "react";
import { US_MAP_W, US_MAP_H } from "../usMapGeo";

const MIN_SCALE = 1;
const MAX_SCALE = 3;

/**
 * Map camera: zoom (+/−), center-on-point, and drag-to-pan when zoomed.
 * Same behavior as the homepage map's camera, extracted for reuse.
 */
export function useMapCamera() {
  const [camera, setCamera] = useState({ scale: 1, tx: 0, ty: 0 });
  const dragState = useRef<{ startX: number; startY: number; tx: number; ty: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const clamp = useCallback((scale: number, tx: number, ty: number) => {
    const minTx = US_MAP_W - scale * US_MAP_W;
    const minTy = US_MAP_H - scale * US_MAP_H;
    return { scale, tx: Math.min(0, Math.max(minTx, tx)), ty: Math.min(0, Math.max(minTy, ty)) };
  }, []);

  const zoomAt = useCallback(
    (factor: number) => {
      setCamera((c) => {
        const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, c.scale * factor));
        if (scale === MIN_SCALE) return { scale: 1, tx: 0, ty: 0 };
        const cx = (US_MAP_W / 2 - c.tx) / c.scale;
        const cy = (US_MAP_H / 2 - c.ty) / c.scale;
        return clamp(scale, US_MAP_W / 2 - scale * cx, US_MAP_H / 2 - scale * cy);
      });
    },
    [clamp],
  );

  const centerOn = useCallback(
    (x: number, y: number, minScale = 1.8) => {
      setCamera((c) => {
        const scale = Math.max(minScale, c.scale);
        return clamp(scale, US_MAP_W / 2 - scale * x, US_MAP_H / 2 - scale * y);
      });
    },
    [clamp],
  );

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (camera.scale === 1) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, tx: camera.tx, ty: camera.ty };
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = dragState.current;
    const svg = svgRef.current;
    if (!d || !svg) return;
    const unit = US_MAP_W / svg.clientWidth;
    setCamera((c) =>
      clamp(c.scale, d.tx + (e.clientX - d.startX) * unit, d.ty + (e.clientY - d.startY) * unit),
    );
  };
  const onPointerUp = () => (dragState.current = null);

  return {
    camera,
    svgRef,
    isDragging: () => dragState.current !== null,
    zoomAt,
    centerOn,
    canZoomIn: camera.scale < MAX_SCALE,
    canZoomOut: camera.scale > MIN_SCALE,
    pointerHandlers: { onPointerDown, onPointerMove, onPointerUp, onPointerLeave: onPointerUp },
  };
}
