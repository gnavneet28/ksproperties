"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { field } from "./ui";

type Opt = { value: string; label: string };

export function LeadFilters({
  projects,
  sources,
  team,
}: {
  projects: Opt[];
  sources: string[];
  team: { id: number; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [open, setOpen] = useState(false);
  const first = useRef(true);

  function apply(patch: Record<string, string>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    start(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  }

  // Debounced search.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = window.setTimeout(() => apply({ q: q.trim() }), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the query text changes
  }, [q]);

  const active = ["q", "project", "source", "assigned", "from", "to", "followUp"].some((k) => sp.get(k));
  const activeCount = ["project", "source", "assigned", "from", "to"].filter((k) => sp.get(k)).length;
  // On phones the dropdowns collapse behind a "Filters" toggle; from md up they're always shown.
  const more = open ? "contents" : "hidden md:contents";
  const select = `${field} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%234a5a52%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_10px_center] bg-no-repeat pr-8`;

  return (
    <div className={`grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(200px,1.4fr)_repeat(3,minmax(0,1fr))_minmax(260px,1.3fr)_auto] ${pending ? "opacity-70" : ""}`}>
      <label className="relative">
        <span className="sr-only">Search leads</span>
        <svg aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, phone, email, city"
          className={`${field} pl-9`}
        />
      </label>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-10 cursor-pointer items-center justify-between rounded-xl border border-ink/15 bg-white px-3 text-sm text-ink md:hidden"
      >
        <span>
          Filters
          {activeCount > 0 && <span className="ml-2 rounded-full bg-green-900 px-1.5 py-0.5 text-[11px] text-white">{activeCount}</span>}
        </span>
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={open ? "rotate-180" : ""}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div className={more}>

      <label>
        <span className="sr-only">Project</span>
        <select value={sp.get("project") ?? ""} onChange={(e) => apply({ project: e.target.value })} className={select}>
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">Source</span>
        <select value={sp.get("source") ?? ""} onChange={(e) => apply({ source: e.target.value })} className={select}>
          <option value="">All sources</option>
          <option value="direct">Direct / organic</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">Assigned to</span>
        <select value={sp.get("assigned") ?? ""} onChange={(e) => apply({ assigned: e.target.value })} className={select}>
          <option value="">Anyone</option>
          <option value="me">Assigned to me</option>
          <option value="none">Unassigned</option>
          {team.map((u) => (
            <option key={u.id} value={String(u.id)}>
              {u.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex min-w-0 items-center gap-1">
        <label className="min-w-0 flex-1">
          <span className="sr-only">From date</span>
          <input type="date" value={sp.get("from") ?? ""} onChange={(e) => apply({ from: e.target.value })} className={`${field} px-2`} />
        </label>
        <span className="text-muted" aria-hidden>
          –
        </span>
        <label className="min-w-0 flex-1">
          <span className="sr-only">To date</span>
          <input type="date" value={sp.get("to") ?? ""} onChange={(e) => apply({ to: e.target.value })} className={`${field} px-2`} />
        </label>
      </div>

      </div>

      <button
        type="button"
        disabled={!active}
        onClick={() => {
          setQ("");
          start(() => router.replace(pathname + (sp.get("status") ? `?status=${sp.get("status")}` : ""), { scroll: false }));
        }}
        className="min-h-10 cursor-pointer rounded-xl px-3 text-sm text-muted transition-colors hover:bg-white hover:text-ink disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
      >
        Clear
      </button>
    </div>
  );
}
