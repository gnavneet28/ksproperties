"use client";

import { getCookie, uuid } from "./attribution";

type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean };

declare global {
  interface Window {
    fbq?: Fbq;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "";
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "";

function fbq(...args: unknown[]) {
  if (PIXEL_ID && window.fbq) window.fbq(...args);
}

function gtag(...args: unknown[]) {
  if (GA4_ID && window.gtag) window.gtag(...args);
}

/** Server-side Conversions API mirror for events that need it. */
function sendCapi(eventName: string, eventId: string, customData?: Record<string, unknown>) {
  const body = JSON.stringify({
    eventName,
    eventId,
    eventSourceUrl: location.href,
    fbc: getCookie("_fbc"),
    fbp: getCookie("_fbp"),
    customData,
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/event", new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {
    /* fall through */
  }
  fetch("/api/event", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(
    () => {},
  );
}

export function trackPageView() {
  const eventId = uuid();
  fbq("track", "PageView", {}, { eventID: eventId });
  sendCapi("PageView", eventId);
}

export function trackViewContent() {
  fbq("track", "ViewContent", { content_name: "lead_form" });
  gtag("event", "form_view");
}

export function trackFormStart() {
  fbq("trackCustom", "FormStart");
  gtag("event", "form_start");
}

export function trackContact(method: "whatsapp" | "call", phone?: string) {
  const eventId = uuid();
  fbq("track", "Contact", { method }, { eventID: eventId });
  gtag("event", method === "whatsapp" ? "whatsapp_click" : "call_click", phone ? { phone_number: phone } : undefined);
  sendCapi("Contact", eventId, { method });
}

/** Fired on /thank-you with the same event_id the server used for CAPI. */
export function trackLead(eventId: string, projectName = "") {
  fbq("track", "Lead", { content_name: projectName, content_category: "plot_enquiry" }, { eventID: eventId });
  gtag("event", "generate_lead", projectName ? { project: projectName } : undefined);
}
