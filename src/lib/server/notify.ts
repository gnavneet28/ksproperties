import "server-only";
import type { SheetRow } from "./sheets";

function summary(row: SheetRow) {
  return [
    `New plot enquiry: ${row.project}${row.duplicate === "yes" ? " (DUPLICATE within 24h)" : ""}`,
    `Name: ${row.name}`,
    `Phone: +91 ${row.phone}`,
    `City: ${row.city}`,
    `Interest: ${row.interest}`,
    row.plot_size ? `Plot size: ${row.plot_size}` : "",
    row.email ? `Email: ${row.email}` : "",
    `Source: ${[row.utm_source, row.utm_medium, row.utm_campaign].filter(Boolean).join(" / ") || "direct"}`,
    row.utm_content ? `Ad: ${row.utm_content}` : "",
    `Time (IST): ${row.timestamp_ist}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Email via Resend's REST API. */
async function sendEmail(row: SheetRow) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAILS?.split(",").map((s) => s.trim()).filter(Boolean);
  if (!key || !to?.length) {
    console.warn("[notify] RESEND_API_KEY / LEAD_NOTIFY_EMAILS not set — skipping email");
    return;
  }
  const text = summary(row);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.LEAD_FROM_EMAIL || "Leads <onboarding@resend.dev>",
      to,
      subject: `${row.duplicate === "yes" ? "[DUP] " : ""}New lead · ${row.project}: ${row.name} · ${row.city} · ${row.interest}`,
      text,
      html: `<pre style="font:14px/1.5 system-ui,sans-serif">${escapeHtml(text)}</pre><p><a href="tel:+91${row.phone}">Call +91 ${row.phone}</a></p>`,
    }),
  });
  if (!res.ok) throw new Error(`[notify] email failed: ${res.status} ${await res.text()}`);
}

async function sendTelegram(row: SheetRow) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: summary(row) }),
  });
  if (!res.ok) throw new Error(`[notify] telegram failed: ${res.status}`);
}

/**
 * WhatsApp Cloud API alert to the sales lead. Business-initiated messages need an
 * approved template; the template is expected to take one body parameter (the summary).
 */
async function sendWhatsAppAlert(row: SheetRow) {
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.WHATSAPP_ALERT_TO;
  const template = process.env.WHATSAPP_ALERT_TEMPLATE;
  if (!token || !phoneId || !to || !template) return;
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: template,
        language: { code: process.env.WHATSAPP_ALERT_LANG || "en" },
        components: [{ type: "body", parameters: [{ type: "text", text: summary(row).replace(/\n/g, " | ") }] }],
      },
    }),
  });
  if (!res.ok) throw new Error(`[notify] whatsapp failed: ${res.status} ${await res.text()}`);
}

async function sendCrmWebhook(row: SheetRow) {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) return;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`[notify] CRM webhook failed: ${res.status}`);
}

export async function notifyAll(row: SheetRow) {
  const results = await Promise.allSettled([
    sendEmail(row),
    sendTelegram(row),
    sendWhatsAppAlert(row),
    sendCrmWebhook(row),
  ]);
  results.forEach((r) => r.status === "rejected" && console.error(r.reason));
}
