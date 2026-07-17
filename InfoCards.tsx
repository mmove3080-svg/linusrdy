import { BRAND } from "@/lib/constants";

/** Shield + "L" mark with the two-line wordmark, matching the reference. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <a
      href="#home"
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className={`flex items-center gap-3 ${className}`}
      aria-label={`${BRAND.name} ${BRAND.suffix} — back to top`}
    >
      <svg viewBox="0 0 32 32" className="h-11 w-11" aria-hidden="true">
        <path
          d="M16 2 5 7v10c0 7 4.8 11.6 11 13 6.2-1.4 11-6 11-13V7L16 2Z"
          fill="none"
          stroke="#2145E6"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path d="M12 10h3.2v8.2H21v3h-9V10Z" fill="#2145E6" />
      </svg>
      <span className="leading-none">
        <span className="block text-2xl font-extrabold tracking-tight text-ink">{BRAND.name}</span>
        <span className="block text-lg font-medium tracking-tight text-ink">{BRAND.suffix}</span>
      </span>
    </a>
  );
}
