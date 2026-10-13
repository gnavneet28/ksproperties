"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  changeOwnPassword as changeOwnPasswordAction,
  createTeamMember,
  resetTeamPassword,
  updateOwnName as updateOwnNameAction,
  updateTeamMember,
  type ActionResult,
} from "@/app/admin/actions";
import type { TeamMember } from "@/lib/leads";
import { formatDate } from "@/lib/format";
import { useToast } from "./Toast";
import { Avatar, Card, CardHeader, btn, field, label } from "./ui";

function useResultToast(state: ActionResult | null, onOk?: () => void) {
  const toast = useToast();
  const router = useRouter();
  const last = useRef<ActionResult | null>(null);
  useEffect(() => {
    if (!state || state === last.current) return;
    last.current = state;
    toast(state.ok ? state.message : state.error, state.ok ? "success" : "error");
    if (state.ok) {
      onOk?.();
      router.refresh();
    }
  }, [state, toast, onOk, router]);
}

function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const buf = new Uint32Array(14);
  crypto.getRandomValues(buf);
  return Array.from(buf, (n) => chars[n % chars.length]).join("");
}

export function AddMemberForm() {
  const [state, action, pending] = useActionState(createTeamMember, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [pw, setPw] = useState("");
  useResultToast(state, () => {
    formRef.current?.reset();
    setPw("");
  });

  return (
    <Card>
      <CardHeader title="Add a team member" subtitle="Share the temporary password with them privately; they can change it from Account." />
      <form ref={formRef} action={action} className="grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <label htmlFor="tm-name" className={label}>
            Full name
          </label>
          <input id="tm-name" name="name" required className={field} autoComplete="off" />
        </div>
        <div>
          <label htmlFor="tm-email" className={label}>
            Email
          </label>
          <input id="tm-email" name="email" type="email" required className={field} autoComplete="off" />
        </div>
        <div>
          <label htmlFor="tm-role" className={label}>
            Role
          </label>
          <select id="tm-role" name="role" defaultValue="sales" className={`${field} cursor-pointer`}>
            <option value="sales">Sales — manage leads</option>
            <option value="admin">Admin — leads, team and deletion</option>
          </select>
        </div>
        <div>
          <label htmlFor="tm-pw" className={label}>
            Temporary password
          </label>
          <div className="flex gap-2">
            <input
              id="tm-pw"
              name="password"
              required
              minLength={10}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className={`${field} font-mono`}
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setPw(randomPassword())} className={btn.secondary}>
              Generate
            </button>
          </div>
        </div>
        {state && !state.ok && (
          <p role="alert" className="text-sm text-red-700 sm:col-span-2">
            {state.error}
          </p>
        )}
        <div className="sm:col-span-2">
          <button type="submit" disabled={pending} className={btn.primary}>
            {pending ? "Adding…" : "Add member"}
          </button>
        </div>
      </form>
    </Card>
  );
}

export function TeamList({ members, meId }: { members: TeamMember[]; meId: number }) {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [resetFor, setResetFor] = useState<number | null>(null);
  const [newPw, setNewPw] = useState("");

  const run = (fn: () => Promise<ActionResult>, after?: () => void) =>
    start(async () => {
      const res = await fn();
      toast(res.ok ? res.message : res.error, res.ok ? "success" : "error");
      if (res.ok) {
        after?.();
        router.refresh();
      }
    });

  return (
    <Card className="overflow-hidden">
      <CardHeader title="Team" subtitle={(() => {
        const n = members.filter((m) => m.active).length;
        return `${n} active member${n === 1 ? "" : "s"}`;
      })()} />
      <ul className={`divide-y divide-line ${pending ? "opacity-70" : ""}`}>
        {members.map((m) => (
          <li key={m.id} className="px-5 py-4">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar name={m.name} size={40} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink">
                  {m.name} {m.id === meId && <span className="text-muted">(you)</span>}
                  {!m.active && <span className="ml-2 rounded-full bg-ink/[0.06] px-2 py-0.5 text-[11px] text-muted">Deactivated</span>}
                </p>
                <p className="truncate text-xs text-muted">
                  {m.email} · last sign-in {m.last_login_at ? formatDate(m.last_login_at) : "never"}
                </p>
              </div>
              {m.id === meId ? (
                <span className="rounded-full bg-green-900 px-3 py-1 text-xs capitalize text-white">{m.role}</span>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <label>
                    <span className="sr-only">Role for {m.name}</span>
                    <select
                      value={m.role}
                      disabled={pending}
                      onChange={(e) => run(() => updateTeamMember(m.id, { role: e.target.value }))}
                      className={`${field} min-h-9 w-auto cursor-pointer pr-8`}
                    >
                      <option value="sales">Sales</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                  <button type="button" onClick={() => setResetFor(resetFor === m.id ? null : m.id)} className={`${btn.ghost} min-h-9`}>
                    Reset password
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => updateTeamMember(m.id, { active: !m.active }))}
                    className={m.active ? `${btn.danger} min-h-9` : `${btn.secondary} min-h-9`}
                  >
                    {m.active ? "Deactivate" : "Reactivate"}
                  </button>
                </div>
              )}
            </div>
            {resetFor === m.id && (
              <form
                className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-paper p-3 sm:ml-14"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(() => resetTeamPassword(m.id, newPw), () => {
                    setResetFor(null);
                    setNewPw("");
                  });
                }}
              >
                <label className="flex-1">
                  <span className="sr-only">New password for {m.name}</span>
                  <input value={newPw} onChange={(e) => setNewPw(e.target.value)} minLength={10} required placeholder="New password (10+ characters)" className={`${field} font-mono`} />
                </label>
                <button type="button" onClick={() => setNewPw(randomPassword())} className={btn.secondary}>
                  Generate
                </button>
                <button type="submit" disabled={pending} className={btn.primary}>
                  Set password
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function AccountForms({ name }: { name: string }) {
  const [nameState, nameAction, namePending] = useActionState(updateOwnNameAction, null);
  const [pwState, pwAction, pwPending] = useActionState(changeOwnPasswordAction, null);
  const pwRef = useRef<HTMLFormElement>(null);
  useResultToast(nameState);
  useResultToast(pwState, () => pwRef.current?.reset());

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader title="Profile" />
        <form action={nameAction} className="space-y-4 p-5">
          <div>
            <label htmlFor="acc-name" className={label}>
              Display name
            </label>
            <input id="acc-name" name="name" defaultValue={name} required className={field} />
          </div>
          <button type="submit" disabled={namePending} className={btn.primary}>
            Save
          </button>
        </form>
      </Card>
      <Card>
        <CardHeader title="Change password" />
        <form ref={pwRef} action={pwAction} className="space-y-4 p-5">
          {[
            ["current", "Current password", "current-password"],
            ["next", "New password (10+ characters)", "new-password"],
            ["confirm", "Confirm new password", "new-password"],
          ].map(([n, l, ac]) => (
            <div key={n}>
              <label htmlFor={`acc-${n}`} className={label}>
                {l}
              </label>
              <input id={`acc-${n}`} name={n} type="password" required autoComplete={ac} className={field} />
            </div>
          ))}
          {pwState && !pwState.ok && (
            <p role="alert" className="text-sm text-red-700">
              {pwState.error}
            </p>
          )}
          <button type="submit" disabled={pwPending} className={btn.primary}>
            Update password
          </button>
        </form>
      </Card>
    </div>
  );
}

