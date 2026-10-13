import Link from "next/link";

type Item = { key: string; label: string; n: number; href?: string; barClass?: string; marker?: React.ReactNode };

// `capitalize` suits raw values such as utm_source ("facebook"); pass false for proper labels.

/** Horizontal bar list: label + value as text (direct labels), bar shows proportion. */
export function BarList({
  items,
  total,
  empty = "No data yet",
  capitalize = true,
}: {
  items: Item[];
  total?: number;
  empty?: string;
  capitalize?: boolean;
}) {
  if (!items.length) return <p className="px-5 py-8 text-center text-sm text-muted">{empty}</p>;
  const max = Math.max(...items.map((i) => i.n), 1);
  const sum = total ?? items.reduce((s, i) => s + i.n, 0);
  return (
    <ul className="space-y-1 px-3 py-3">
      {items.map((it) => {
        const pct = sum ? Math.round((it.n / sum) * 100) : 0;
        const inner = (
          <>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 truncate text-ink">
                {it.marker}
                <span className={`truncate ${capitalize ? "capitalize" : ""}`}>{it.label}</span>
              </span>
              <span className="shrink-0 tabular-nums text-muted">
                <span className="text-ink">{it.n}</span> · {pct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-ink/[0.06]">
              <div className={`h-2 rounded-full ${it.barClass ?? "bg-green-900/85"}`} style={{ width: `${Math.max(2, (it.n / max) * 100)}%` }} />
            </div>
          </>
        );
        return (
          <li key={it.key}>
            {it.href ? (
              <Link href={it.href} className="block cursor-pointer rounded-xl px-2 py-2 transition-colors duration-150 hover:bg-paper">
                {inner}
              </Link>
            ) : (
              <div className="px-2 py-2">{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
