"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { assignLeads, removeLeads, updateLeadStatus, type ActionResult } from "@/app/admin/actions";
import { LEAD_STATUSES, type LeadRow } from "@/lib/leads";
import { formatDateTime, formatPhone, timeAgo } from "@/lib/format";
import { ConfirmDialog } from "./ConfirmDialog";
import { StatusSelect } from "./StatusSelect";
import { useToast } from "./Toast";
import { Avatar, btn, field } from "./ui";

export function LeadsTable({
  rows,
  team,
  isAdmin,
  now,
}: {
  rows: LeadRow[];
  team: { id: number; name: string }[];
  isAdmin: boolean;
  now: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, start] = useTransition();

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const ids = [...selected];

  function toggle(id: number) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function run(fn: () => Promise<ActionResult>, clear = true) {
    start(async () => {
      const res = await fn();
      toast(res.ok ? res.message : res.error, res.ok ? "success" : "error");
      if (res.ok) router.refresh();
      if (res.ok && clear) setSelected(new Set());
    });
  }

  const select = `${field} min-h-9 w-auto appearance-none bg-white pr-8 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%234a5a52%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat`;

  return (
    <div className="relative">
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="sticky top-14 z-20 flex flex-wrap items-center gap-2 border-b border-line bg-green-950 px-4 py-2.5 text-white lg:top-0" role="region" aria-label="Bulk actions">
          <span className="mr-2 text-sm">
            {selected.size} selected
          </span>
          <label>
            <span className="sr-only">Set status</span>
            <select
              value=""
              disabled={pending}
              onChange={(e) => e.target.value && run(() => updateLeadStatus(ids, e.target.value))}
              className={`${select} text-ink`}
            >
              <option value="">Set status…</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Assign to</span>
            <select
              value=""
              disabled={pending}
              onChange={(e) => e.target.value && run(() => assignLeads(ids, e.target.value))}
              className={`${select} text-ink`}
            >
              <option value="">Assign to…</option>
              {team.map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {u.name}
                </option>
              ))}
              <option value="none">Unassign</option>
            </select>
          </label>
          {isAdmin && (
            <button type="button" onClick={() => setConfirmDelete(true)} className="min-h-9 cursor-pointer rounded-xl px-3 text-sm text-red-200 transition-colors hover:bg-white/10 hover:text-white">
              Delete
            </button>
          )}
          <button type="button" onClick={() => setSelected(new Set())} className="ml-auto min-h-9 cursor-pointer rounded-xl px-3 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white">
            Clear selection
          </button>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[920px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="w-10 py-3 pl-5 pr-2 font-medium">
                <input
                  type="checkbox"
                  aria-label="Select all on this page"
                  checked={allSelected}
                  onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))}
                  className="h-4 w-4 cursor-pointer accent-green-800"
                />
              </th>
              <th className="px-3 py-3 font-medium">Lead</th>
              <th className="px-3 py-3 font-medium">Project · plot</th>
              <th className="px-3 py-3 font-medium">Interest</th>
              <th className="px-3 py-3 font-medium">Source</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Owner</th>
              <th className="px-3 py-3 pr-5 font-medium">Received</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => {
              const overdue = l.follow_up_at && new Date(l.follow_up_at).getTime() < now && !["booked", "lost"].includes(l.status);
              return (
                <tr
                  key={l.id}
                  onClick={() => router.push(`/leads/${l.id}`)}
                  className={`cursor-pointer border-b border-line transition-colors duration-150 last:border-0 hover:bg-paper/70 ${
                    selected.has(l.id) ? "bg-gold-100/40" : ""
                  }`}
                >
                  <td className="py-3 pl-5 pr-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${l.name}`}
                      checked={selected.has(l.id)}
                      onChange={() => toggle(l.id)}
                      className="h-4 w-4 cursor-pointer accent-green-800"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <Link href={`/leads/${l.id}`} onClick={(e) => e.stopPropagation()} className="font-medium text-ink hover:text-green-700">
                      {l.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatPhone(l.phone)}
                      {l.city ? ` · ${l.city}` : ""}
                      {l.duplicate && <span className="ml-1.5 rounded bg-ink/[0.06] px-1.5 py-0.5 text-[10px] uppercase tracking-wide">Repeat</span>}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-ink">{l.project_name}</p>
                    <p className="mt-0.5 text-xs text-muted">{l.plot_size || "Any size"}</p>
                  </td>
                  <td className="px-3 py-3 text-ink/85">{l.interest || "—"}</td>
                  <td className="px-3 py-3">
                    <p className="text-ink/85">{l.utm_source || "direct"}</p>
                    {l.utm_campaign && <p className="mt-0.5 max-w-[160px] truncate text-xs text-muted">{l.utm_campaign}</p>}
                  </td>
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <StatusSelect leadId={l.id} status={l.status} />
                  </td>
                  <td className="px-3 py-3">
                    {l.assignee_name ? (
                      <span className="inline-flex items-center gap-2 text-ink/85">
                        <Avatar name={l.assignee_name} size={24} />
                        {l.assignee_name.split(" ")[0]}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 pr-5">
                    <p className="whitespace-nowrap text-ink/85" title={formatDateTime(l.created_at)}>
                      {timeAgo(l.created_at, now)}
                    </p>
                    {l.follow_up_at && (
                      <p className={`mt-0.5 whitespace-nowrap text-xs ${overdue ? "text-red-700" : "text-muted"}`}>
                        {overdue ? "Overdue" : "Follow-up"} · {formatDateTime(l.follow_up_at)}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-line md:hidden">
        {rows.map((l) => (
          <li key={l.id} className="flex gap-3 px-4 py-4">
            <input
              type="checkbox"
              aria-label={`Select ${l.name}`}
              checked={selected.has(l.id)}
              onChange={() => toggle(l.id)}
              className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-green-800"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/leads/${l.id}`} className="font-medium text-ink">
                  {l.name}
                </Link>
                <span className="shrink-0 text-xs text-muted">{timeAgo(l.created_at, now)}</span>
              </div>
              <p className="mt-0.5 text-sm text-muted">
                {formatPhone(l.phone)} · {l.project_name}
              </p>
              <p className="text-xs text-muted">
                {l.interest || "—"} · {l.utm_source || "direct"}
              </p>
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <StatusSelect leadId={l.id} status={l.status} />
                <a href={`tel:+91${l.phone}`} className={`${btn.secondary} min-h-9 px-3`}>
                  Call
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${selected.size} lead${selected.size === 1 ? "" : "s"}?`}
        text="This permanently removes the leads and their notes and history from the dashboard. Copies already sent to Google Sheets or email are not affected."
        confirmLabel="Delete"
        pending={pending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() =>
          run(async () => {
            const res = await removeLeads(ids);
            setConfirmDelete(false);
            return res;
          })
        }
      />
    </div>
  );
}
