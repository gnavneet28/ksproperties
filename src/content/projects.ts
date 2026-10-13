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
    price: string;
    priceNumeric: number;
    priceFootnote: string;
    eoi: string;
    eoiShort: string;
    rate: string;
    rateUnit: string;
    area: string;
    areaAdj: string;
  };
  plots: { size: string; sizeShort: string; price: string }[];
  plotSizeOptions: string[];
  images: { card: ProjectImage; feature: ProjectImage; lifestyle: ProjectImage; gallery: ProjectImage[] };
  hero: {
    eyebrow: string;
    h1Lead: string;
    h1Accent: string;
    sizeNote: string;
    pricePrefix: string;
    price: string;
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
    startingAt: string;
    cta: string;
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
  price: "₹36 Lakhs",
  eoi: "₹50,000",
  rate: "₹9,000",
  area: "50+ Acres",
};

const arvindMetal: Project = {
  slug: "arvind-metal",
  name: am.name,
  builder: am.builder,
  featured: true,
  status: { label: "EOI open", detail: "Launch expected within 1–2 months" },
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
    priceNumeric: 3600000,
    priceFootnote: "*Indicative starting price; excludes PLC and applicable government charges",
    eoi: am.eoi,
    eoiShort: "₹50K",
    rate: am.rate,
    rateUnit: "per sq. yard",
    area: am.area,
    areaAdj: "50+ acre",
  },
  plots: [
    { size: "400 Sq. Yards", sizeShort: "400", price: "₹36 Lakhs" },
    { size: "550 Sq. Yards", sizeShort: "550", price: "₹49.50 Lakhs" },
    { size: "800 Sq. Yards", sizeShort: "800", price: "₹72 Lakhs" },
  ],
  plotSizeOptions: ["400 Sq. Yards", "550 Sq. Yards", "800 Sq. Yards"],
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
    sizeNote: `Plot sizes 400, 550 & 800 sq. yards · ${am.rate} per sq. yard · 50+ acre township`,
    pricePrefix: "Starting at",
    price: `${am.price}*`,
    eoiBadge: `EOI window open · just ${am.eoi}`,
    primaryCta: "Get Price Sheet on WhatsApp",
    secondaryCta: "Call Now",
    imageCaption: "Artistic impression",
    facts: [
      { value: "₹36 L*", label: "Starting", highlight: true },
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
    eyebrow: "Plot sizes & starting prices",
    heading: "Choose the plot that fits you",
    startingAt: "Starting at",
    cta: "Get price sheet",
    note: "Prices are indicative starting prices and exclude PLC (Preferential Location Charges) and applicable government charges.",
    stats: [
      { value: am.area, label: "Planned development" },
      { value: "2", label: "Natural ponds" },
      { value: "₹50K", label: "EOI, open from today" },
      { value: "1–2 mo.", label: "Expected launch" },
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
        a: `An Expression of Interest (EOI) of ${am.eoi} reserves your priority ahead of the launch. The EOI window is open now. Refund terms are shared in writing before you pay, so you know exactly where you stand.`,
      },
      {
        q: "When is the project launching?",
        a: "The launch is expected within the next 1–2 months. Register your EOI now to get priority on plot selection.",
      },
      {
        q: "What plot sizes and prices are available?",
        a: `400 sq. yards from ₹36 Lakhs, 550 sq. yards from ₹49.50 Lakhs and 800 sq. yards from ₹72 Lakhs (${am.rate} per sq. yard). Prices are indicative and exclude PLC and government charges.`,
      },
      {
        q: "What are additional charges?",
        a: "Starting prices exclude Preferential Location Charges (PLC), stamp duty, registration and other applicable government charges. You'll receive the full cost sheet on call.",
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
    text: `Plots from 400 to 800 sq. yards in a 50+ acre development near Ahmedabad, starting at ${am.price}*. The EOI window is open with just ${am.eoi}.`,
    cta: "Register EOI on WhatsApp",
    orCall: "Or call us",
  },
  whatsapp: {
    hero: `Hi, I'm interested in plots at ${am.name}, Metal Road near Ahmedabad (starting ${am.price}). Can I get the price sheet and more details?`,
    plot: `Hi, I'm interested in the {size} plot at ${am.name} (starting {price}). Can I get the price sheet and more info on this?`,
    eoi: `Hi, I'd like to register my EOI of ${am.eoi} for a plot at ${am.name}. Can you share the process and next steps?`,
    bottomBar: `Hi, I'm checking out ${am.name} on your website. Can I get more info on plot sizes, prices and a site visit?`,
    floating: `Hi, I have a few questions about ${am.name} plots near Ahmedabad. Can you help me?`,
    thankYou: `Hi, I just enquired about ${am.name} on your website. Can you share the price sheet and site visit slots?`,
  },
  seo: {
    title: `${am.name}: 400–800 Sq. Yard Plots near Ahmedabad from ${am.price} | KS Properties`,
    description: `${am.name} by ${am.builder}: a 50+ acre plotted development on Metal Road near Ahmedabad–Rajkot Highway. Plots of 400, 550 and 800 sq. yards from ${am.price}*. EOI open at ${am.eoi}.`,
    ogImage: { src: "/projects/arvind-metal/og.jpg", alt: `${am.name} by ${am.builder}: plots near Ahmedabad from ${am.price}`, width: 1200, height: 630 },
  },
};

export const projects: Project[] = [arvindMetal];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

/** WhatsApp message for a plot-size card, e.g. "…the 550 sq. yard plot at Arvind Metal (starting ₹49.50 Lakhs)…". */
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
