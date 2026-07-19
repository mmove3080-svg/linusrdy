/**
 * Customer reviews — text extracted verbatim from the approved design.
 * `avatarUrl` is optional: add a photo URL to replace the initials avatar.
 */
export interface Review {
  name: string;
  location: string;
  text: string;
  avatarUrl?: string;
}

export const REVIEWS: Review[] = [
  {
    name: "Jason Miller",
    location: "Austin, Texas",
    text: "Exceptional service from start to finish. My package arrived right on schedule, and the delivery driver was courteous, professional, and highly attentive. The entire experience easily deserves a five-star rating. Their detailed tracking system gives both our team and our customers complete confidence from dispatch to delivery.",
  },
  {
    name: "Amanda Rodriguez",
    location: "Seattle, Washington",
    text: "Linus Delivery has completely transformed the way we ship our discreet products. Their service is fast, reliable, and secure, while the real-time GPS tracking provides complete visibility throughout the journey. It's one of the most impressive tracking systems we've ever used.",
  },
  {
    name: "Christopher Davis",
    location: "Denver, Colorado",
    text: "We've trusted Linus Discreet Delivery for over a year, and they have consistently exceeded our expectations. Their professionalism, reliability, and commitment to secure, discreet shipping make them an excellent choice for registered businesses.",
  },
  {
    name: "Melissa Clark",
    location: "Nashville, Tennessee",
    text: "The real-time GPS tracking gives me complete peace of mind. Being able to follow every stage of the journey and watch the driver progress along the route until delivery makes the entire experience transparent, reassuring, and truly exceptional.",
  },
  {
    name: "Brandon Lee",
    location: "Phoenix, Arizona",
    text: "From small parcels to large freight shipments, Linus Delivery handles every package with exceptional care, precision, and professionalism. Their dependable service and attention to detail have earned our complete trust.",
  },
  {
    name: "Nicole Bennett",
    location: "Charlotte, North Carolina",
    text: "What impressed me most was the accuracy of the tracking updates. Watching the delivery vehicle progress along the route in real time made the experience feel transparent and trustworthy. Every shipment has arrived safely, securely, and exactly as scheduled.",
  },
];

export interface Statistic {
  value: number;
  /** rendered after the animated number, e.g. "+", "K+", "%" */
  suffix: string;
  /** divide the animated integer for decimals (99.8 → count to 998, divisor 10) */
  divisor?: number;
  /** skip animation, render as-is (e.g. 24/7) */
  literal?: string;
  label: string;
  icon: "users" | "package" | "globe" | "shield" | "support";
}

export const STATISTICS: Statistic[] = [
  { value: 10000, suffix: "+", label: "Happy Customers", icon: "users" },
  { value: 250, suffix: "K+", label: "Packages Delivered", icon: "package" },
  { value: 120, suffix: "+", label: "Countries Covered", icon: "globe" },
  { value: 998, divisor: 10, suffix: "%", label: "On-Time Delivery", icon: "shield" },
  { value: 0, literal: "24/7", suffix: "", label: "Expert Support", icon: "support" },
];
