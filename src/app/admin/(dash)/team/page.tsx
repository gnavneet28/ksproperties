import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/server/auth";
import { listTeam } from "@/lib/server/leadsRepo";
import { AddMemberForm, TeamList } from "@/components/admin/TeamManager";
import { PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Team" };

async function TeamView() {
  const me = await requireUser("admin");
  const members = await listTeam();
  return (
    <div className="space-y-6">
      <PageHeader title="Team" subtitle="Who can sign in to the lead desk. Sales can manage leads; admins can also manage the team and delete leads." />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <TeamList members={members} meId={me.id} />
        <AddMemberForm />
      </div>
    </div>
  );
}

export default function TeamPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl border border-line bg-white" />}>
      <TeamView />
    </Suspense>
  );
}
