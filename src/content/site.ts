/**
 * Site-wide copy for KS Properties (the advertiser / channel partner).
 * Project-specific copy lives in ./projects.ts. Change values here only.
 *
 * Values marked `TODO(client)` are open questions and block launch.
 */

const phonePrimary = { display: "+91 75290 42124", e164: "+917529042124", short: "75290 42124" };
const phoneSecondary = { display: "+91 88728 88900", e164: "+918872888900", short: "88728 88900" };

const brandName = "KS Properties";

export const content = {
  brand: {
    name: brandName,
    tagline: "Plotted developments around Ahmedabad",
    // TODO(client): exact registered legal entity name (e.g. proprietorship / LLP / Pvt Ltd).
    legalEntity: brandName,
    role: "authorised channel partner",
  },

  phones: {
    primary: phonePrimary,
    secondary: phoneSecondary,
  },

  whatsapp: {
    // TODO(client): confirm which number is on WhatsApp Business.
    number: "917529042124",
    // Used on pages that aren't about one project (e.g. /projects, privacy policy).
    message: `Hi ${brandName}, I'm looking for plots near Ahmedabad. Can you share the projects you have available?`,
    ariaLabel: "Chat on WhatsApp",
    hoverLabel: "Chat with us",
  },

  seo: {
    title: `${brandName} | Plotted Developments near Ahmedabad`,
    description: `${brandName} is an authorised channel partner for plotted developments around Ahmedabad. Explore projects, plot sizes and prices, and book a site visit.`,
    projectsTitle: `Projects | ${brandName}`,
    projectsDescription: `Plotted development projects near Ahmedabad marketed by ${brandName}: plot sizes, starting prices, location and EOI details.`,
    privacyTitle: `Privacy Policy | ${brandName}`,
    privacyDescription: `How ${brandName} collects, uses and protects personal data from Facebook and Instagram lead forms, WhatsApp and calls, under India's Digital Personal Data Protection Act, 2023.`,
    thankYouTitle: `Thank You | ${brandName}`,
  },

  header: {
    callNow: "Call Now",
    nav: [
      { href: "/", label: "Home" },
      { href: "/projects", label: "Projects" },
    ],
  },

  mobileBar: {
    call: "Call",
    whatsapp: "WhatsApp",
  },

  projectsPage: {
    eyebrow: brandName,
    heading: "Our projects",
    intro: `Plotted developments around Ahmedabad, marketed by ${brandName} as authorised channel partner. Pick a project to see plot sizes, prices and location.`,
    view: "View project",
    from: "Starting at",
    eoi: "EOI",
    plots: "Plot sizes",
    by: "by",
    comingSoon: {
      title: "More projects coming soon",
      text: "We're adding new plotted developments around Ahmedabad. Call us to hear about them first.",
    },
    backToProjects: "All projects",
  },

  form: {
    eyebrow: "Priority access",
    heading: "Reserve Your Plot Today",
    subhead: "Our team will call you within 30 minutes with price sheet, layout plan and site visit slots.",
    fields: {
      name: { label: "Full name", placeholder: "Your full name" },
      phone: { label: "Mobile number", prefix: "+91", placeholder: "10-digit mobile" },
      city: {
        label: "City",
        placeholder: "Select your city",
        options: ["Ahmedabad", "Gandhinagar", "Other Gujarat", "Outside Gujarat", "NRI"],
      },
      interest: {
        label: "Interested in",
        options: ["Pay EOI & reserve", "Site visit", "Just want price sheet"],
      },
      plotSize: { label: "Plot size (optional)", placeholder: "Any size" },
      email: { label: "Email (optional)", placeholder: "you@example.com", reveal: "+ Add email (optional)" },
      consent: {
        before: (builder: string) =>
          `I agree to be contacted by ${brandName} and ${builder} via call, SMS and WhatsApp about this project, and accept the `,
        link: "Privacy Policy",
        after: ".",
      },
    },
    errors: {
      name: "Please enter your full name (letters, spaces and dots only).",
      phone: "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.",
      city: "Please select your city.",
      interest: "Please choose what you're interested in.",
      plotSize: "Please choose one of the plot sizes, or leave it blank.",
      email: "Please enter a valid email address, or leave it blank.",
      consent: "Please tick the box so our team can contact you.",
      failure: `Something went wrong — please call ${phonePrimary.short} or WhatsApp us.`,
      rateLimited: `Too many attempts. Please call ${phonePrimary.short} or WhatsApp us.`,
    },
    submit: "Get Price Sheet",
    submitting: "Sending…",
    privacyNote: "Your details are safe with us. No spam.",
  },

  footer: {
    about: (builders: string) => `${brandName} is an authorised channel partner of ${builders}.`,
    disclaimer:
      "Images are artistic impressions and for representation only. Prices, plot sizes and availability are subject to change without notice. This is not an offer or contract. Refer to official project documents for details.",
    privacyLink: "Privacy Policy",
    projectsLink: "Projects",
    copyright: (year: number) => `© ${year} ${brandName}. All rights reserved.`,
    contactHeading: "Contact",
    exploreHeading: "Explore",
  },

  phoneUi: {
    copied: "Number copied",
  },

  thankYou: {
    heading: (firstName: string) => (firstName ? `Thank you, ${firstName}!` : "Thank you!"),
    text: (projectName: string) =>
      projectName ? `Our team will call you shortly about ${projectName}.` : "Our team will call you shortly.",
    eoiReminder: (eoi: string) => `Remember: you can reserve your plot with an EOI of just ${eoi}.`,
    whatsapp: "WhatsApp us",
    back: "Back to project",
    allProjects: "See all projects",
  },

  notFound: {
    heading: "Page not found",
    cta: "Go to home page",
  },

  privacy: {
    heading: "Privacy Policy",
    // TODO(client): legal team must approve before Meta ads go live; update the date on every change.
    lastUpdated: "13 October 2026",
    lastUpdatedLabel: "Last updated",
    tocHeading: "Contents",
    summaryHeading: "At a glance",
    summary: [
      "We collect the details you give us in our Facebook/Instagram lead forms, on WhatsApp and on calls.",
      "We use them only to help you with the project you asked about, and share them with its developer.",
      "We will call, SMS or WhatsApp you about that project. Reply STOP or tell us on a call to opt out at any time.",
      "We never sell your data. You can ask us to see, correct or delete it.",
      "This website does not use cookies, tracking pixels or analytics, and we do not record calls.",
    ],
    // Contact details shown in the policy. Phone comes from `phones.primary`.
    // Leave empty until you have one. When set, "or email …" is added automatically wherever
    // the policy tells people how to reach you (consent, opt-out, rights, language).
    contactEmail: "",
    responseTime: "within 30 days",
    retention: "24 months from our last contact with you",
  },

};

export type PrivacySection = {
  id: string;
  title: string;
  body?: string[];
  list?: string[];
  groups?: { heading: string; list: string[] }[];
  after?: string[];
};

/**
 * Privacy notice for the website, Meta (Facebook/Instagram) lead forms, WhatsApp and calls.
 * Written to cover the DPDP Act, 2023 notice items and Meta Lead Ads requirements.
 * Not legal advice — have counsel review before ads go live.
 */
export function privacySections(builders: string[]): PrivacySection[] {
  const c = content;
  const p = c.privacy;
  const builderList = builders.join(", ");
  const phone = c.phones.primary.display;
  // ", or email x@y" — only when an email has been configured.
  const orEmail = p.contactEmail ? `, or email ${p.contactEmail}` : "";
  return [
    {
      id: "scope",
      title: "1. What this policy covers",
      body: ["This policy explains how we handle your personal data when you:"],
      list: [
        "Submit an enquiry through one of our lead forms on Facebook or Instagram (Meta Lead Ads)",
        "Message us on WhatsApp, call us, or receive a call or message from us",
        "Visit this website"
      ],
    },
    {
      id: "what-we-collect",
      title: "2. What we collect",
      groups: [
        {
          heading: "From Facebook and Instagram lead forms",
          list: [
            "Your full name and mobile number",
            "Your email address and city, if the form asks for them",
            "Your answers to the form's questions, such as preferred plot size and whether you want a site visit or price sheet",
            "Details Meta sends with the lead: which ad, campaign and form you responded to, the platform (Facebook or Instagram) and the time you submitted it",
          ],
        },
        {
          heading: "When you contact us on WhatsApp or by phone",
          list: [
            "Your phone number and the name shown on your WhatsApp profile",
            "The messages you send us and notes our team makes about your enquiry (for example, preferred visit date)",
          ],
        },
        {
          heading: "When you visit this website",
          list: [
            "This website has no enquiry form and does not use cookies, tracking pixels or analytics tools.",
            "Like any website, our hosting provider automatically processes basic technical data (such as IP address and browser type) to deliver pages and keep the site secure. We do not use it to identify you.",
            "Tapping a Call or WhatsApp button opens your phone or WhatsApp app; the website does not record that you tapped it.",
          ],
        },
      ],
      after: [
        "Meta may pre-fill some form fields (such as name, email or phone) from your Facebook or Instagram profile. You can change them before you submit.",
        "We do not ask for bank, card or government ID details in lead forms. If you go ahead with an Expression of Interest (EOI) or booking, any documents needed are collected separately with your knowledge.",
      ],
    },
    {
      id: "meta-lead-ads",
      title: "3. How lead forms on Facebook and Instagram work",
      body: [
        "When you submit one of our lead forms, Meta Platforms collects your answers and makes them available to us in Meta Leads Center, inside our Meta Business account. We do not copy them into other tools or systems.",
        "Meta handles its own use of your data — for example, delivering and measuring ads — as an independent data controller under its own Privacy Policy (facebook.com/privacy/policy). This policy covers what we do with your data once we receive it.",
        "By submitting a lead form you ask us to contact you about the project advertised, as described in section 6.",
      ],
    },
    {
      id: "why-we-collect",
      title: "4. Why we use your data",
      list: [
        `To call or message you about the project you enquired about and share its price sheet, layout plan and availability`,
        "To schedule and confirm site visits",
        "To process your Expression of Interest (EOI) or booking, if you choose to make one",
        `To pass your enquiry to the developer (${builderList}) so they can assist you`,
        "To keep a record of our conversations so any member of our team can help you",
        "To see which of our ads lead to enquiries, using the reports Meta provides in Ads Manager",
        "To meet legal, tax and regulatory obligations",
      ],
      after: ["We use your data only for these purposes. We do not sell it, and we do not use it for unrelated marketing without asking you."],
    },
    {
      id: "consent",
      title: "5. Consent and legal basis",
      body: [
        "We process your personal data on the basis of the consent you give when you submit a lead form or enquiry, or when you contact us yourself, as permitted by the DPDP Act. Where the law allows, we may also process data for legitimate uses, such as complying with legal obligations.",
        `You can withdraw your consent at any time by replying STOP on WhatsApp or SMS, or by telling us on a call to ${phone}${orEmail}. Withdrawing is as easy as giving consent. It does not affect processing already carried out, but we will stop contacting you and will delete your data unless the law requires us to keep it.`,
      ],
    },
    {
      id: "calls-sms-whatsapp",
      title: "6. Calls, SMS and WhatsApp",
      body: [
        `By submitting a lead form or enquiry, you ask ${c.brand.name} and the developer to contact you about that project by phone call, SMS and WhatsApp, including if your number is registered on the National Do Not Call (DND/NCPR) registry.`,
        "We do not record phone calls.",
        "WhatsApp conversations are carried by WhatsApp (part of Meta), which applies its own terms and privacy policy.",
        `To stop receiving calls or messages, reply STOP or tell the caller${orEmail}.`,
      ],
    },
    {
      id: "cookies",
      title: "7. Cookies and tracking",
      body: [
        "This website does not use cookies, tracking pixels (such as the Meta Pixel), analytics tools or session recording.",
        "Facebook and Instagram use their own cookies and ad tracking when you see or respond to our ads there. That is controlled by Meta, and you can manage it in your Facebook or Instagram settings (Settings → Accounts Centre → Ad preferences).",
      ],
    },
    {
      id: "sharing",
      title: "8. Who we share it with",
      body: ["We share your data only as needed for the purposes above:"],
      list: [
        `The developer of the project you enquired about (${builderList}) and its sales team`,
        "Meta Platforms, which runs the lead forms, Leads Center and WhatsApp",
        "Government authorities, courts or regulators, where the law requires it",
      ],
      after: ["We do not sell or rent your personal data."],
    },
    {
      id: "storage",
      title: "9. Where your data is stored",
      body: [
        "Lead form details are stored in Meta Leads Center, and WhatsApp conversations in WhatsApp, both operated by Meta. Meta may store and process this data on servers outside India. Any such transfer follows the DPDP Act and any restrictions notified by the Government of India.",
      ],
    },
    {
      id: "retention",
      title: "10. How long we keep it",
      body: [
        `We keep enquiry data for ${p.retention}. After that, or sooner if you withdraw consent and the purpose is complete, we delete it from Meta Leads Center and our WhatsApp chats — unless the law requires us to keep it longer (for example, records connected to payments or bookings).`,
      ],
    },
    {
      id: "your-rights",
      title: "11. Your rights",
      body: ["Under the DPDP Act you have the right to:"],
      list: [
        "Get a summary of the personal data we hold about you and how we use it, and know who we have shared it with",
        "Have inaccurate or incomplete data corrected, completed or updated",
        "Have your data erased when it is no longer needed for the purpose you gave it for",
        "Withdraw your consent at any time",
        "Nominate another person to exercise these rights for you in the event of your death or incapacity",
        "Have your grievances addressed by us",
      ],
      after: [
        `To use any of these rights, call or WhatsApp us on ${phone}${orEmail}. We may ask you to verify your identity first. We respond ${p.responseTime}.`,
        "If you are not satisfied with our response, you may complain to the Data Protection Board of India under the DPDP Act.",
      ],
    },
    {
      id: "security",
      title: "12. Security",
      body: [
        "We use reasonable security safeguards: this website is served only over HTTPS, and only authorised members of our team can view leads in our Meta Business account, using their own logins. If a personal data breach affects you, we will inform you and the Data Protection Board as the law requires.",
      ],
    },
    {
      id: "children",
      title: "13. Children",
      body: [
        "Our services and lead forms are meant for adults. We do not knowingly collect personal data from anyone under 18. If you believe a child has sent us their data, contact us and we will delete it.",
      ],
    },
    {
      id: "language",
      title: "14. Language",
      body: [
        `You can ask for this notice in English or in any language listed in the Eighth Schedule to the Constitution of India (including Gujarati and Hindi) by calling or WhatsApping us on ${phone}${orEmail}.`,
      ],
    },
    {
      id: "changes",
      title: "15. Changes to this policy",
      body: [
        "The date at the top of this page shows when this policy was last updated. If we make material changes, we will update that date and note the change on this page.",
      ],
    },
  ];
}

export function whatsappHref(message: string = content.whatsapp.message) {
  return `https://wa.me/${content.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

export function telHref(phone: { e164: string }) {
  return `tel:${phone.e164}`;
}
