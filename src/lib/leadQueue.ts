"use client";

import { safeGet, safeSet } from "./attribution";

const QUEUE_KEY = "ag_lead_queue";

export function queueLead(payload: unknown) {
  safeSet(localStorage, QUEUE_KEY, JSON.stringify(payload));
}

/** Retry a previously failed submission once on the next page load. */
export function retryQueuedLead() {
  const raw = safeGet(localStorage, QUEUE_KEY);
  if (!raw) return;
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch {
    /* ignore */
  }
  fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...JSON.parse(raw), retry: true }),
    keepalive: true,
  }).catch(() => {});
}
