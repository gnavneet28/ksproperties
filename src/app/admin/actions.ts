"use server";

import { headers } from "next/headers";
import { requireDb } from "@/lib/server/db";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { assertUser, clearSessionCookie, setSessionCookie } from "@/lib/server/auth";
import { addNote, assign, deleteLeads, setFollowUp, setStatus } from "@/lib/server/leadsRepo";
import { isLeadStatus, statusMeta } from "@/lib/leads";
import { formatDateTime, fromLocalInput } from "@/lib/format";

/*
 * These actions never call redirect() or refresh(). On the admin host every URL is rewritten by
 * src/proxy.ts ("/leads" → "/admin/leads"), and server-side redirects/refreshes are resolved inside
 * Next without that rewrite. Callers navigate or call router.refresh() on the client instead.
 */

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

const ok = (message: string): ActionResult => ({ ok: true, message });
const fail = (error: string): ActionResult => ({ ok: false, error });

function ids(input: unknown): number[] {
  const arr = Array.isArray(input) ? input : [input];
  return arr.map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 500);
}

async function guard<T>(fn: () => Promise<T>): Promise<T | ActionResult> {
  try {
    return await fn();
  } catch (e) {
    console.error("[admin action]", e);
    return fail(e instanceof Error && e.message.length < 120 ? e.message : "Something went wrong. Please try again.");
  }
}

/* ------------------------------------------------------------------ auth */

const loginAttempts = new Map<string, number[]>();

export async function login(_: unknown, form: FormData): Promise<ActionResult> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return fail("Enter your email and password.");

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = `${ip}|${email}`;
  const now = Date.now();
  const recent = (loginAttempts.get(key) ?? []).filter((t) => now - t < 15 * 60_000);
  if (recent.length >= 8) return fail("Too many attempts. Try again in 15 minutes.");

  const db = await requireDb();
  const [user] = await db.query<{ id: number; password_hash: string; active: boolean }>(
    "SELECT id, password_hash, active FROM users WHERE email = $1",
    [email],
  );
  if (!user || !user.active || !(await verifyPassword(password, user.password_hash))) {
    loginAttempts.set(key, [...recent, now]);
    return fail("Incorrect email or password.");
  }
  loginAttempts.delete(key);
  await db.query("UPDATE users SET last_login_at = now() WHERE id = $1", [user.id]);
  await setSessionCookie(user.id);
  return ok("Signed in");
}

export async function logout(): Promise<ActionResult> {
  await clearSessionCookie();
  return ok("Signed out");
}

/* ------------------------------------------------------------------ leads */

export async function updateLeadStatus(leadIds: number[], status: string): Promise<ActionResult> {
  return guard(async () => {
    const user = await assertUser();
    if (!isLeadStatus(status)) return fail("Unknown status");
    const meta = statusMeta(status);
    const n = await setStatus(ids(leadIds), status, meta.label, user.id);
    return ok(n === 1 ? `Status set to ${meta.label}` : `${n} leads moved to ${meta.label}`);
  });
}

export async function assignLeads(leadIds: number[], assignee: string): Promise<ActionResult> {
  return guard(async () => {
    const user = await assertUser();
    const to = assignee === "none" || assignee === "" ? null : Number(assignee);
    if (to !== null && !Number.isInteger(to)) return fail("Unknown team member");
    const n = await assign(ids(leadIds), to, user.id);
    return ok(to ? `${n} lead${n === 1 ? "" : "s"} assigned` : `${n} lead${n === 1 ? "" : "s"} unassigned`);
  });
}

export async function removeLeads(leadIds: number[]): Promise<ActionResult> {
  return guard(async () => {
    await assertUser("admin");
    const n = await deleteLeads(ids(leadIds));
    return ok(`${n} lead${n === 1 ? "" : "s"} deleted`);
  });
}

export async function updateFollowUp(leadId: number, local: string): Promise<ActionResult> {
  return guard(async () => {
    const user = await assertUser();
    const iso = local ? fromLocalInput(local) : null;
    if (local && !iso) return fail("Pick a valid date and time");
    await setFollowUp(ids(leadId)[0]!, iso, iso ? formatDateTime(iso) : "", user.id);
    return ok(iso ? "Follow-up scheduled" : "Follow-up cleared");
  });
}

export async function addLeadNote(leadId: number, body: string): Promise<ActionResult> {
  return guard(async () => {
    const user = await assertUser();
    const text = body.trim().slice(0, 2000);
    if (!text) return fail("Write a note first");
    await addNote(ids(leadId)[0]!, text, user.id);
    return ok("Note added");
  });
}

/* ------------------------------------------------------------------ team */

export async function createTeamMember(_: unknown, form: FormData): Promise<ActionResult> {
  return guard(async () => {
    await assertUser("admin");
    const name = String(form.get("name") ?? "").trim().slice(0, 80);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const role = form.get("role") === "admin" ? "admin" : "sales";
    const password = String(form.get("password") ?? "");
    if (!name) return fail("Enter a name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail("Enter a valid email");
    if (password.length < 10) return fail("Temporary password must be at least 10 characters");
    const db = await requireDb();
    const [exists] = await db.query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (exists) return fail("A user with this email already exists");
    await db.query("INSERT INTO users (name, email, role, password_hash) VALUES ($1, $2, $3, $4)", [
      name,
      email,
      role,
      await hashPassword(password),
    ]);
    return ok(`${name} added`);
  });
}

export async function updateTeamMember(userId: number, patch: { role?: string; active?: boolean }): Promise<ActionResult> {
  return guard(async () => {
    const me = await assertUser("admin");
    if (userId === me.id) return fail("You can't change your own role or access");
    const db = await requireDb();
    if (patch.role === "admin" || patch.role === "sales") {
      await db.query("UPDATE users SET role = $1 WHERE id = $2", [patch.role, userId]);
    }
    if (typeof patch.active === "boolean") {
      await db.query("UPDATE users SET active = $1 WHERE id = $2", [patch.active, userId]);
    }
    return ok("Team member updated");
  });
}

export async function resetTeamPassword(userId: number, password: string): Promise<ActionResult> {
  return guard(async () => {
    await assertUser("admin");
    if (password.length < 10) return fail("Password must be at least 10 characters");
    const db = await requireDb();
    await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [await hashPassword(password), userId]);
    return ok("Password reset");
  });
}

export async function changeOwnPassword(_: unknown, form: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await assertUser();
    const current = String(form.get("current") ?? "");
    const next = String(form.get("next") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (next.length < 10) return fail("New password must be at least 10 characters");
    if (next !== confirm) return fail("New passwords don't match");
    const db = await requireDb();
    const [row] = await db.query<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = $1", [me.id]);
    if (!row || !(await verifyPassword(current, row.password_hash))) return fail("Current password is incorrect");
    await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [await hashPassword(next), me.id]);
    return ok("Password updated");
  });
}

export async function updateOwnName(_: unknown, form: FormData): Promise<ActionResult> {
  return guard(async () => {
    const me = await assertUser();
    const name = String(form.get("name") ?? "").trim().slice(0, 80);
    if (!name) return fail("Enter your name");
    const db = await requireDb();
    await db.query("UPDATE users SET name = $1 WHERE id = $2", [name, me.id]);
    return ok("Profile updated");
  });
}
