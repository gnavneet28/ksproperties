/** Lead pipeline definitions shared by server and client admin code. */

export const LEAD_STATUSES = [
  { id: "new", label: "New", tone: "new" },
  { id: "contacted", label: "Contacted", tone: "info" },
  { id: "interested", label: "Interested", tone: "info" },
  { id: "site_visit", label: "Site visit scheduled", tone: "progress" },
  { id: "visited", label: "Site visit done", tone: "progress" },
  { id: "eoi_paid", label: "EOI paid", tone: "good" },
  { id: "booked", label: "Booked", tone: "won" },
  { id: "lost", label: "Not interested", tone: "muted" },
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number]["id"];
export type StatusTone = (typeof LEAD_STATUSES)[number]["tone"];

export const STATUS_IDS = LEAD_STATUSES.map((s) => s.id) as LeadStatus[];

export function statusMeta(id: string) {
  return LEAD_STATUSES.find((s) => s.id === id) ?? LEAD_STATUSES[0];
}

export function isLeadStatus(v: unknown): v is LeadStatus {
  return typeof v === "string" && (STATUS_IDS as string[]).includes(v);
}

/** Statuses that count as converted for the conversion-rate KPI. */
export const CONVERTED: LeadStatus[] = ["eoi_paid", "booked"];

export type LeadRow = {
  id: number;
  created_at: string;
  updated_at: string;
  project_slug: string;
  project_name: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  interest: string;
  plot_size: string;
  status: LeadStatus;
  assigned_to: number | null;
  assignee_name: string | null;
  follow_up_at: string | null;
  duplicate: boolean;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  fbclid: string;
  fbc: string;
  fbp: string;
  landing_url: string;
  referrer: string;
  device: string;
  ip: string;
  user_agent: string;
  event_id: string;
};

export type Activity = {
  id: number;
  created_at: string;
  type: "created" | "status" | "note" | "assigned" | "follow_up" | "edited";
  body: string;
  user_name: string | null;
};

export type TeamMember = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "sales";
  active: boolean;
  created_at: string;
  last_login_at: string | null;
};
