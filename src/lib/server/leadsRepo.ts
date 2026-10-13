import "server-only";
import { requireDb, type Db } from "./db";
import { CONVERTED, type Activity, type LeadRow, type LeadStatus, type TeamMember } from "@/lib/leads";

/** Dates come back as Date objects from both drivers; normalise to ISO strings for the UI. */
function norm<T>(rows: T[]): T[] {
  return rows.map((r) => {
    const o = { ...(r as Record<string, unknown>) };
    for (const k in o) if (o[k] instanceof Date) o[k] = (o[k] as Date).toISOString();
    return o as T;
  });
}

async function q<T>(sql: string, params: unknown[] = [], db?: Db) {
  return norm(await (db ?? (await requireDb())).query<T>(sql, params));
}

/* ------------------------------------------------------------------ ingest */

export type NewLead = Omit<LeadRow, "id" | "created_at" | "updated_at" | "status" | "assigned_to" | "assignee_name" | "follow_up_at">;

export async function insertLead(db: Db, lead: NewLead) {
  const cols = Object.keys(lead);
  const [row] = await db.query<{ id: number }>(
    `INSERT INTO leads (${cols.join(", ")}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING id`,
    cols.map((c) => lead[c as keyof NewLead]),
  );
  await db.query("INSERT INTO lead_activities (lead_id, type, body) VALUES ($1, 'created', $2)", [
    row.id,
    `Enquiry received from ${lead.utm_source || "direct"} for ${lead.project_name}`,
  ]);
  return row.id;
}

export async function hasRecentLead(db: Db, phone: string) {
  const [r] = await db.query<{ n: number }>(
    "SELECT count(*)::int AS n FROM leads WHERE phone = $1 AND created_at > now() - interval '24 hours'",
    [phone],
  );
  return r.n > 0;
}

/* ------------------------------------------------------------------ list */

export type LeadFilters = {
  q?: string;
  status?: string;
  project?: string;
  source?: string;
  assigned?: string; // "me" | "none" | user id
  from?: string; // yyyy-mm-dd (IST)
  to?: string;
  followUp?: "due";
};

function whereClause(f: LeadFilters, userId: number, skip: (keyof LeadFilters)[] = []) {
  const where: string[] = [];
  const params: unknown[] = [];
  const p = (v: unknown) => {
    params.push(v);
    return `$${params.length}`;
  };
  const has = (k: keyof LeadFilters) => !skip.includes(k) && f[k];

  if (has("q")) {
    const like = p(`%${f.q!.trim()}%`);
    where.push(`(l.name ILIKE ${like} OR l.phone ILIKE ${like} OR l.email ILIKE ${like} OR l.city ILIKE ${like})`);
  }
  if (has("status")) where.push(`l.status = ${p(f.status)}`);
  if (has("project")) where.push(`l.project_slug = ${p(f.project)}`);
  if (has("source")) where.push(f.source === "direct" ? "l.utm_source = ''" : `l.utm_source = ${p(f.source)}`);
  if (has("assigned")) {
    if (f.assigned === "me") where.push(`l.assigned_to = ${p(userId)}`);
    else if (f.assigned === "none") where.push("l.assigned_to IS NULL");
    else if (/^\d+$/.test(f.assigned!)) where.push(`l.assigned_to = ${p(Number(f.assigned))}`);
  }
  if (has("from") && /^\d{4}-\d{2}-\d{2}$/.test(f.from!)) where.push(`l.created_at >= (${p(f.from)}::date AT TIME ZONE 'Asia/Kolkata')`);
  if (has("to") && /^\d{4}-\d{2}-\d{2}$/.test(f.to!))
    where.push(`l.created_at < ((${p(f.to)}::date + 1) AT TIME ZONE 'Asia/Kolkata')`);
  if (has("followUp"))
    where.push(
      "l.follow_up_at IS NOT NULL AND (l.follow_up_at AT TIME ZONE 'Asia/Kolkata')::date <= (now() AT TIME ZONE 'Asia/Kolkata')::date AND l.status NOT IN ('booked','lost')",
    );
  return { sql: where.length ? `WHERE ${where.join(" AND ")}` : "", params };
}

const LEAD_SELECT = `SELECT l.*, u.name AS assignee_name FROM leads l LEFT JOIN users u ON u.id = l.assigned_to`;

export async function listLeads(f: LeadFilters, userId: number, page = 1, pageSize = 25, sort: "newest" | "oldest" | "follow_up" = "newest") {
  const db = await requireDb();
  const w = whereClause(f, userId);
  const order =
    sort === "oldest" ? "l.created_at ASC" : sort === "follow_up" ? "l.follow_up_at ASC NULLS LAST, l.created_at DESC" : "l.created_at DESC";
  const [rows, [{ total }]] = await Promise.all([
    q<LeadRow>(`${LEAD_SELECT} ${w.sql} ORDER BY ${order} LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`, w.params, db),
    q<{ total: number }>(`SELECT count(*)::int AS total FROM leads l ${w.sql}`, w.params, db),
  ]);
  return { rows, total };
}

/** Counts per status for the current filters (ignoring the status filter itself) — powers the tabs. */
export async function statusCounts(f: LeadFilters, userId: number) {
  const w = whereClause(f, userId, ["status"]);
  const rows = await q<{ status: string; n: number }>(`SELECT l.status, count(*)::int AS n FROM leads l ${w.sql} GROUP BY l.status`, w.params);
  return Object.fromEntries(rows.map((r) => [r.status, r.n])) as Record<string, number>;
}

/** All leads matching filters, for CSV export. */
export async function exportLeads(f: LeadFilters, userId: number) {
  const w = whereClause(f, userId);
  return q<LeadRow>(`${LEAD_SELECT} ${w.sql} ORDER BY l.created_at DESC LIMIT 50000`, w.params);
}

export async function filterOptions() {
  const db = await requireDb();
  const [projects, sources] = await Promise.all([
    q<{ slug: string; name: string }>("SELECT DISTINCT project_slug AS slug, project_name AS name FROM leads ORDER BY name", [], db),
    q<{ source: string }>("SELECT DISTINCT utm_source AS source FROM leads WHERE utm_source <> '' ORDER BY source", [], db),
  ]);
  return { projects, sources: sources.map((s) => s.source) };
}

/* ------------------------------------------------------------------ detail */

export async function getLead(id: number) {
  const [row] = await q<LeadRow>(`${LEAD_SELECT} WHERE l.id = $1`, [id]);
  return row ?? null;
}

export async function getActivities(leadId: number) {
  return q<Activity>(
    `SELECT a.id, a.created_at, a.type, a.body, u.name AS user_name
       FROM lead_activities a LEFT JOIN users u ON u.id = a.user_id
      WHERE a.lead_id = $1 ORDER BY a.created_at DESC, a.id DESC`,
    [leadId],
  );
}

export async function relatedLeads(phone: string, excludeId: number) {
  return q<Pick<LeadRow, "id" | "created_at" | "project_name" | "status">>(
    "SELECT id, created_at, project_name, status FROM leads WHERE phone = $1 AND id <> $2 ORDER BY created_at DESC LIMIT 10",
    [phone, excludeId],
  );
}

/* ------------------------------------------------------------------ mutations */

async function log(db: Db, leadIds: number[], userId: number, type: Activity["type"], body: string) {
  for (const id of leadIds) {
    await db.query("INSERT INTO lead_activities (lead_id, user_id, type, body) VALUES ($1, $2, $3, $4)", [id, userId, type, body]);
  }
}

export async function setStatus(ids: number[], status: LeadStatus, label: string, userId: number) {
  const db = await requireDb();
  const changed = await db.query<{ id: number }>(
    "UPDATE leads SET status = $1, updated_at = now() WHERE id = ANY($2::int[]) AND status <> $1 RETURNING id",
    [status, ids],
  );
  await log(db, changed.map((r) => r.id), userId, "status", `Status changed to ${label}`);
  return changed.length;
}

export async function assign(ids: number[], assigneeId: number | null, userId: number) {
  const db = await requireDb();
  let name = "Unassigned";
  if (assigneeId) {
    const [u] = await db.query<{ name: string }>("SELECT name FROM users WHERE id = $1 AND active", [assigneeId]);
    if (!u) throw new Error("Unknown team member");
    name = u.name;
  }
  const changed = await db.query<{ id: number }>(
    "UPDATE leads SET assigned_to = $1, updated_at = now() WHERE id = ANY($2::int[]) AND assigned_to IS DISTINCT FROM $1 RETURNING id",
    [assigneeId, ids],
  );
  await log(db, changed.map((r) => r.id), userId, "assigned", assigneeId ? `Assigned to ${name}` : "Unassigned");
  return changed.length;
}

export async function setFollowUp(id: number, at: string | null, label: string, userId: number) {
  const db = await requireDb();
  await db.query("UPDATE leads SET follow_up_at = $1, updated_at = now() WHERE id = $2", [at, id]);
  await log(db, [id], userId, "follow_up", at ? `Follow-up set for ${label}` : "Follow-up cleared");
}

export async function addNote(id: number, body: string, userId: number) {
  const db = await requireDb();
  await db.query("UPDATE leads SET updated_at = now() WHERE id = $1", [id]);
  await log(db, [id], userId, "note", body);
}

export async function deleteLeads(ids: number[]) {
  const db = await requireDb();
  const rows = await db.query<{ id: number }>("DELETE FROM leads WHERE id = ANY($1::int[]) RETURNING id", [ids]);
  return rows.length;
}

/* ------------------------------------------------------------------ dashboard stats */

export async function dashboardStats(days: number) {
  const db = await requireDb();
  const conv = CONVERTED.map((s) => `'${s}'`).join(",");
  const [kpi] = await q<{
    total: number;
    prev_total: number;
    new_open: number;
    site_visits: number;
    converted: number;
    due: number;
    overdue: number;
  }>(
    `SELECT
       count(*) FILTER (WHERE created_at >= now() - make_interval(days => $1))::int AS total,
       count(*) FILTER (WHERE created_at <  now() - make_interval(days => $1)
                          AND created_at >= now() - make_interval(days => $1 * 2))::int AS prev_total,
       count(*) FILTER (WHERE status = 'new')::int AS new_open,
       count(*) FILTER (WHERE status = 'site_visit')::int AS site_visits,
       count(*) FILTER (WHERE status IN (${conv}) AND created_at >= now() - make_interval(days => $1))::int AS converted,
       count(*) FILTER (WHERE follow_up_at IS NOT NULL AND status NOT IN ('booked','lost')
                          AND (follow_up_at AT TIME ZONE 'Asia/Kolkata')::date = (now() AT TIME ZONE 'Asia/Kolkata')::date)::int AS due,
       count(*) FILTER (WHERE follow_up_at IS NOT NULL AND status NOT IN ('booked','lost')
                          AND (follow_up_at AT TIME ZONE 'Asia/Kolkata')::date < (now() AT TIME ZONE 'Asia/Kolkata')::date)::int AS overdue
     FROM leads`,
    [days],
    db,
  );

  const range = "created_at >= now() - make_interval(days => $1)";
  const [daily, byStatus, bySource, byProject, byCity, followUps, recent] = await Promise.all([
    q<{ day: string; n: number }>(
      `SELECT to_char(d, 'YYYY-MM-DD') AS day, coalesce(c.n, 0)::int AS n
         FROM generate_series(((now() AT TIME ZONE 'Asia/Kolkata')::date - ($1 - 1)), (now() AT TIME ZONE 'Asia/Kolkata')::date, interval '1 day') d
         LEFT JOIN (SELECT (created_at AT TIME ZONE 'Asia/Kolkata')::date AS day, count(*) AS n FROM leads
                     WHERE ${range} GROUP BY 1) c ON c.day = d::date
        ORDER BY d`,
      [days],
      db,
    ),
    q<{ key: string; n: number }>(`SELECT status AS key, count(*)::int AS n FROM leads WHERE ${range} GROUP BY 1`, [days], db),
    q<{ key: string; n: number }>(
      `SELECT CASE WHEN utm_source = '' THEN 'direct' ELSE utm_source END AS key, count(*)::int AS n
         FROM leads WHERE ${range} GROUP BY 1 ORDER BY n DESC LIMIT 6`,
      [days],
      db,
    ),
    q<{ key: string; label: string; n: number }>(
      `SELECT project_slug AS key, max(project_name) AS label, count(*)::int AS n FROM leads WHERE ${range} GROUP BY 1 ORDER BY n DESC LIMIT 6`,
      [days],
      db,
    ),
    q<{ key: string; n: number }>(
      `SELECT CASE WHEN city = '' THEN 'Unknown' ELSE city END AS key, count(*)::int AS n FROM leads WHERE ${range} GROUP BY 1 ORDER BY n DESC LIMIT 6`,
      [days],
      db,
    ),
    q<LeadRow>(
      `${LEAD_SELECT} WHERE l.follow_up_at IS NOT NULL AND l.status NOT IN ('booked','lost')
          AND (l.follow_up_at AT TIME ZONE 'Asia/Kolkata')::date <= (now() AT TIME ZONE 'Asia/Kolkata')::date
        ORDER BY l.follow_up_at ASC LIMIT 6`,
      [],
      db,
    ),
    q<LeadRow>(`${LEAD_SELECT} ORDER BY l.created_at DESC LIMIT 6`, [], db),
  ]);

  return { kpi, daily, byStatus, bySource, byProject, byCity, followUps, recent };
}

/* ------------------------------------------------------------------ team */

export async function listTeam() {
  return q<TeamMember>("SELECT id, email, name, role, active, created_at, last_login_at FROM users ORDER BY active DESC, name");
}

export async function activeTeam() {
  return q<{ id: number; name: string }>("SELECT id, name FROM users WHERE active ORDER BY name");
}
