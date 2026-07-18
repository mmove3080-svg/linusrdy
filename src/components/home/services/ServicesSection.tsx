import { SectionHeader } from "./SectionHeader";
import { ServiceCard } from "./ServiceCard";
import { SERVICES } from "./servicesData";
import { SECTION_IDS } from "@/lib/constants";
import bgLeft from "@/assets/services-bg-left.webp";
import bgRight from "@/assets/services-bg-right.webp";

/**
 * "What We Do — Six Core Logistics Services", recreated from the reference.
 * The faded background photographs are the ACTUAL pixels extracted from the
 * reference image (left: delivery handshake, right: warehouse), masked into
 * the white canvas with soft radial glows.
 */
export function ServicesSection() {
  return (
    <section
      id={SECTION_IDS.whatWeDo}
      aria-label="What we do"
      className="relative scroll-mt-24 overflow-hidden bg-white pb-20 pt-[72px] lg:pb-[120px] lg:pt-[100px]"
    >
      {/* ── Background: extracted reference photography + white glows ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <img
          src={bgLeft}
          alt=""
          loading="lazy"
          className="absolute left-0 top-0 h-full w-[24%] object-cover blur-[2px] [mask-image:linear-gradient(to_right,black_35%,transparent)] sm:w-[19%]"
        />
        <img
          src={bgRight}
          alt=""
          loading="lazy"
          className="absolute right-0 top-0 h-full w-[24%] object-cover blur-[2px] [mask-image:linear-gradient(to_left,black_35%,transparent)] sm:w-[19%]"
        />
        {/* Apple-style radial white glow overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,white_30%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_45%_at_50%_100%,white_25%,transparent_100%)]" />
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

      <div className="relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <SectionHeader />

        {/* Cards: 3 / 2 / 1 columns, 28px gap, divider→cards 55px */}
        <div className="mt-[55px] grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.number} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
