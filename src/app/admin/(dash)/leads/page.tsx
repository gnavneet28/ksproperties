import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/server/auth";
import { activeTeam, filterOptions, listLeads, statusCounts, type LeadFilters as Filters } from "@/lib/server/leadsRepo";
import { LEAD_STATUSES } from "@/lib/leads";
import { requestTime } from "@/lib/format";
import { LeadFilters } from "@/components/admin/LeadFilters";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { Card, EmptyState, PageHeader, btn } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Leads" };

const PAGE_SIZE = 25;
const FILTER_KEYS = ["q", "status", "project", "source", "assigned", "from", "to", "followUp", "sort"] as const;

function pick(sp: Record<string, string | string[] | undefined>) {
  const out: Record<string, string> = {};
  for (const k of FILTER_KEYS) {
    const v = sp[k];
    if (typeof v === "string" && v) out[k] = v.slice(0, 100);
  }
  return out;
}

function hrefWith(base: Record<string, string>, patch: Record<string, string | undefined>) {
  const p = new URLSearchParams(base);
  for (const [k, v] of Object.entries(patch)) {
    if (v) p.set(k, v);
    else p.delete(k);
  }
  const s = p.toString();
  return `/leads${s ? `?${s}` : ""}`;
}

async function LeadsView({ searchParams }: { searchParams: PageProps<"/admin/leads">["searchParams"] }) {
  const user = await requireUser();
  const sp = await searchParams;
  const params = pick(sp);
  const page = Math.max(1, Number(sp.page) || 1);
  const filters: Filters = { ...params, followUp: params.followUp === "due" ? "due" : undefined };
  const sort = params.sort === "oldest" ? "oldest" : params.followUp === "due" ? "follow_up" : "newest";

  const [{ rows, total }, counts, options, team] = await Promise.all([
    listLeads(filters, user.id, page, PAGE_SIZE, sort),
    statusCounts(filters, user.id),
    filterOptions(),
    activeTeam(),
  ]);
  const now = requestTime();
  const allCount = Object.values(counts).reduce((a, b) => a + b, 0);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const exportHref = `/api/admin/leads/export${hrefWith(params, {}).replace("/leads", "")}`;
  const isFollowUps = params.followUp === "due";

  return (
    <div className="space-y-5">
      <PageHeader
        title={isFollowUps ? "Follow-ups due" : "Leads"}
        subtitle={isFollowUps ? `${total} leads with a follow-up scheduled for today or earlier.` : `${total} ${total === 1 ? "enquiry matches" : "enquiries match"} your filters.`}
        actions={
          <a href={exportHref} className={btn.secondary} download>
            <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
            Export CSV
          </a>
        }
      />

      <LeadFilters
        projects={options.projects.map((p) => ({ value: p.slug, label: p.name }))}
        sources={options.sources}
        team={team}
      />

      <Card className="overflow-hidden">
        {/* Status tabs */}
        <nav aria-label="Filter by status" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line px-3 pt-2">
          {[{ id: "", label: "All", n: allCount }, ...LEAD_STATUSES.map((s) => ({ id: s.id, label: s.label, n: counts[s.id] ?? 0 }))].map((tab) => {
            const active = (params.status ?? "") === tab.id;
            return (
              <Link
                key={tab.id || "all"}
                href={hrefWith(params, { status: tab.id || undefined, page: undefined })}
                aria-current={active ? "page" : undefined}
                scroll={false}
                className={`relative flex min-h-11 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap px-3 text-sm transition-colors duration-200 ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {tab.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${active ? "bg-green-900 text-white" : "bg-ink/[0.06]"}`}>{tab.n}</span>
                {active && <span aria-hidden className="absolute inset-x-2 -bottom-px h-0.5 rounded bg-green-900" />}
              </Link>
            );
          })}
        </nav>

        {rows.length ? (
          <LeadsTable rows={rows} team={team} isAdmin={user.role === "admin"} now={now} />
        ) : (
          <EmptyState
            title={allCount ? "No leads match these filters" : "No leads yet"}
            text={allCount ? "Try a different status, date range or search term." : "Enquiries from the website will appear here as soon as they're submitted."}
            action={
              allCount ? (
                <Link href="/leads" className={btn.secondary}>
                  Clear filters
                </Link>
              ) : undefined
            }
          />
        )}

        {total > PAGE_SIZE && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm text-muted sm:flex-row">
            <p className="tabular-nums">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={hrefWith(params, { page: page > 2 ? String(page - 1) : undefined })}
                aria-disabled={page <= 1}
                className={`${btn.secondary} min-h-9 ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
              >
                Previous
              </Link>
              <span className="tabular-nums">
                {page} / {pages}
              </span>
              <Link
                href={hrefWith(params, { page: String(page + 1) })}
                aria-disabled={page >= pages}
                className={`${btn.secondary} min-h-9 ${page >= pages ? "pointer-events-none opacity-40" : ""}`}
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function LeadsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-9 w-40 animate-pulse rounded-lg bg-ink/10" />
      <div className="h-10 animate-pulse rounded-xl bg-white" />
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
            <div className="h-4 w-4 rounded bg-ink/10" />
            <div className="h-4 w-40 animate-pulse rounded bg-ink/10" />
            <div className="h-4 w-28 animate-pulse rounded bg-ink/[0.06]" />
            <div className="ml-auto h-6 w-24 animate-pulse rounded-full bg-ink/[0.06]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LeadsPage(props: PageProps<"/admin/leads">) {
  return (
    <Suspense fallback={<LeadsSkeleton />}>
      <LeadsView searchParams={props.searchParams} />
    </Suspense>
  );
}
