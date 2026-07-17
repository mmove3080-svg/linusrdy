import { motion } from "framer-motion";
import { ArrowRight, PackageCheck, Smartphone, PackageX, Handshake } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SECTION_IDS } from "@/lib/constants";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { requestTrackingFocus } from "@/components/tracking/trackingFocus";

interface InfoCard {
  icon: LucideIcon;
  headline: [string, string, string]; // [before, blueAccent, after]
  lines: string[];
  targetId: string;
  focusTracking?: boolean;
}

const CARDS: InfoCard[] = [
  {
    icon: PackageCheck,
    headline: ["Your ", "Discreet", " Package."],
    lines: ["Handled with privacy.", "Delivered with care."],
    targetId: SECTION_IDS.whatWeDo,
  },
  {
    icon: Smartphone,
    headline: ["Smarter ", "Tracking", "."],
    lines: ["Real-time updates.", "Total visibility."],
    targetId: SECTION_IDS.track,
    focusTracking: true,
  },
  {
    icon: PackageX,
    headline: ["Delivered ", "Quietly", "."],
    lines: ["No labels. No attention.", "Just delivery."],
    targetId: SECTION_IDS.whyChooseUs,
  },
  {
    icon: Handshake,
    headline: ["Our ", "Promise", "."],
    lines: ["Your trust.", "Our commitment.", "Always."],
    targetId: SECTION_IDS.reviews,
  },
];

/**
 * Four equal info cards: illustration area, headline with blue accent word,
 * short blue underline, description lines, circular arrow button bottom-right.
 */
export function InfoCards() {
  const scrollTo = useSmoothScroll();

  return (
    <section aria-label="Highlights" className="shell pb-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CARDS.map(({ icon: Icon, headline, lines, targetId, focusTracking }, i) => (
          <motion.article
            key={headline.join("")}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="card group relative flex gap-4 rounded-2xl p-[1.125rem] transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            {/* Illustration */}
            <div className="relative flex h-[4.6rem] w-[4.6rem] shrink-0 items-center justify-center">
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full border border-brand-100 opacity-70 transition-transform duration-300 group-hover:scale-110"
              />
              <span
                aria-hidden="true"
                className="absolute inset-2.5 rounded-full border border-dashed border-brand-200 opacity-60"
              />
              <Icon className="relative h-8 w-8 text-brand-600" strokeWidth={1.5} aria-hidden="true" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <h3 className="text-[15px] font-extrabold leading-snug text-ink">
                {headline[0]}
                <span className="text-brand-600">{headline[1]}</span>
                {headline[2]}
              </h3>
              <span aria-hidden="true" className="mt-1.5 h-0.5 w-7 rounded-full bg-brand-600" />
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                {lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>

              <button
                type="button"
                onClick={() =>
                  scrollTo(targetId, focusTracking ? requestTrackingFocus : undefined)
                }
                aria-label={`Learn more: ${headline.join("")}`}
                className="mt-auto flex h-8 w-8 items-center justify-center self-end rounded-full border border-canvas-line bg-white text-brand-600 shadow-soft transition-all duration-200 hover:bg-brand-600 hover:text-white group-hover:translate-x-0.5"
              >
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
