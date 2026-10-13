import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireUser } from "@/lib/server/auth";
import { requireDb } from "@/lib/server/db";
import { SITE_URL } from "@/lib/site";

async function Shell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const db = await requireDb();
  const [badges] = await db.query<{ newLeads: number; due: number }>(
    `SELECT count(*) FILTER (WHERE status = 'new')::int AS "newLeads",
            count(*) FILTER (WHERE follow_up_at IS NOT NULL AND status NOT IN ('booked','lost')
                               AND (follow_up_at AT TIME ZONE 'Asia/Kolkata')::date <= (now() AT TIME ZONE 'Asia/Kolkata')::date)::int AS due
       FROM leads`,
  );
  return (
    <AdminShell user={user} badges={badges} siteUrl={SITE_URL}>
      {children}
    </AdminShell>
  );
}

function ShellSkeleton() {
  return (
    <div className="flex flex-1">
      <aside className="hidden h-dvh w-[248px] shrink-0 bg-green-950 lg:block" />
      <div className="flex-1">
        <div className="h-14 bg-green-950 lg:hidden" />
        <div className="mx-auto max-w-[1320px] space-y-6 px-4 py-8 md:px-8">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-ink/10" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    </div>
  );
}

export default function DashLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
