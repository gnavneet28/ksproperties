"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLeadStatus } from "@/app/admin/actions";
import { LEAD_STATUSES, statusMeta } from "@/lib/leads";
import { TONE_CLASSES } from "./ui";
import { useToast } from "./Toast";

/** A status pill that is also a native <select> (keyboard + screen-reader friendly). */
export function StatusSelect({ leadId, status, size = "sm" }: { leadId: number; status: string; size?: "sm" | "md" }) {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const meta = statusMeta(status);
  const t = TONE_CLASSES[meta.tone];

  return (
    <label className={`relative inline-flex items-center ${pending ? "opacity-60" : ""}`}>
      <span className="sr-only">Lead status</span>
      <span aria-hidden className={`pointer-events-none absolute left-2.5 h-1.5 w-1.5 rounded-full ${t.dot}`} />
      <select
        value={status}
        disabled={pending}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const next = e.target.value;
          start(async () => {
            const res = await updateLeadStatus([leadId], next);
            toast(res.ok ? res.message : res.error, res.ok ? "success" : "error");
            if (res.ok) router.refresh();
          });
        }}
        className={`cursor-pointer appearance-none rounded-full pl-6 pr-7 font-medium ring-1 ring-inset outline-none focus-visible:ring-2 focus-visible:ring-green-700 ${t.pill} ${
          size === "md" ? "min-h-10 text-sm" : "min-h-8 text-xs"
        }`}
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s.id} value={s.id} className="bg-white text-ink">
            {s.label}
          </option>
        ))}
      </select>
      <svg aria-hidden className="pointer-events-none absolute right-2.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </label>
  );
}
