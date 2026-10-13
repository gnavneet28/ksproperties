"use client";

import { useState } from "react";

type Point = { day: string; n: number };

/** Top of the y-scale: 4 equal integer steps (1–5, then 1/2/2.5/5 × 10^n, rounded to whole numbers). */
function niceMax(v: number) {
  const raw = Math.max(1, Math.ceil(v / 4));
  if (raw <= 5) return raw * 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((s) => Math.ceil(s * pow)).find((s) => s >= raw) ?? pow * 10;
  return step * 4;
}

const fmtDay = (d: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${d}T00:00:00+05:30`).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", ...opts });

/** Single-series bar chart: leads per day. One hue, recessive grid, hover tooltip, table view. */
export function DailyChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);
  const max = niceMax(Math.max(0, ...data.map((d) => d.n)));
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);
  const labelEvery = Math.ceil(data.length / 7);
  const total = data.reduce((s, d) => s + d.n, 0);

  return (
    <div>
      <div className="mb-3 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setAsTable((v) => !v)}
          className="cursor-pointer rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-paper hover:text-ink"
        >
          {asTable ? "Show chart" : "Show table"}
        </button>
      </div>

      {asTable ? (
        <div className="max-h-72 overflow-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-paper text-left text-xs text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 text-right font-medium">Leads</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d) => (
                <tr key={d.day} className="border-t border-line">
                  <td className="px-3 py-1.5">{fmtDay(d.day, { weekday: "short", day: "numeric", month: "short" })}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{d.n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative" role="img" aria-label={`Leads per day, ${data.length} days, ${total} total`}>
          <div className="flex h-56 gap-3">
            {/* y axis — same scale as the grid lines */}
            <div className="relative w-6 text-right text-[11px] tabular-nums text-muted">
              {ticks.map((t) => (
                <span key={t} className="absolute right-0 translate-y-1/2 leading-none" style={{ bottom: `${(t / max) * 100}%` }}>
                  {t}
                </span>
              ))}
            </div>
            <div className="relative flex-1">
              {/* recessive grid */}
              {ticks.map((t) => (
                <div key={t} className="absolute inset-x-0 border-t border-ink/[0.07]" style={{ bottom: `${(t / max) * 100}%` }} />
              ))}
              <div className="absolute inset-0 flex items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
                {data.map((d, i) => (
                  <div
                    key={d.day}
                    className="group relative flex h-full flex-1 cursor-default items-end justify-center"
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    tabIndex={0}
                    aria-label={`${fmtDay(d.day, { day: "numeric", month: "short" })}: ${d.n} leads`}
                  >
                    <div
                      className={`w-full max-w-[22px] rounded-t-[4px] transition-colors duration-150 ${
                        hover === i ? "bg-green-700" : "bg-green-900/85"
                      } ${hover !== null && hover !== i ? "opacity-60" : ""}`}
                      style={{ height: d.n ? `max(2px, ${(d.n / max) * 100}%)` : "0" }}
                    />
                    {hover === i && (
                      <div className="pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs text-white shadow-lg">
                        <span className="text-white/70">{fmtDay(d.day, { weekday: "short", day: "numeric", month: "short" })}</span>
                        <span className="ml-2 tabular-nums">{d.n} lead{d.n === 1 ? "" : "s"}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* x labels */}
          <div className="ml-9 mt-2 flex gap-[2px] text-[11px] text-muted">
            {data.map((d, i) => (
              <span key={d.day} className="flex-1 overflow-visible whitespace-nowrap text-center">
                {i % labelEvery === 0 ? fmtDay(d.day, { day: "numeric", month: "short" }) : ""}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
