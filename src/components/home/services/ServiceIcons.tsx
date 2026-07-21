export type ServiceIconId =
  | "freight"
  | "forwarding"
  | "warehousing"
  | "supply-chain"
  | "customs"
  | "last-mile";

/**
 * Custom-drawn futuristic line icons for the six services.
 * Single stroke weight, rounded joins, stroked with the shared
 * blue→purple gradient (#ld-services-gradient) for a cohesive sci-fi feel.
 */
export function ServiceIcon({ id, className }: { id: ServiceIconId; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="url(#ld-services-gradient)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[id]}
    </svg>
  );
}

const ICONS: Record<ServiceIconId, JSX.Element> = {
  // Speeding freight truck
  freight: (
    <>
      <path d="M6.5 16V8.2a1 1 0 0 1 1-1H15V16" />
      <path d="M15 10h3.4a1 1 0 0 1 .78.37l1.86 2.33a1 1 0 0 1 .22.62V16h-1.5" />
      <circle cx="9.4" cy="17.1" r="1.7" />
      <circle cx="17.6" cy="17.1" r="1.7" />
      <path d="M6.5 16h1.2M11.1 17.1h4.8" />
      <path d="M1.8 9.2h2.6M1.8 12.4h1.7M1.8 15.6h2.6" />
    </>
  ),
  // Globe with orbiting shipment node
  forwarding: (
    <>
      <circle cx="12" cy="11" r="6.6" />
      <path d="M12 4.4c-2.4 1.9-2.4 11.3 0 13.2M12 4.4c2.4 1.9 2.4 11.3 0 13.2" />
      <path d="M5.6 11h12.8" />
      <path d="M3.4 16.6c2.5 2.7 14.7 2.7 17.2 0" />
      <circle cx="20.4" cy="16.7" r="1.15" fill="url(#ld-services-gradient)" stroke="none" />
    </>
  ),
  // Warehouse with loading bay and shelf marks
  warehousing: (
    <>
      <path d="M3.4 19V9.4L12 4.2l8.6 5.2V19" />
      <path d="M2 19h20" />
      <path d="M9.4 19v-5.4h5.2V19" />
      <path d="M6 11.6h2.4M15.6 11.6H18" />
    </>
  ),
  // Connected network nodes
  "supply-chain": (
    <>
      <circle cx="5.2" cy="6.6" r="2.1" />
      <circle cx="18.8" cy="6.6" r="2.1" />
      <circle cx="12" cy="17.4" r="2.1" />
      <path d="M7.3 6.6h9.4M6.2 8.5l4.7 7.1M17.8 8.5l-4.7 7.1" />
      <circle cx="5.2" cy="6.6" r="0.4" fill="url(#ld-services-gradient)" stroke="none" />
      <circle cx="18.8" cy="6.6" r="0.4" fill="url(#ld-services-gradient)" stroke="none" />
      <circle cx="12" cy="17.4" r="0.4" fill="url(#ld-services-gradient)" stroke="none" />
    </>
  ),
  // Compliance shield with scan curve
  customs: (
    <>
      <path d="M12 3.2 18.6 6v4.9c0 4.3-2.8 7.2-6.6 8.9-3.8-1.7-6.6-4.6-6.6-8.9V6L12 3.2Z" />
      <path d="M9 11.4l2.2 2.2 3.9-4.2" />
      <path d="M8.4 16.1c2.3 1.2 4.9 1.2 7.2 0" />
    </>
  ),
  // Destination pin with delivery bolt
  "last-mile": (
    <>
      <path d="M12 20.8s-6.3-5.2-6.3-10A6.3 6.3 0 1 1 18.3 10.8c0 4.8-6.3 10-6.3 10Z" />
      <path d="M13.3 7.4 10.4 11h2.9l-1.9 3.2" />
    </>
  ),
};
