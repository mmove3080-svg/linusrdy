import type { ServiceIconId } from "./ServiceIcons";

export interface Service {
  number: string;
  iconId: ServiceIconId;
  title: string;
  description: string;
}

/** The six core services — copy retained from the approved reference. */
export const SERVICES: Service[] = [
  {
    number: "01",
    iconId: "freight",
    title: "Freight Transportation",
    description: "Fast, safe, and reliable transport by road, air, and sea.",
  },
  {
    number: "02",
    iconId: "forwarding",
    title: "Global Freight Forwarding",
    description: "Seamless international shipping with expert handling and full visibility.",
  },
  {
    number: "03",
    iconId: "warehousing",
    title: "Warehousing & Distribution",
    description: "Secure storage and smart distribution solutions tailored to your needs.",
  },
  {
    number: "04",
    iconId: "supply-chain",
    title: "Supply Chain Management",
    description: "Integrated supply chain solutions that improve efficiency and reduce costs.",
  },
  {
    number: "05",
    iconId: "customs",
    title: "Customs Brokerage",
    description: "Smooth customs clearance and compliance to keep your cargo moving.",
  },
  {
    number: "06",
    iconId: "last-mile",
    title: "Last-Mile Delivery",
    description: "On-time, flexible, and customer-focused delivery to the final destination.",
  },
];
