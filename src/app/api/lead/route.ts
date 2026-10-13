import { after } from "next/server";
import { normalizeName, validateLead, type LeadInput } from "@/lib/validation";
import { getProject } from "@/content";
import { appendLeadRow, type SheetRow } from "@/lib/server/sheets";
import { notifyAll } from "@/lib/server/notify";
import { clientIp, sendCapiEvent } from "@/lib/server/capi";
import { isDuplicatePhone, rateLimited } from "@/lib/server/rateLimit";
import { getDb } from "@/lib/server/db";
import { hasRecentLead, insertLead } from "@/lib/server/leadsRepo";

export const maxDuration = 30;

type Payload = Partial<LeadInput> & {
  project?: string;
  website?: string; // honeypot
  elapsedMs?: number;
  retry?: boolean;
  eventId?: string;
  attribution?: Record<string, string>;
  fbc?: string;
  fbp?: string;
  device?: string;
  pageUrl?: string;
};

const MIN_FILL_MS = 3000;
const str = (v: unknown, max = 500) => (typeof v === "string" ? v.slice(0, max) : "");

function istTimestamp() {
  return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: false });
}

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Bots: accept silently so they don't learn anything.
  if (body.website) return Response.json({ ok: true });
  if (!body.retry && (typeof body.elapsedMs !== "number" || body.elapsedMs < MIN_FILL_MS)) {
    return Response.json({ ok: true });
  }

  const ip = clientIp(req.headers);
  if (rateLimited(ip)) return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });

  const input: LeadInput = {
    name: normalizeName(str(body.name, 80)),
    phone: str(body.phone, 20).replace(/\D/g, ""),
    city: str(body.city, 40),
    interest: str(body.interest, 60),
    plotSize: str(body.plotSize, 40),
    email: str(body.email, 254).trim(),
    consent: body.consent === true,
  };
  const project = getProject(str(body.project, 80));
  if (!project) return Response.json({ ok: false, error: "unknown_project" }, { status: 422 });
  const errors = validateLead(input, { plotSizeOptions: project.plotSizeOptions });
  if (Object.keys(errors).length) return Response.json({ ok: false, errors }, { status: 422 });

  const eventId = /^[\w-]{8,64}$/.test(str(body.eventId)) ? str(body.eventId) : crypto.randomUUID();
  const attr = body.attribution ?? {};
  const userAgent = req.headers.get("user-agent") ?? "";

  const db = await getDb();
  const duplicate = db ? await hasRecentLead(db, input.phone).catch(() => isDuplicatePhone(input.phone)) : isDuplicatePhone(input.phone);

  const row: SheetRow = {
    timestamp_ist: istTimestamp(),
    project: project.name,
    name: input.name,
    phone: input.phone,
    city: input.city,
    interest: input.interest,
    plot_size: input.plotSize,
    email: input.email,
    duplicate: duplicate ? "yes" : "no",
    utm_source: str(attr.utm_source, 200),
    utm_medium: str(attr.utm_medium, 200),
    utm_campaign: str(attr.utm_campaign, 200),
    utm_content: str(attr.utm_content, 200),
    utm_term: str(attr.utm_term, 200),
    fbclid: str(attr.fbclid),
    fbc: str(body.fbc),
    fbp: str(body.fbp),
    landing_url: str(attr.landing_url, 1000),
    referrer: str(attr.referrer, 1000),
    device: str(body.device, 20),
    ip,
    user_agent: userAgent.slice(0, 300),
    event_id: eventId,
  };

  // Store + alert before responding so a failure can be surfaced to the user.
  // The database (admin dashboard) is the primary store; Sheet and alerts are copies.
  const [dbWrite, sheet, notify] = await Promise.allSettled([
    db
      ? insertLead(db, {
          project_slug: project.slug,
          project_name: project.name,
          name: row.name,
          phone: row.phone,
          email: row.email,
          city: row.city,
          interest: row.interest,
          plot_size: row.plot_size,
          duplicate,
          utm_source: row.utm_source,
          utm_medium: row.utm_medium,
          utm_campaign: row.utm_campaign,
          utm_content: row.utm_content,
          utm_term: row.utm_term,
          fbclid: row.fbclid,
          fbc: row.fbc,
          fbp: row.fbp,
          landing_url: row.landing_url,
          referrer: row.referrer,
          device: row.device,
          ip: row.ip,
          user_agent: row.user_agent,
          event_id: row.event_id,
        })
      : Promise.resolve(null),
    appendLeadRow(row),
    notifyAll(row),
  ]);
  if (dbWrite.status === "rejected") console.error("[lead] database write failed", dbWrite.reason);
  if (sheet.status === "rejected") console.error(sheet.reason);
  const emailConfigured = !!process.env.RESEND_API_KEY;
  const stored = (dbWrite.status === "fulfilled" && !!dbWrite.value) || (sheet.status === "fulfilled" && sheet.value);

  if (!stored && !db && !process.env.GOOGLE_SHEET_ID && !emailConfigured) {
    console.warn("[lead] No lead destination configured. Lead:", JSON.stringify(row));
  } else if (!stored && (!emailConfigured || notify.status === "rejected")) {
    return Response.json({ ok: false, error: "delivery_failed" }, { status: 502 });
  }

  after(() =>
    sendCapiEvent({
      eventName: "Lead",
      eventId,
      eventSourceUrl: str(body.pageUrl, 1000) || row.landing_url,
      ip,
      userAgent,
      fbc: row.fbc,
      fbp: row.fbp,
      phoneE164: `91${input.phone}`,
      email: input.email,
      city: input.city === "Ahmedabad" || input.city === "Gandhinagar" ? input.city : "",
      customData: { content_name: project.name, content_category: "plot_enquiry", interest: input.interest, plot_size: input.plotSize || undefined },
    }),
  );

  return Response.json({ ok: true, eventId });
}
