import { Truck, Ship, Warehouse, ClipboardCheck, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Service {
  number: string;
  icon: LucideIcon;
  /** 06 gets speed lines drawn beside the truck */
  fast?: boolean;
  title: string;
  description: string;
}

/** The six core services — copy taken verbatim from the reference. */
export const SERVICES: Service[] = [
  {
    number: "01",
    icon: Truck,
    title: "Freight Transportation",
    description: "Fast, safe, and reliable transport by road, air, and sea.",
  },
  {
    number: "02",
    icon: Ship,
    title: "Global Freight Forwarding",
    description: "Seamless international shipping with expert handling and full visibility.",
  },
  {
    number: "03",
    icon: Warehouse,
    title: "Warehousing & Distribution",
    description: "Secure storage and smart distribution solutions tailored to your needs.",
  },
  {
    number: "04",
    icon: ClipboardCheck,
    title: "Supply Chain Management",
    description: "Integrated supply chain solutions that improve efficiency and reduce costs.",
  },
  {
    number: "05",
    icon: ShieldCheck,
    title: "Customs Brokerage",
    description: "Smooth customs clearance and compliance to keep your cargo moving.",
  },
  {
    number: "06",
    icon: Truck,
    fast: true,
    title: "Last-Mile Delivery",
    description: "On-time, flexible, and customer-focused delivery to the final destination.",
  },
];
