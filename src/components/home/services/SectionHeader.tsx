import { motion } from "framer-motion";

/**
 * Section header per reference: capsule badge with purple dot, 800-weight
 * heading with blue→purple gradient on "Logistics Services", 720px subtitle,
 * gradient divider with glowing end dots.
 */
export function SectionHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="text-center"
    >
      {/* Badge */}
      <span className="inline-flex h-[46px] items-center gap-2.5 rounded-full border border-[#E6E9FF] bg-white px-[30px] shadow-soft">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#6C2EFF]" />
        <span className="text-[15px] font-medium tracking-[0.08em] text-gray-700">
          WHAT WE DO
        </span>
      </span>

      {/* Heading */}
      <h2 className="mt-[26px] text-[38px] font-extrabold leading-[1.05] tracking-tight text-[#0F172A] lg:text-[64px]">
        Six Core{" "}
        <span className="bg-gradient-to-r from-[#2D8CFF] to-[#6C2EFF] bg-clip-text text-transparent">
          Logistics Services
        </span>
      </h2>

      {/* Subtitle */}
      <p className="mx-auto mt-[26px] max-w-[720px] text-lg leading-[1.7] text-[#6B7280] lg:text-[22px]">
        End-to-end logistics solutions designed to move your business forward.
        <br />
        Efficient. Reliable. Everywhere.
      </p>

      {/* Divider */}
      <div className="mt-[26px] flex items-center justify-center gap-0" aria-hidden="true">
        <span className="h-[5px] w-[5px] rounded-full bg-[#2D8CFF] shadow-[0_0_6px_rgba(45,140,255,0.8)]" />
        <span className="h-px w-[60px] bg-gradient-to-r from-[#2D8CFF] to-[#6C2EFF]" />
        <span className="h-[5px] w-[5px] rounded-full bg-[#6C2EFF] shadow-[0_0_6px_rgba(108,46,255,0.8)]" />
      </div>
    </motion.div>
  );
}
