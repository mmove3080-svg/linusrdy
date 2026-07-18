import { motion } from "framer-motion";

/**
 * Section header, scaled to the site's established hierarchy (tracking
 * section as reference): compact badge, heading in the hero's range,
 * body-scale subtitle, gradient divider.
 */
export function SectionHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="text-center"
    >
      {/* Badge */}
      <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[#E6E9FF] bg-white px-3.5 shadow-soft">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#6C2EFF]" />
        <span className="text-[10px] font-bold tracking-[0.12em] text-ink-soft">WHAT WE DO</span>
      </span>

      {/* Heading — hero-scale, not display-scale */}
      <h2 className="mt-3 text-xl font-extrabold leading-[1.12] tracking-[-0.02em] text-[#0F172A] sm:text-2xl xl:text-3xl">
        Six Core{" "}
        <span className="bg-gradient-to-r from-[#2D8CFF] to-[#6C2EFF] bg-clip-text text-transparent">
          Logistics Services
        </span>
      </h2>

      {/* Subtitle — body scale */}
      <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-ink-soft sm:text-[13px]">
        End-to-end logistics solutions designed to move your business forward.
        <br className="hidden sm:block" /> Efficient. Reliable. Everywhere.
      </p>

      {/* Divider */}
      <div className="mt-4 flex items-center justify-center" aria-hidden="true">
        <span className="h-1 w-1 rounded-full bg-[#2D8CFF] shadow-[0_0_5px_rgba(45,140,255,0.8)]" />
        <span className="h-px w-12 bg-gradient-to-r from-[#2D8CFF] to-[#6C2EFF]" />
        <span className="h-1 w-1 rounded-full bg-[#6C2EFF] shadow-[0_0_5px_rgba(108,46,255,0.8)]" />
      </div>
    </motion.div>
  );
}
