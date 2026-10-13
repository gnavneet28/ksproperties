import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/server/auth";
import { dashboardStats } from "@/lib/server/leadsRepo";
import { LEAD_STATUSES } from "@/lib/leads";
import { formatDateTime, requestTime, formatPhone, timeAgo } from "@/lib/format";
import { BarList } from "@/components/admin/BarList";
import { DailyChart } from "@/components/admin/DailyChart";
import { Card, CardHeader, EmptyState, PageHeader, StatusPill, TONE_CLASSES, btn } from "@/components/admin/ui";

const RANGES = [7, 30, 90] as const;

function greeting(hourIst: number) {
  return hourIst < 12 ? "Good morning" : hourIst < 17 ? "Good afternoon" : "Good evening";
}

function Kpi({ label, value, hint, href, tone }: { label: string; value: string; hint?: React.ReactNode; href?: string; tone?: "alert" }) {
  const body = (
    <>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={`mt-2 text-[30px] leading-none tracking-tight tabular-nums ${tone === "alert" ? "text-red-700" : "text-ink"}`}>{value}</p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </>
  );
  const cls = "block rounded-2xl border border-line bg-white p-5 transition-colors duration-200";
  return href ? (
    <Link href={href} className={`${cls} cursor-pointer hover:border-ink/25`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

async function Overview({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const user = await requireUser();
  const sp = await searchParams;
  const days = RANGES.includes(Number(sp.range) as (typeof RANGES)[number]) ? Number(sp.range) : 30;
  const s = await dashboardStats(days);
  const now = requestTime();
  const hourIst = Number(new Date(now).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false }));

  const delta = s.kpi.prev_total ? Math.round(((s.kpi.total - s.kpi.prev_total) / s.kpi.prev_total) * 100) : null;
  const convRate = s.kpi.total ? ((s.kpi.converted / s.kpi.total) * 100).toFixed(1) : "0.0";
  const statusCount = Object.fromEntries(s.byStatus.map((r) => [r.key, r.n]));
  const rangeTotal = s.kpi.total;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting(hourIst)}, ${user.name.split(" ")[0]}`}
        subtitle={`Here's how enquiries are moving over the last ${days} days.`}
        actions={
          <div role="group" aria-label="Date range" className="inline-flex rounded-xl border border-ink/15 bg-white p-1">
            {RANGES.map((r) => (
              <Link
                key={r}
                href={`/?range=${r}`}
                aria-current={r === days ? "true" : undefined}
                className={`min-h-9 cursor-pointer rounded-lg px-3 py-1.5 text-sm transition-colors duration-200 ${
                  r === days ? "bg-green-900 text-white" : "text-muted hover:text-ink"
                }`}
              >
                {r} days
              </Link>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label={`Leads · last ${days} days`}
          value={String(s.kpi.total)}
          hint={
            delta === null ? (
              "No earlier period to compare"
            ) : (
              <span>
                <span className={delta >= 0 ? "text-[#1e6b43]" : "text-red-700"}>
                  {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
                </span>{" "}
                vs previous {days} days
              </span>
            )
          }
          href="/leads"
        />
        <Kpi label="New, not yet contacted" value={String(s.kpi.new_open)} hint="Call these first" href="/leads?status=new" />
        <Kpi
          label="Follow-ups due today"
          value={String(s.kpi.due + s.kpi.overdue)}
          hint={s.kpi.overdue ? <span className="text-red-700">{s.kpi.overdue} overdue</span> : "Nothing overdue"}
          href="/leads?followUp=due"
          tone={s.kpi.overdue ? "alert" : undefined}
        />
        <Kpi label="Conversion to EOI" value={`${convRate}%`} hint={`${s.kpi.converted} EOI paid or booked · ${s.kpi.site_visits} visits scheduled`} />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Card>
          <CardHeader title="Leads per day" subtitle={`${rangeTotal} enquiries in the last ${days} days`} />
          <div className="px-5 pb-5 pt-2">
            <DailyChart data={s.daily} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Pipeline" subtitle="Current status of leads in this period" />
          <BarList
            total={rangeTotal}
            capitalize={false}
            empty="No leads in this period"
            items={LEAD_STATUSES.filter((st) => statusCount[st.id]).map((st) => ({
              key: st.id,
              label: st.label,
              n: statusCount[st.id] ?? 0,
              href: `/leads?status=${st.id}`,
              barClass: TONE_CLASSES[st.tone].bar,
              marker: <span aria-hidden className={`h-2 w-2 rounded-full ${TONE_CLASSES[st.tone].dot}`} />,
            }))}
          />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Top sources" subtitle="utm_source" />
          <BarList items={s.bySource.map((r) => ({ key: r.key, label: r.key, n: r.n, href: `/leads?source=${encodeURIComponent(r.key)}` }))} total={rangeTotal} />
        </Card>
        <Card>
          <CardHeader title="Projects" />
          <BarList capitalize={false} items={s.byProject.map((r) => ({ key: r.key, label: r.label, n: r.n, href: `/leads?project=${r.key}` }))} total={rangeTotal} />
        </Card>
        <Card>
          <CardHeader title="Cities" />
          <BarList capitalize={false} items={s.byCity.map((r) => ({ key: r.key, label: r.key, n: r.n }))} total={rangeTotal} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Follow-ups due"
            subtitle="Today and overdue"
            action={
              <Link href="/leads?followUp=due" className={btn.ghost}>
                View all
              </Link>
            }
          />
          {s.followUps.length ? (
            <ul className="divide-y divide-line">
              {s.followUps.map((l) => {
                const overdue = new Date(l.follow_up_at!).getTime() < now;
                return (
                  <li key={l.id}>
                    <Link href={`/leads/${l.id}`} className="flex cursor-pointer items-center gap-4 px-5 py-3 transition-colors hover:bg-paper">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-ink">{l.name}</p>
                        <p className="truncate text-xs text-muted">
                          {formatPhone(l.phone)} · {l.project_name}
                        </p>
                      </div>
                      <span className={`whitespace-nowrap text-xs ${overdue ? "text-red-700" : "text-muted"}`}>
                        {overdue ? "Overdue · " : ""}
                        {formatDateTime(l.follow_up_at)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState title="You're all caught up" text="No follow-ups due today. Set one from any lead's page." />
          )}
        </Card>
        <Card>
          <CardHeader
            title="Latest enquiries"
            action={
              <Link href="/leads" className={btn.ghost}>
                All leads
              </Link>
            }
          />
          {s.recent.length ? (
            <ul className="divide-y divide-line">
              {s.recent.map((l) => (
                <li key={l.id}>
                  <Link href={`/leads/${l.id}`} className="flex cursor-pointer items-center gap-4 px-5 py-3 transition-colors hover:bg-paper">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{l.name}</p>
                      <p className="truncate text-xs text-muted">
                        {l.project_name} · {l.city || "—"} · {l.utm_source || "direct"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusPill status={l.status} />
                      <span className="text-[11px] text-muted">{timeAgo(l.created_at, now)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No enquiries yet" text="Leads from the website form will appear here the moment they're submitted." />
          )}
        </Card>
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-72 animate-pulse rounded-lg bg-ink/10" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-[118px] animate-pulse rounded-2xl border border-line bg-white" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="h-[360px] animate-pulse rounded-2xl border border-line bg-white" />
        <div className="h-[360px] animate-pulse rounded-2xl border border-line bg-white" />
      </div>
    </div>
  );
}

export default function OverviewPage(props: PageProps<"/admin">) {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <Overview searchParams={props.searchParams} />
    </Suspense>
  );
}
