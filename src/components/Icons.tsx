import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const PhoneIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

export const WhatsAppIcon = (p: P) => (
  <svg width={24} height={24} viewBox="0 0 32 32" fill="currentColor" aria-hidden {...p}>
    <path d="M16.004 3C9.38 3 3.99 8.39 3.99 15.013c0 2.117.553 4.184 1.604 6.006L3.887 27.24a.5.5 0 0 0 .612.62l6.38-1.674a12.01 12.01 0 0 0 5.122 1.152h.005c6.623 0 12.013-5.39 12.013-12.013 0-3.21-1.25-6.227-3.52-8.497A11.94 11.94 0 0 0 16.004 3zm0 21.975h-.004a9.96 9.96 0 0 1-5.078-1.39l-.364-.216-3.787.993 1.011-3.692-.237-.379a9.94 9.94 0 0 1-1.524-5.278c0-5.505 4.479-9.983 9.987-9.983a9.92 9.92 0 0 1 7.059 2.928 9.92 9.92 0 0 1 2.921 7.062c-.002 5.506-4.48 9.955-9.984 9.955zm5.475-7.458c-.3-.15-1.775-.876-2.05-.976-.275-.1-.475-.15-.675.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.49-.892-.795-1.494-1.777-1.669-2.077-.175-.3-.019-.462.131-.611.135-.134.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.585-.491-.506-.675-.515l-.575-.01a1.1 1.1 0 0 0-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.116 3.231 5.126 4.531.716.309 1.275.494 1.711.632.719.229 1.373.196 1.89.119.577-.086 1.775-.726 2.025-1.426.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35z" />
  </svg>
);

export const PinIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const ShieldIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const LayoutIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9M15 9v12" />
  </svg>
);

export const RoadIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 21 9 3M20 21 15 3M12 6v2M12 11v2M12 16v3" />
  </svg>
);

export const ChevronDownIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const CloseIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const Spinner = (p: P) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden className="animate-spin" {...p}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const ClubhouseIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" />
  </svg>
);

export const GardenIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 22V11M12 11C12 6.5 8.5 3.5 4 3.5c0 4.5 3.5 7.5 8 7.5zM12 14c0-4 3.5-6.5 8-6.5 0 4-3.5 6.5-8 6.5z" />
  </svg>
);

export const LakeIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M2 7c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
  </svg>
);

export const SportsIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
  </svg>
);

export const CityIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 21h18M5 21V8l5-3v16M10 21V3h6v18M16 21V10h3v11M13 7v.01M13 11v.01M13 15v.01" />
  </svg>
);

export const FactoryIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 21V10l5 3V10l5 3V7h3l1-4h2l1 4v14H3zM7 17h2M12 17h2" />
  </svg>
);

export const BirdIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M16 7h.01M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20M20 7l2 .5-2 .5M10 18v3M14 17.75V21M7 18a6 6 0 0 0 3.84-10.61" />
  </svg>
);

export const ArrowRightIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const featureIcons = {
  city: CityIcon,
  factory: FactoryIcon,
  bird: BirdIcon,
  pin: PinIcon,
  shield: ShieldIcon,
  layout: LayoutIcon,
  road: RoadIcon,
  clubhouse: ClubhouseIcon,
  garden: GardenIcon,
  lake: LakeIcon,
  sports: SportsIcon,
};
