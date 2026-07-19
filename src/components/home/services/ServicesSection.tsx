import { SectionHeader } from "./SectionHeader";
import { ServiceCard } from "./ServiceCard";
import { SERVICES } from "./servicesData";
import { SECTION_IDS } from "@/lib/constants";
import { SciFiBackdrop } from "@/components/ui/SciFiBackdrop";

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
      className="relative scroll-mt-24 overflow-hidden bg-white py-9 lg:py-12"
    >
      <SciFiBackdrop />

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
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:mt-8 xl:grid-cols-3">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.number} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
