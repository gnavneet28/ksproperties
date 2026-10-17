/**
 * Project catalogue. Each entry powers a card on /projects and a full landing page at
 * /projects/{slug}. The first project with `featured: true` is also rendered at "/".
 *
 * Arvind Metal data comes from the developer brochure (creative/arvind-metal-brochure.jpg)
 * and the Meta ad (creative/ahmedabad-plot-launch.webp). Offer values MUST match the ads.
 */

export type ProjectImage = { src: string; alt: string; width: number; height: number };
export type IconName =
  | "pin" | "shield" | "layout" | "road" | "clubhouse" | "garden" | "lake" | "sports" | "city" | "factory" | "bird";

export type Project = {
  slug: string;
  name: string;
  builder: string;
  featured?: boolean;
  status: { label: string; detail: string };
  tagline: string;
  location: { short: string; address: string; city: string; state: string; mapQuery: string; mapUrl: string };
  offer: {
    /** Headline price: pre-launch, including the club-charge waiver (smallest plot). */
    price: string;
    priceNumeric: number;
    priceFootnote: string;
    /** Struck-through launch price of the smallest plot. */
    launchPrice: string;
    /** Scarcity cap the pre-launch price is tied to, e.g. "first 300 EOIs". */
    eoiCap: string;
    eoi: string;
    eoiShort: string;
    rate: string;
    rateUnit: string;
    area: string;
    areaAdj: string;
  };
  /** One row of the pre-launch price table; `price` is the pre-launch price incl. club waiver. */
  plots: { size: string; sizeShort: string; launchPrice: string; prelaunchPrice: string; price: string }[];
  plotSizeOptions: string[];
  images: { card: ProjectImage; feature: ProjectImage; lifestyle: ProjectImage; gallery: ProjectImage[] };
  hero: {
    eyebrow: string;
    h1Lead: string;
    h1Accent: string;
    sizeNote: string;
    pricePrefix: string;
    price: string;
    /** Launch price shown struck through next to the pre-launch price. */
    priceStrike: string;
    priceStrikeLabel: string;
    eoiBadge: string;
    primaryCta: string;
    secondaryCta: string;
    imageCaption: string;
    /** Mobile hero: three compact key facts, and the "or call" line. */
    facts: { value: string; label: string; highlight?: boolean }[];
    orCall: string;
  };
  highlights: { eyebrow: string; heading: string; items: { icon: IconName; title: string; text: string }[] };
  lifestyle: {
    eyebrow: string;
    heading: string;
    intro: string;
    imageCaption: string;
    why: string[];
    amenitiesHeading: string;
    amenities: string[];
  };
  pricing: {
    eyebrow: string;
    heading: string;
    /** Scarcity strip above the price cards. */
    offerBadge: string;
    launchLabel: string;
    prelaunchLabel: string;
    waiverLabel: string;
    cta: string;
    includesNote: string;
    note: string;
    stats: { value: string; label: string }[];
  };
  locationSection: {
    eyebrow: string;
    heading: string;
    subhead: string;
    connectivityHeading: string;
    connectivity: { icon: IconName; title: string }[];
    infraHeading: string;
    infra: string[];
    mapTitle: string;
    mapPlaceholder: string;
    openInMaps: string;
  };
  gallery: { eyebrow: string; heading: string };
  faq: { eyebrow: string; heading: string; items: { q: string; a: string }[] };
  closing: { eyebrow: string; heading: string; text: string; cta: string; orCall: string };
  /**
   * Pre-typed WhatsApp messages, one per button. Edit freely.
   * `plot` is a template: {size} and {price} are filled from each plot card.
   */
  whatsapp: {
    hero: string;
    plot: string;
    eoi: string;
    bottomBar: string;
    floating: string;
    thankYou: string;
  };
  seo: { title: string; description: string; ogImage: ProjectImage };
};

const am = {
  name: "Arvind Metal",
  builder: "Arvind Group",
  /** Pre-launch price incl. club waiver for the 400 sq. yd plot — the headline number. */
  price: "₹31.30 Lakhs",
  /** Launch price for the same plot, shown struck through. */
  launchPrice: "₹36 Lakhs",
  eoiCap: "first 300 EOIs",
  eoi: "₹50,000",
  /** Launch rate per sq. yard; the pre-launch rate works out to ~₹7,825. */
  rate: "₹9,000",
  prelaunchRate: "₹7,825",
  area: "50+ Acres",
};

const arvindMetal: Project = {
  slug: "arvind-metal",
  name: am.name,
  builder: am.builder,
  featured: true,
  status: { label: "Pre-launch open", detail: `Pre-launch price for the ${am.eoiCap} only` },
  tagline: "Connected to everything that matters",
  location: {
    short: "Near Ahmedabad–Rajkot Highway",
    address: "Metal Road, near Ahmedabad–Rajkot Highway",
    city: "Ahmedabad",
    state: "Gujarat",
    // TODO(client): verify the embed shows the right spot; the short link below is from the brochure.
    mapQuery: "Metal Road, Ahmedabad-Rajkot Highway, Gujarat",
    mapUrl: "https://maps.app.goo.gl/WpWGynfzxPXSkqgD6",
  },
  offer: {
    price: am.price,
    priceNumeric: 3130000,
    priceFootnote:
      "*Pre-launch price including club waiver, for the first 300 EOIs only. Includes Basic Land Rate, Development Charges, Club Charges and Maintenance; excludes PLC and applicable government charges.",
    launchPrice: am.launchPrice,
    eoiCap: am.eoiCap,
    eoi: am.eoi,
    eoiShort: "₹50K",
    rate: am.rate,
    rateUnit: "per sq. yard",
    area: am.area,
    areaAdj: "50+ acre",
  },
  plots: [
    { size: "400 Sq. Yards", sizeShort: "400", launchPrice: "₹36.00 Lakhs", prelaunchPrice: "₹33.05 Lakhs", price: "₹31.30 Lakhs" },
    { size: "550 Sq. Yards", sizeShort: "550", launchPrice: "₹49.50 Lakhs", prelaunchPrice: "₹44.67 Lakhs", price: "₹42.92 Lakhs" },
    { size: "675 Sq. Yards", sizeShort: "675", launchPrice: "₹60.75 Lakhs", prelaunchPrice: "₹54.35 Lakhs", price: "₹52.60 Lakhs" },
    { size: "800 Sq. Yards", sizeShort: "800", launchPrice: "₹72.00 Lakhs", prelaunchPrice: "₹64.05 Lakhs", price: "₹62.30 Lakhs" },
  ],
  plotSizeOptions: ["400 Sq. Yards", "550 Sq. Yards", "675 Sq. Yards", "800 Sq. Yards"],
  images: {
    card: {
      src: "/projects/arvind-metal/clubhouse-lake.webp",
      alt: "Artistic impression of the Arvind Metal clubhouse beside a natural pond at sunset",
      width: 504,
      height: 212,
    },
    feature: {
      src: "/projects/arvind-metal/township.webp",
      alt: "Artistic impression of landscaped plots and tree-lined roads with the city skyline",
      width: 480,
      height: 560,
    },
    lifestyle: {
      src: "/projects/arvind-metal/clubhouse-lake.webp",
      alt: "Artistic impression of the Arvind Metal clubhouse beside a natural pond at sunset",
      width: 504,
      height: 212,
    },
    gallery: [
      { src: "/projects/arvind-metal/entrance.webp", alt: "Artistic impression of the Arvind Metal entrance gate", width: 510, height: 160 },
      { src: "/projects/arvind-metal/clubhouse-lake.webp", alt: "Artistic impression of the clubhouse and natural pond", width: 504, height: 212 },
      { src: "/projects/arvind-metal/township.webp", alt: "Artistic impression of the plotted township", width: 480, height: 560 },
    ],
  },
  hero: {
    eyebrow: `${am.name} · by ${am.builder}`,
    // H1 rendered as lead + accent; together they must match the ad headline.
    h1Lead: "400 Sq. Yards Plots in",
    h1Accent: "Ahmedabad",
    sizeNote: `Plot sizes 400, 550, 675 & 800 sq. yards · pre-launch ${am.prelaunchRate} per sq. yard (launch ${am.rate}) · 50+ acre township`,
    pricePrefix: "Pre-launch price from",
    price: `${am.price}*`,
    priceStrike: `${am.launchPrice}`,
    priceStrikeLabel: "Launch price",
    eoiBadge: `Pre-launch price for the ${am.eoiCap} · EOI just ${am.eoi}`,
    primaryCta: "Get Price Sheet on WhatsApp",
    secondaryCta: "Call Now",
    imageCaption: "Artistic impression",
    facts: [
      { value: "₹31.30 L*", label: "Pre-launch", highlight: true },
      { value: "400–800", label: "Sq. yards" },
      { value: "₹50K", label: "EOI" },
    ],
    orCall: "or call",
  },
  highlights: {
    eyebrow: "Project highlights",
    heading: "Where connectivity meets nature & future growth",
    items: [
      { icon: "layout", title: "50+ Acres", text: "Of planned plotted development" },
      { icon: "lake", title: "2 Natural Ponds", text: "Water bodies woven into the landscape" },
      { icon: "clubhouse", title: "Clubhouse", text: "With landscaped gardens" },
      { icon: "garden", title: "Nature‑Inspired Living", text: "Natural surroundings with landscaped open spaces" },
    ],
  },
  lifestyle: {
    eyebrow: "Why Arvind Metal",
    heading: "Your space. Your nature. Your future.",
    intro: "Discover a space where nature, connectivity and future possibilities come together.",
    imageCaption: "Artistic impression",
    why: [
      "A spacious 50+ acre upcoming plotted development",
      "Natural surroundings with landscaped open spaces",
      "Multiple plot sizes to suit different budgets and requirements",
      "Connectivity towards Ahmedabad, Bavla and key industrial corridors",
      "A nature-oriented lifestyle and long-term land investment",
    ],
    // From the Meta ad copy. TODO(client): confirm these are part of Arvind Metal.
    amenitiesHeading: "Planned amenities",
    amenities: ["Swimming Pool", "Aqua Yoga Deck", "Children's Play Area", "Multi-purpose Court", "Box Cricket", "Outdoor Fitness Gym"],
  },
  pricing: {
    eyebrow: "Pre-launch price offering",
    heading: "Choose the plot that fits you",
    offerBadge: `For the ${am.eoiCap} only`,
    launchLabel: "Launch price",
    prelaunchLabel: "Pre-launch price",
    waiverLabel: "Incl. club waiver",
    cta: "Get price sheet",
    includesNote: "Above cost includes Basic Land Rate + Development Charges + Club Charges + Maintenance.",
    note: "Prices exclude PLC (Preferential Location Charges) and applicable government charges. The pre-launch price is valid for the first 300 EOIs only.",
    stats: [
      { value: am.area, label: "Planned development" },
      { value: "2", label: "Natural ponds" },
      { value: "₹50K", label: "EOI for plot booking" },
      { value: "300", label: "EOIs at pre-launch price" },
    ],
  },
  locationSection: {
    eyebrow: "Location",
    heading: "Strategically connected",
    subhead: "Metal Road, near Ahmedabad–Rajkot Highway. Exact directions are shared when you book a site visit.",
    connectivityHeading: "Connected towards",
    connectivity: [
      { icon: "city", title: "Ahmedabad & S.G. Highway" },
      { icon: "road", title: "Sarkhej & Ahmedabad–Rajkot Highway" },
      { icon: "factory", title: "Bavla & Kerala GIDC" },
      { icon: "road", title: "Kerala–Nalsarovar Road" },
      { icon: "bird", title: "Nalsarovar Bird Sanctuary · ~20 km" },
    ],
    // From the Meta ad copy.
    infraHeading: "Infrastructure nearby",
    infra: ["Six-laning of SP Ring Road", "Planned 90-metre Ring Road", "60-metre approved Sanand Bypass"],
    mapTitle: `Map: ${am.name}, Metal Road near Ahmedabad–Rajkot Highway`,
    mapPlaceholder: "Tap to load map",
    openInMaps: "Open in Google Maps",
  },
  gallery: { eyebrow: "Gallery", heading: "A glimpse of Arvind Metal" },
  faq: {
    eyebrow: "Good to know",
    heading: "Frequently asked questions",
    items: [
      {
        q: "What is EOI and is it refundable?",
        a: `An Expression of Interest (EOI) of ${am.eoi} reserves your priority ahead of the launch, and the pre-launch price is held for the ${am.eoiCap} only. Refund terms are shared in writing before you pay, so you know exactly where you stand.`,
      },
      {
        q: "Why is the pre-launch price lower than the launch price?",
        a: `Pre-launch pricing is an early-commitment offer: the first 300 EOIs get the plot below the launch rate of ${am.rate} per sq. yard, with a further waiver on club charges. Once the 300 EOIs are taken, plots are sold at launch price.`,
      },
      {
        q: "What plot sizes and prices are available?",
        a: `Four sizes, at pre-launch prices including the club waiver: 400 sq. yards at ₹31.30 Lakhs (launch ₹36.00 Lakhs), 550 sq. yards at ₹42.92 Lakhs (launch ₹49.50 Lakhs), 675 sq. yards at ₹52.60 Lakhs (launch ₹60.75 Lakhs) and 800 sq. yards at ₹62.30 Lakhs (launch ₹72.00 Lakhs). Prices exclude PLC and government charges.`,
      },
      {
        q: "What are additional charges?",
        a: "The quoted cost includes Basic Land Rate, Development Charges, Club Charges and Maintenance. It excludes Preferential Location Charges (PLC), stamp duty, registration and other applicable government charges. You'll receive the full cost sheet on call.",
      },
      {
        q: "Can I visit the site?",
        a: "Yes. Call or WhatsApp us and we'll schedule a site visit at a time that suits you.",
      },
    ],
  },
  closing: {
    eyebrow: "Arvind Metal",
    heading: "Invest Today for a Better Tomorrow",
    text: `Plots from 400 to 800 sq. yards in a 50+ acre development near Ahmedabad, at pre-launch prices from ${am.price}* instead of ${am.launchPrice}. Reserve yours with an EOI of just ${am.eoi} — the ${am.eoiCap} only.`,
    cta: "Register EOI on WhatsApp",
    orCall: "Or call us",
  },
  whatsapp: {
    hero: `Hi, I'm interested in plots at ${am.name}, Metal Road near Ahmedabad (pre-launch from ${am.price}). Can I get the price sheet and more details?`,
    plot: `Hi, I'm interested in the {size} plot at ${am.name} (pre-launch price {price}). Can I get the price sheet and more info on this?`,
    eoi: `Hi, I'd like to register my EOI of ${am.eoi} for a plot at ${am.name} at the pre-launch price. Can you share the process and next steps?`,
    bottomBar: `Hi, I'm checking out ${am.name} on your website. Can I get more info on plot sizes, prices and a site visit?`,
    floating: `Hi, I have a few questions about ${am.name} plots near Ahmedabad. Can you help me?`,
    thankYou: `Hi, I just enquired about ${am.name} on your website. Can you share the price sheet and site visit slots?`,
  },
  seo: {
    title: `${am.name}: 400–800 Sq. Yard Plots near Ahmedabad from ${am.price} | KS Properties`,
    description: `${am.name} by ${am.builder}: a 50+ acre plotted development on Metal Road near Ahmedabad–Rajkot Highway. Plots of 400, 550, 675 and 800 sq. yards at pre-launch prices from ${am.price}* (launch ${am.launchPrice}). EOI ${am.eoi}, for the ${am.eoiCap} only.`,
    ogImage: { src: "/projects/arvind-metal/og.jpg", alt: `${am.name} by ${am.builder}: plots near Ahmedabad from ${am.price}`, width: 1200, height: 630 },
  },
};

export const projects: Project[] = [arvindMetal];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

/** WhatsApp message for a plot-size card, e.g. "…the 550 sq. yard plot at Arvind Metal (pre-launch price ₹42.92 Lakhs)…". */
export function plotWhatsappMessage(project: Project, plot: Project["plots"][number]) {
  return project.whatsapp.plot
    .replace("{size}", plot.size.toLowerCase().replace("yards", "yard"))
    .replace("{price}", plot.price);
}

export function featuredProject() {
  return projects.find((p) => p.featured) ?? projects[0];
}

/** Matches "/", "/projects/{slug}" (and sub-paths) to the project shown there. */
export function projectForPath(pathname: string) {
  if (pathname === "/") return featuredProject();
  const m = pathname.match(/^\/projects\/([^/]+)/);
  return m ? getProject(m[1]) : undefined;
}

export function builders() {
  return [...new Set(projects.map((p) => p.builder))];
}
