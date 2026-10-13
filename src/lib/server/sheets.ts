import "server-only";
import { createSign } from "node:crypto";

/**
 * Minimal Google Sheets append via a service account (JWT → OAuth token → REST).
 * Avoids pulling the full googleapis SDK into the function bundle.
 */

type ServiceAccount = { client_email: string; private_key: string };

let cachedToken: { token: string; exp: number } | null = null;

function b64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function readServiceAccount(): ServiceAccount | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    // Accept raw JSON or base64-encoded JSON (easier to paste into env UIs).
    const json = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    const sa = JSON.parse(json) as ServiceAccount;
    sa.private_key = sa.private_key.replace(/\\n/g, "\n");
    return sa;
  } catch {
    console.error("[sheets] GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON");
    return null;
  }
}

async function getAccessToken(sa: ServiceAccount) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp - 60 > now) return cachedToken.token;

  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  const jwt = `${header}.${claim}.${signer.sign(sa.private_key).toString("base64url")}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  if (!res.ok) throw new Error(`[sheets] token request failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, exp: now + data.expires_in };
  return data.access_token;
}

export const SHEET_COLUMNS = [
  "timestamp_ist",
  "project",
  "name",
  "phone",
  "city",
  "interest",
  "plot_size",
  "email",
  "duplicate",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "fbc",
  "fbp",
  "landing_url",
  "referrer",
  "device",
  "ip",
  "user_agent",
  "event_id",
] as const;

export type SheetRow = Record<(typeof SHEET_COLUMNS)[number], string>;

export async function appendLeadRow(row: SheetRow): Promise<boolean> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sa = readServiceAccount();
  if (!sheetId || !sa) {
    console.warn("[sheets] GOOGLE_SHEET_ID / GOOGLE_SERVICE_ACCOUNT_JSON not set — skipping sheet write");
    return false;
  }
  const token = await getAccessToken(sa);
  const range = encodeURIComponent(process.env.GOOGLE_SHEET_RANGE || "Leads!A1");
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [SHEET_COLUMNS.map((c) => row[c] ?? "")] }),
    },
  );
  if (!res.ok) throw new Error(`[sheets] append failed: ${res.status} ${await res.text()}`);
  return true;
}
