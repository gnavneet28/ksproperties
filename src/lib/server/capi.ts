import "server-only";
import { createHash } from "node:crypto";

const sha256 = (v: string) => createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

export type CapiEvent = {
  eventName: "PageView" | "Lead" | "Contact";
  eventId: string;
  eventSourceUrl: string;
  ip?: string;
  userAgent?: string;
  fbc?: string;
  fbp?: string;
  phoneE164?: string; // e.g. 919876543210 (digits only)
  email?: string;
  city?: string;
  customData?: Record<string, unknown>;
};

/** Send one event to the Meta Conversions API. No-ops when not configured. */
export async function sendCapiEvent(e: CapiEvent) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) return;

  const user_data: Record<string, unknown> = {
    country: [sha256("in")],
    client_ip_address: e.ip || undefined,
    client_user_agent: e.userAgent || undefined,
    fbc: e.fbc || undefined,
    fbp: e.fbp || undefined,
  };
  if (e.phoneE164) user_data.ph = [sha256(e.phoneE164.replace(/\D/g, ""))];
  if (e.email) user_data.em = [sha256(e.email)];
  if (e.city) user_data.ct = [sha256(e.city.replace(/[^a-z]/gi, ""))];

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: e.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: e.eventId,
        event_source_url: e.eventSourceUrl,
        action_source: "website",
        user_data,
        custom_data: e.customData,
      },
    ],
  };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

  const res = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) console.error(`[capi] ${e.eventName} failed: ${res.status} ${await res.text()}`);
}

export function clientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    ""
  );
}
