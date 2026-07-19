import { motion } from "framer-motion";
import { Users, Package, Globe, ShieldCheck, Headphones } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { STATISTICS, type Statistic } from "./reviewsData";
import { useCountUp } from "@/hooks/useCountUp";

const ICONS: Record<Statistic["icon"], LucideIcon> = {
  users: Users,
  package: Package,
  globe: Globe,
  shield: ShieldCheck,
  support: Headphones,
};

/**
 * Statistics bar: single rounded container, five items with hexagonal
 * gradient-outline icon chips. Numbers count up when scrolled into view.
 */
export function StatisticsBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="card overflow-hidden rounded-2xl"
    >
      <div className="grid grid-cols-2 gap-px bg-canvas-line sm:grid-cols-3 lg:grid-cols-5">
        {STATISTICS.map((stat) => (
          <StatisticItem key={stat.label} stat={stat} />
        ))}
      </div>
    </motion.div>
  );
}

function StatisticItem({ stat }: { stat: Statistic }) {
  const Icon = ICONS[stat.icon];
  const { ref, value } = useCountUp(stat.value);
  const display = stat.literal
    ? stat.literal
    : stat.divisor
      ? (value / stat.divisor).toFixed(1)
      : value.toLocaleString("en-US");

  return (
    <div className="flex items-center gap-2.5 bg-white px-3 py-3 last:col-span-2 sm:last:col-span-1 sm:px-4">
      {/* Hexagonal gradient-outline icon chip */}
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center bg-gradient-to-br from-[#2D8CFF]/60 to-[#6C2EFF]/60 p-px"
        style={{ clipPath: "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)" }}
      >
        <span
          className="flex h-full w-full items-center justify-center bg-white"
          style={{ clipPath: "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)" }}
        >
          <Icon className="h-4 w-4 text-[#5A5BF7]" strokeWidth={1.8} aria-hidden="true" />
        </span>
      </span>
      <div className="min-w-0">
        <p className="text-[15px] font-extrabold leading-tight text-[#0F172A]">
          <span ref={ref}>{display}</span>
          {stat.suffix}
        </p>
        <p className="truncate text-[10px] font-semibold text-ink-soft">{stat.label}</p>
      </div>
    </div>
  );
}
