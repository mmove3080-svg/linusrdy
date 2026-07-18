import { SectionHeader } from "./SectionHeader";
import { ServiceCard } from "./ServiceCard";
import { SERVICES } from "./servicesData";
import { SECTION_IDS } from "@/lib/constants";

/**
 * "What We Do — Six Core Logistics Services".
 * White futuristic background matching the site's map language: faint grid,
 * soft blue/violet radial tints, blueprint corner outlines, plus marks —
 * all subtle enough to read as intentional production design.
 */
export function ServicesSection() {
  return (
    <section
      id={SECTION_IDS.whatWeDo}
      aria-label="What we do"
      className="relative scroll-mt-24 overflow-hidden bg-white py-14 lg:py-20"
    >
      {/* ── White sci-fi backdrop ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* faint grid, fading toward the edges */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#EEF3FB_1px,transparent_1px),linear-gradient(to_bottom,#EEF3FB_1px,transparent_1px)] bg-[size:44px_44px] opacity-60
            [mask-image:radial-gradient(75%_70%_at_50%_45%,black,transparent)]"
        />
        {/* soft color tints */}
        <div className="absolute inset-0 bg-[radial-gradient(42%_36%_at_12%_10%,rgba(45,140,255,0.05),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(42%_36%_at_88%_88%,rgba(108,46,255,0.05),transparent)]" />
        {/* blueprint accents */}
        <svg className="absolute left-5 top-6 h-8 w-8 opacity-40" viewBox="0 0 32 32">
          <path d="M2 12V2h10" fill="none" stroke="#BFD6F2" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <svg className="absolute bottom-6 right-5 h-8 w-8 opacity-40" viewBox="0 0 32 32">
          <path d="M30 20v10H20" fill="none" stroke="#BFD6F2" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        {[
          "left-[14%] top-[22%]",
          "right-[16%] top-[30%]",
          "left-[10%] bottom-[18%]",
          "right-[12%] bottom-[26%]",
        ].map((pos) => (
          <svg key={pos} className={`absolute h-3 w-3 opacity-40 ${pos}`} viewBox="0 0 12 12">
            <g stroke="#BFD6F2" strokeWidth="1.2" strokeLinecap="round">
              <line x1="6" y1="1.5" x2="6" y2="10.5" />
              <line x1="1.5" y1="6" x2="10.5" y2="6" />
            </g>
          </svg>
        ))}
      </div>

      {/* Shared gradient for the service icons */}
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="ld-services-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2D8CFF" />
            <stop offset="100%" stopColor="#6C2EFF" />
          </linearGradient>
        </defs>
      </svg>

      <div className="shell relative">
        <SectionHeader />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-10 lg:gap-5 xl:grid-cols-3">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.number} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
