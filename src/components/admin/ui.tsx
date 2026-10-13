import type { ReactNode } from "react";
import { statusMeta, type StatusTone } from "@/lib/leads";

/** Status colours always ship with a dot + label, never colour alone. */
export const TONE_CLASSES: Record<StatusTone, { pill: string; dot: string; bar: string }> = {
  new: { pill: "bg-gold-100 text-[#6b4f00] ring-gold-400/50", dot: "bg-gold-500", bar: "bg-gold-500" },
  info: { pill: "bg-[#e8f0fb] text-[#1d4f91] ring-[#1d4f91]/20", dot: "bg-[#2f6cc0]", bar: "bg-[#2f6cc0]" },
  progress: { pill: "bg-[#efe9fb] text-[#5b3b9a] ring-[#5b3b9a]/20", dot: "bg-[#7b57c4]", bar: "bg-[#7b57c4]" },
  good: { pill: "bg-[#e3f3ea] text-[#1e6b43] ring-[#1e6b43]/25", dot: "bg-[#2e8b57]", bar: "bg-[#2e8b57]" },
  won: { pill: "bg-green-900 text-white ring-green-900", dot: "bg-gold-400", bar: "bg-green-900" },
  muted: { pill: "bg-[#efefea] text-[#5c625e] ring-[#5c625e]/20", dot: "bg-[#9aa09c]", bar: "bg-[#9aa09c]" },
};

export function StatusPill({ status, className = "" }: { status: string; className?: string }) {
  const meta = statusMeta(status);
  const t = TONE_CLASSES[meta.tone];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${t.pill} ${className}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      {meta.label}
    </span>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-white ${className}`}>{children}</section>;
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        <h2 className="text-[15px] font-medium text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[26px] leading-tight text-ink md:text-[30px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full border border-line bg-paper text-muted" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 7h18M3 12h18M3 17h10" strokeLinecap="round" />
        </svg>
      </span>
      <p className="mt-4 text-[15px] font-medium text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const ini = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="grid shrink-0 place-items-center rounded-full bg-green-700/10 font-medium text-green-800"
    >
      {ini}
    </span>
  );
}

export const btn = {
  primary:
    "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-900 px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-ink/15 bg-white px-4 text-sm font-medium text-ink transition-colors duration-200 hover:border-ink/30 hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60",
  danger:
    "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-600/30 bg-white px-4 text-sm font-medium text-red-700 transition-colors duration-200 hover:bg-red-600/5 disabled:cursor-not-allowed disabled:opacity-60",
  ghost:
    "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-muted transition-colors duration-200 hover:bg-paper hover:text-ink",
};

export const field =
  "block w-full min-h-10 rounded-xl border border-ink/15 bg-white px-3 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-ink/45 hover:border-ink/30 focus:border-green-700 focus:ring-2 focus:ring-green-700/15";

export const label = "mb-1.5 block text-xs font-medium text-muted";
