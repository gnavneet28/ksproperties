import "server-only";

/**
 * Tiny Postgres access layer.
 * - DATABASE_URL set  → real Postgres (Neon / Supabase / Vercel Postgres / RDS) via `postgres`.
 * - otherwise (local) → embedded PGlite stored in ./.data/pglite. Same SQL dialect.
 * Queries use $1-style parameters.
 */

export interface Db {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'sales' CHECK (role IN ('admin','sales')),
    active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at TIMESTAMPTZ
  )`,
  `CREATE TABLE IF NOT EXISTS leads (
    id            SERIAL PRIMARY KEY,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    project_slug  TEXT NOT NULL,
    project_name  TEXT NOT NULL,
    name          TEXT NOT NULL,
    phone         TEXT NOT NULL,
    email         TEXT NOT NULL DEFAULT '',
    city          TEXT NOT NULL DEFAULT '',
    interest      TEXT NOT NULL DEFAULT '',
    plot_size     TEXT NOT NULL DEFAULT '',
    status        TEXT NOT NULL DEFAULT 'new',
    assigned_to   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    follow_up_at  TIMESTAMPTZ,
    duplicate     BOOLEAN NOT NULL DEFAULT FALSE,
    utm_source    TEXT NOT NULL DEFAULT '',
    utm_medium    TEXT NOT NULL DEFAULT '',
    utm_campaign  TEXT NOT NULL DEFAULT '',
    utm_content   TEXT NOT NULL DEFAULT '',
    utm_term      TEXT NOT NULL DEFAULT '',
    fbclid        TEXT NOT NULL DEFAULT '',
    fbc           TEXT NOT NULL DEFAULT '',
    fbp           TEXT NOT NULL DEFAULT '',
    landing_url   TEXT NOT NULL DEFAULT '',
    referrer      TEXT NOT NULL DEFAULT '',
    device        TEXT NOT NULL DEFAULT '',
    ip            TEXT NOT NULL DEFAULT '',
    user_agent    TEXT NOT NULL DEFAULT '',
    event_id      TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS leads_phone_idx ON leads (phone)`,
  `CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status)`,
  `CREATE TABLE IF NOT EXISTS lead_activities (
    id          SERIAL PRIMARY KEY,
    lead_id     INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    type        TEXT NOT NULL,
    body        TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE INDEX IF NOT EXISTS lead_activities_lead_idx ON lead_activities (lead_id, created_at DESC)`,
];

type GlobalDb = { __ksDb?: Promise<Db | null> };
const g = globalThis as GlobalDb;

async function connect(): Promise<Db | null> {
  const url = process.env.DATABASE_URL;
  let db: Db;

  if (url) {
    const { default: postgres } = await import("postgres");
    const sql = postgres(url, { max: 5, idle_timeout: 20, prepare: false });
    db = { query: async (text, params = []) => (await sql.unsafe(text, params as never[])) as never };
  } else if (process.env.VERCEL) {
    console.error("[db] DATABASE_URL is not set; the lead database is disabled on this deployment.");
    return null;
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const { mkdirSync } = await import("node:fs");
    const dir = process.env.PGLITE_DIR || "./.data/pglite";
    mkdirSync(dir, { recursive: true });
    const pg = await PGlite.create(dir);
    db = { query: async (text, params = []) => (await pg.query(text, params)).rows as never };
  }

  for (const stmt of SCHEMA) await db.query(stmt);
  await seedAdmin(db);
  return db;
}

/** Creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD when the users table is empty. */
async function seedAdmin(db: Db) {
  const [{ count }] = await db.query<{ count: number }>("SELECT count(*)::int AS count FROM users");
  if (count > 0) return;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("[db] No users yet. Set ADMIN_EMAIL and ADMIN_PASSWORD to create the first admin.");
    return;
  }
  const { hashPassword } = await import("./password");
  await db.query("INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, 'admin')", [
    email,
    process.env.ADMIN_NAME || "Admin",
    await hashPassword(password),
  ]);
  console.info(`[db] Created first admin user ${email}`);
}

/** Shared connection (survives dev hot reloads). Resolves to null when no database is available. */
export function getDb(): Promise<Db | null> {
  if (!g.__ksDb) {
    g.__ksDb = connect().catch((err) => {
      console.error("[db] connection failed", err);
      g.__ksDb = undefined;
      return null;
    });
  }
  return g.__ksDb;
}

/** Like getDb() but throws — for admin code paths where a database is required. */
export async function requireDb(): Promise<Db> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable. Set DATABASE_URL.");
  return db;
}
