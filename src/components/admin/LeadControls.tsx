"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addLeadNote, assignLeads, removeLeads, updateFollowUp, updateLeadStatus, type ActionResult } from "@/app/admin/actions";
import { LEAD_STATUSES } from "@/lib/leads";
import { toLocalInput } from "@/lib/format";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";
import { TONE_CLASSES, btn, field, label } from "./ui";

function useRun() {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  /** Runs an action, toasts the result, then refreshes (or runs `after` instead). */
  const run = (fn: () => Promise<ActionResult>, after?: () => void) =>
    start(async () => {
      const res = await fn();
      toast(res.ok ? res.message : res.error, res.ok ? "success" : "error");
      if (res.ok) (after ?? router.refresh)();
    });
  return { pending, run };
}

/** Clickable pipeline: each step is a button that moves the lead to that stage. */
export function PipelineStepper({ leadId, status }: { leadId: number; status: string }) {
  const { pending, run } = useRun();
  const steps = LEAD_STATUSES.filter((s) => s.id !== "lost");
  const idx = steps.findIndex((s) => s.id === status);
  const lost = status === "lost";

  return (
    <div className={pending ? "opacity-60" : ""}>
      <ol className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 xl:grid-cols-7" aria-label="Lead pipeline">
        {steps.map((s, i) => {
          const done = !lost && i < idx;
          const current = s.id === status;
          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={pending || current}
                onClick={() => run(() => updateLeadStatus([leadId], s.id))}
                aria-current={current ? "step" : undefined}
                className={`flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-colors duration-200 disabled:cursor-default ${
                  current
                    ? `${TONE_CLASSES[s.tone].pill} border-transparent ring-1 ring-inset`
                    : done
                      ? "border-green-700/25 bg-green-700/5 text-green-800 hover:bg-green-700/10"
                      : "border-line bg-white text-muted hover:border-ink/25 hover:text-ink"
                }`}
              >
                <span
                  aria-hidden
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] ${
                    current ? "bg-white/70 text-ink" : done ? "bg-green-800 text-white" : "border border-ink/20"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className="leading-tight">{s.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => updateLeadStatus([leadId], lost ? "new" : "lost"))}
          className={`${btn.ghost} min-h-9 text-xs`}
        >
          {lost ? "Reopen lead" : "Mark as not interested"}
        </button>
      </div>
    </div>
  );
}

export function OwnerSelect({ leadId, assignedTo, team }: { leadId: number; assignedTo: number | null; team: { id: number; name: string }[] }) {
  const { pending, run } = useRun();
  return (
    <div>
      <label htmlFor="owner" className={label}>
        Owner
      </label>
      <select
        id="owner"
        value={assignedTo ? String(assignedTo) : "none"}
        disabled={pending}
        onChange={(e) => run(() => assignLeads([leadId], e.target.value))}
        className={`${field} cursor-pointer`}
      >
        <option value="none">Unassigned</option>
        {team.map((u) => (
          <option key={u.id} value={String(u.id)}>
            {u.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/** "yyyy-mm-ddThh:00" in IST, `daysAhead` days from today. */
function istSlot(daysAhead: number, hour: number) {
  const d = new Date(Date.now() + 5.5 * 3600e3 + daysAhead * 86400e3);
  return `${d.toISOString().slice(0, 10)}T${String(hour).padStart(2, "0")}:00`;
}

export function FollowUpField({ leadId, followUpAt }: { leadId: number; followUpAt: string | null }) {
  const { pending, run } = useRun();
  const [value, setValue] = useState(toLocalInput(followUpAt));
  const changed = value !== toLocalInput(followUpAt);

  function quick(daysAhead: number, hour: number) {
    const v = istSlot(daysAhead, hour);
    setValue(v);
    run(() => updateFollowUp(leadId, v));
  }

  return (
    <div>
      <label htmlFor="followup" className={label}>
        Next follow-up (IST)
      </label>
      <div className="flex gap-2">
        <input id="followup" type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} className={field} />
        {changed && (
          <button type="button" disabled={pending} onClick={() => run(() => updateFollowUp(leadId, value))} className={btn.primary}>
            Save
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {[
          ["Later today", 0, 18],
          ["Tomorrow 11 am", 1, 11],
          ["In 3 days", 3, 11],
        ].map(([l, d, h]) => (
          <button
            key={l as string}
            type="button"
            disabled={pending}
            onClick={() => quick(d as number, h as number)}
            className="min-h-8 cursor-pointer rounded-full border border-line px-3 text-xs text-muted transition-colors hover:border-ink/25 hover:text-ink"
          >
            {l}
          </button>
        ))}
        {followUpAt && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setValue("");
              run(() => updateFollowUp(leadId, ""));
            }}
            className="min-h-8 cursor-pointer rounded-full px-3 text-xs text-muted transition-colors hover:text-red-700"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export function NoteComposer({ leadId }: { leadId: number }) {
  const { pending, run } = useRun();
  const router = useRouter();
  const [text, setText] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => addLeadNote(leadId, text), () => {
          setText("");
          router.refresh();
        });
      }}
    >
      <label htmlFor="note" className="sr-only">
        Add a note
      </label>
      <textarea
        id="note"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && text.trim())
            run(() => addLeadNote(leadId, text), () => {
              setText("");
              router.refresh();
            });
        }}
        rows={3}
        placeholder="Log a call, what they asked for, budget, preferred visit day…"
        className={`${field} min-h-[88px] resize-y py-2.5`}
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted">Ctrl + Enter to save</span>
        <button type="submit" disabled={pending || !text.trim()} className={btn.primary}>
          {pending ? "Saving…" : "Add note"}
        </button>
      </div>
    </form>
  );
}

export function DeleteLeadButton({ leadId, name }: { leadId: number; name: string }) {
  const { pending, run } = useRun();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btn.danger}>
        Delete lead
      </button>
      <ConfirmDialog
        open={open}
        title={`Delete ${name}?`}
        text="This permanently removes the lead with its notes and history. Copies in Google Sheets or email are not affected."
        confirmLabel="Delete lead"
        pending={pending}
        onCancel={() => setOpen(false)}
        onConfirm={() => run(() => removeLeads([leadId]), () => router.push("/leads"))}
      />
    </>
  );
}
