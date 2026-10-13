"use client";

/**
 * Captures UTM params, fbclid and Meta browser IDs as early as possible and
 * keeps them in storage so they survive navigation between routes.
 */

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const STORE_KEY = "ag_attr";

export type Attribution = Partial<Record<(typeof UTM_KEYS)[number] | "fbclid", string>> & {
  landing_url?: string;
  referrer?: string;
};

function safeGet(storage: Storage, key: string) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch {
    /* storage blocked */
  }
}

export function getCookie(name: string) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}

function setCookie(name: string, value: string, days = 90) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${
    location.protocol === "https:" ? "; Secure" : ""
  }`;
}

/** Run once per page load. Stores attribution when the URL carries new campaign params. */
export function captureAttribution() {
  const params = new URLSearchParams(location.search);
  const fbclid = params.get("fbclid");
  const hasCampaign = UTM_KEYS.some((k) => params.has(k)) || !!fbclid;
  const existing = readAttribution();

  if (hasCampaign || !existing.landing_url) {
    const attr: Attribution = { landing_url: location.href, referrer: document.referrer || "" };
    UTM_KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) attr[k] = v.slice(0, 200);
    });
    if (fbclid) attr.fbclid = fbclid.slice(0, 500);
    safeSet(sessionStorage, STORE_KEY, JSON.stringify(attr));
    safeSet(localStorage, STORE_KEY, JSON.stringify(attr));
  }

  // _fbc must be set immediately from fbclid (Pixel loads later).
  if (fbclid) {
    const current = getCookie("_fbc");
    if (!current.endsWith(fbclid)) setCookie("_fbc", `fb.1.${Date.now()}.${fbclid}`);
  }
  // _fbp: Pixel reuses an existing cookie, so creating it early keeps IDs stable.
  if (!getCookie("_fbp")) {
    setCookie("_fbp", `fb.1.${Date.now()}.${Math.floor(Math.random() * 1e10)}`);
  }
}

export function readAttribution(): Attribution {
  const raw = safeGet(sessionStorage, STORE_KEY) ?? safeGet(localStorage, STORE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Attribution;
  } catch {
    return {};
  }
}

export function deviceType() {
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}

export function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export { safeGet, safeSet };
