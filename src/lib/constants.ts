/** Site-wide constants: brand, navigation, section anchors. */

export const BRAND = {
  name: "Linus",
  suffix: "Delivery",
  tagline: "Discreet Delivery. Delivered with Care.",
} as const;

export const SECTION_IDS = {
  home: "home",
  track: "track",
  whatWeDo: "what-we-do",
  whyChooseUs: "why-choose-us",
  reviews: "customers-review",
} as const;

export interface NavLink {
  label: string;
  targetId: string;
  /** Home performs a full reload instead of scrolling */
  reload?: boolean;
  /** Track focuses the tracking input after scrolling */
  focusTracking?: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", targetId: SECTION_IDS.home, reload: true },
  { label: "Track", targetId: SECTION_IDS.track, focusTracking: true },
  { label: "Why Choose Us", targetId: SECTION_IDS.whyChooseUs },
  { label: "What We Do", targetId: SECTION_IDS.whatWeDo },
  { label: "Customers Review", targetId: SECTION_IDS.reviews },
];

/** Height (px) reserved for the sticky navbar when computing scroll offsets. */
export const NAV_OFFSET = 92;

export const TRACKING_NUMBER_PATTERN = /^[A-Z]{2,4}\d{6,12}$/i;
