import { useEffect, useRef, useState } from "react";

/** Marker/label scale factor: 1 on desktop, 1.55 on small screens for readability. */
export function useMapScale() {
  const [k, setK] = useState(1);
  const kRef = useRef(1);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => setK(mq.matches ? 1.55 : 1);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  kRef.current = k;
  return { k, kRef };
}
