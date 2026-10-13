import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireUser } from "@/lib/server/auth";
import { activeTeam, getActivities, getLead, relatedLeads } from "@/lib/server/leadsRepo";
import { formatDateTime, requestTime, formatPhone, timeAgo } from "@/lib/format";
import type { Activity } from "@/lib/leads";
import { DeleteLeadButton, FollowUpField, NoteComposer, OwnerSelect, PipelineStepper } from "@/components/admin/LeadControls";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { Avatar, Card, CardHeader, StatusPill, btn } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Lead" };

const ACTIVITY_DOT: Record<Activity["type"], string> = {
  created: "bg-gold-500",
  status: "bg-[#7b57c4]",
  note: "bg-green-800",
  assigned: "bg-[#2f6cc0]",
  follow_up: "bg-[#2e8b57]",
  edited: "bg-ink/40",
};

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <dt className="shrink-0 text-muted">{k}</dt>
      <dd className="min-w-0 break-words text-right text-ink">{v || "—"}</dd>
    </div>
  );
}

async function LeadView({ params }: { params: PageProps<"/admin/leads/[id]">["params"] }) {
  const user = await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const lead = await getLead(id);
  if (!lead) notFound();
  const [activities, related, team] = await Promise.all([getActivities(id), relatedLeads(lead.phone, id), activeTeam()]);
  const now = requestTime();
  const wa = `https://wa.me/91${lead.phone}?text=${encodeURIComponent(`Hi ${lead.name.split(" ")[0]}, this is KS Properties regarding your enquiry for ${lead.project_name}.`)}`;
  const icon = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/leads" className="inline-flex min-h-9 items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
          <svg {...icon}>
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          All leads
        </Link>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={lead.name} size={52} />
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-[26px] leading-tight md:text-[30px]">{lead.name}</h1>
                <StatusPill status={lead.status} />
                {lead.duplicate && <span className="rounded-full bg-ink/[0.06] px-2.5 py-1 text-xs text-muted">Repeat enquiry</span>}
              </div>
              <p className="mt-1 text-sm text-muted">
                {lead.project_name} · received {timeAgo(lead.created_at, now)} ({formatDateTime(lead.created_at)})
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`tel:+91${lead.phone}`} className={btn.primary}>
              <svg {...icon}>
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
              </svg>
              Call {formatPhone(lead.phone)}
            </a>
            <a href={wa} target="_blank" rel="noopener noreferrer" className={btn.secondary}>
              WhatsApp
            </a>
            {lead.email && (
              <a href={`mailto:${lead.email}`} className={btn.secondary}>
                Email
              </a>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader title="Pipeline" subtitle="Click a stage to move this lead. Every change is logged below." />
        <div className="p-5">
          <PipelineStepper leadId={lead.id} status={lead.status} />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Notes & activity" />
            <div className="border-b border-line p-5">
              <NoteComposer leadId={lead.id} />
            </div>
            <ol className="relative px-5 py-4">
              <span aria-hidden className="absolute bottom-6 left-[27px] top-6 w-px bg-line" />
              {activities.map((a) => (
                <li key={a.id} className="relative flex gap-4 py-3">
                  <span aria-hidden className={`relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-white ${ACTIVITY_DOT[a.type] ?? "bg-ink/40"}`} />
                  <div className="min-w-0 flex-1">
                    {a.type === "note" ? (
                      <div className="rounded-xl border border-line bg-paper/60 px-4 py-3">
                        <p className="whitespace-pre-wrap text-sm text-ink">{a.body}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-ink">{a.body}</p>
                    )}
                    <p className="mt-1 text-xs text-muted">
                      {a.user_name ?? "Website"} · {formatDateTime(a.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Next step" />
            <div className="space-y-5 p-5">
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted">Status</p>
                <StatusSelect leadId={lead.id} status={lead.status} size="md" />
              </div>
              <OwnerSelect leadId={lead.id} assignedTo={lead.assigned_to} team={team} />
              <FollowUpField leadId={lead.id} followUpAt={lead.follow_up_at} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Enquiry" />
            <dl className="divide-y divide-line px-5 py-2">
              <Row k="Phone" v={formatPhone(lead.phone)} />
              <Row k="Email" v={lead.email} />
              <Row k="City" v={lead.city} />
              <Row k="Project" v={lead.project_name} />
              <Row k="Plot size" v={lead.plot_size || "Any size"} />
              <Row k="Interested in" v={lead.interest} />
            </dl>
          </Card>

          <Card>
            <CardHeader title="Attribution" subtitle="Where this lead came from" />
            <dl className="divide-y divide-line px-5 py-2">
              <Row k="Source" v={lead.utm_source || "direct"} />
              <Row k="Medium" v={lead.utm_medium} />
              <Row k="Campaign" v={lead.utm_campaign} />
              <Row k="Ad / content" v={lead.utm_content} />
              <Row k="Term" v={lead.utm_term} />
              <Row k="Facebook click ID" v={lead.fbclid ? `${lead.fbclid.slice(0, 18)}…` : ""} />
              <Row k="Landing page" v={lead.landing_url ? <span className="break-all text-xs">{lead.landing_url}</span> : ""} />
              <Row k="Referrer" v={lead.referrer ? <span className="break-all text-xs">{lead.referrer}</span> : ""} />
              <Row k="Device" v={<span className="capitalize">{lead.device}</span>} />
            </dl>
          </Card>

          {related.length > 0 && (
            <Card>
              <CardHeader title="Other enquiries from this number" />
              <ul className="divide-y divide-line">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link href={`/leads/${r.id}`} className="flex cursor-pointer items-center justify-between gap-3 px-5 py-3 text-sm transition-colors hover:bg-paper">
                      <span>
                        {r.project_name}
                        <span className="block text-xs text-muted">{formatDateTime(r.created_at)}</span>
                      </span>
                      <StatusPill status={r.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {user.role === "admin" && (
            <div className="flex justify-end">
              <DeleteLeadButton leadId={lead.id} name={lead.name} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LeadSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 w-80 animate-pulse rounded-xl bg-ink/10" />
      <div className="h-32 animate-pulse rounded-2xl border border-line bg-white" />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="h-96 animate-pulse rounded-2xl border border-line bg-white" />
        <div className="h-96 animate-pulse rounded-2xl border border-line bg-white" />
      </div>
    </div>
  );
}

export default function LeadPage(props: PageProps<"/admin/leads/[id]">) {
  return (
    <Suspense fallback={<LeadSkeleton />}>
      <LeadView params={props.params} />
    </Suspense>
  );
}
