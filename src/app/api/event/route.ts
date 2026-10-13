import { after } from "next/server";
import { clientIp, sendCapiEvent } from "@/lib/server/capi";

const ALLOWED = new Set(["PageView", "Contact"] as const);
const str = (v: unknown, max = 500) => (typeof v === "string" ? v.slice(0, max) : "");

/** Mirrors browser Pixel events to the Conversions API (deduped by event_id). */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const eventName = str(body.eventName) as "PageView" | "Contact";
  const eventId = str(body.eventId, 64);
  if (!ALLOWED.has(eventName) || !/^[\w-]{8,64}$/.test(eventId)) return new Response(null, { status: 400 });

  const method = (body.customData as Record<string, unknown> | undefined)?.method;
  const ip = clientIp(req.headers);
  const userAgent = req.headers.get("user-agent") ?? "";

  after(() =>
    sendCapiEvent({
      eventName,
      eventId,
      eventSourceUrl: str(body.eventSourceUrl, 1000),
      ip,
      userAgent,
      fbc: str(body.fbc),
      fbp: str(body.fbp),
      customData: method === "whatsapp" || method === "call" ? { method } : undefined,
    }),
  );
  return new Response(null, { status: 204 });
}
