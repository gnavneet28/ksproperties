import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/server/auth";
import { AccountForms } from "@/components/admin/TeamManager";
import { PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Account" };

async function AccountView() {
  const me = await requireUser();
  return (
    <div className="space-y-6">
      <PageHeader title="Account" subtitle={`Signed in as ${me.email} · ${me.role}`} />
      <AccountForms name={me.name} />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl border border-line bg-white" />}>
      <AccountView />
    </Suspense>
  );
}
