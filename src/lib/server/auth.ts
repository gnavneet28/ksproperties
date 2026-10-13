import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireDb } from "./db";

export type Role = "admin" | "sales";
export type SessionUser = { id: number; email: string; name: string; role: Role };

export const SESSION_COOKIE = "ks_admin";
const SESSION_DAYS = 7;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET (32+ chars) is required in production");
  return "dev-only-session-secret-change-me-0123456789";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(userId: number) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + SESSION_DAYS * 864e5 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readSessionToken(token: string | undefined): number | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, "base64url").toString()) as { uid: number; exp: number };
    return exp > Date.now() && Number.isInteger(uid) ? uid : null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: number) {
  (await cookies()).set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Current signed-in, active user — or null. Session is host-only, so it only exists on the admin host. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const uid = readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!uid) return null;
  const db = await requireDb();
  const [user] = await db.query<SessionUser>(
    "SELECT id, email, name, role FROM users WHERE id = $1 AND active = TRUE",
    [uid],
  );
  return user ?? null;
}

/** For pages: redirect to /login when signed out (or lacking the role). */
export async function requireUser(role?: Role): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (role === "admin" && user.role !== "admin") redirect("/");
  return user;
}

/** For server actions / route handlers: throw instead of redirecting. */
export async function assertUser(role?: Role): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");
  if (role === "admin" && user.role !== "admin") throw new Error("Admins only");
  return user;
}
