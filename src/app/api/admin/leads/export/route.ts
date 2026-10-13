import { getCurrentUser } from "@/lib/server/auth";
import { exportLeads, type LeadFilters } from "@/lib/server/leadsRepo";
import { statusMeta, type LeadRow } from "@/lib/leads";

const COLUMNS: [string, (l: LeadRow) => string][] = [
  ["Received (IST)", (l) => new Date(l.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: false })],
  ["Name", (l) => l.name],
  ["Phone", (l) => `+91${l.phone}`],
  ["Email", (l) => l.email],
  ["City", (l) => l.city],
  ["Project", (l) => l.project_name],
  ["Plot size", (l) => l.plot_size],
  ["Interest", (l) => l.interest],
  ["Status", (l) => statusMeta(l.status).label],
  ["Owner", (l) => l.assignee_name ?? ""],
  ["Follow-up (IST)", (l) => (l.follow_up_at ? new Date(l.follow_up_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: false }) : "")],
  ["Repeat enquiry", (l) => (l.duplicate ? "yes" : "no")],
  ["utm_source", (l) => l.utm_source],
  ["utm_medium", (l) => l.utm_medium],
  ["utm_campaign", (l) => l.utm_campaign],
  ["utm_content", (l) => l.utm_content],
  ["utm_term", (l) => l.utm_term],
  ["Landing URL", (l) => l.landing_url],
  ["Device", (l) => l.device],
];

/** Escape for CSV and neutralise spreadsheet formula injection. */
function cell(v: string) {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const sp = new URL(req.url).searchParams;
  const f: LeadFilters = {
    q: sp.get("q") ?? undefined,
    status: sp.get("status") ?? undefined,
    project: sp.get("project") ?? undefined,
    source: sp.get("source") ?? undefined,
    assigned: sp.get("assigned") ?? undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
    followUp: sp.get("followUp") === "due" ? "due" : undefined,
  };
  const rows = await exportLeads(f, user.id);
  const csv = [COLUMNS.map(([h]) => h).join(","), ...rows.map((l) => COLUMNS.map(([, get]) => cell(get(l) ?? "")).join(","))].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(`﻿${csv}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="ks-leads-${stamp}.csv"`,
      "cache-control": "no-store",
    },
  });
}
