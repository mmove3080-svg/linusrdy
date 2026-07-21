import { BRAND } from "@/lib/constants";
import logoImage from "@/assets/logo.png";

/** Official Linus Delivery logo (provided asset). Click scrolls to top. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <a
      href="#home"
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className={`flex items-center ${className}`}
      aria-label={`${BRAND.name} ${BRAND.suffix} — back to top`}
    >
      <img
        src={logoImage}
        alt={`${BRAND.name} ${BRAND.suffix}`}
        className="h-9 w-auto select-none sm:h-10"
        draggable={false}
      />
    </a>
  );
}
