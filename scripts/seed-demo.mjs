/**
 * Local-only demo data for the admin dashboard.
 *   npm run seed:demo           → adds ~150 demo leads over the last 60 days
 *   npm run seed:demo -- --reset → removes all demo leads (utm_term = 'demo-seed')
 * Uses the embedded PGlite database. Stop `next dev`/`next start` first (PGlite is single-process).
 * Start the app once before seeding so the schema and first admin exist.
 */
import { PGlite } from "@electric-sql/pglite";

if (process.env.DATABASE_URL) {
  console.error("DATABASE_URL is set — refusing to seed demo data into a real database.");
  process.exit(1);
}

const db = await PGlite.create(process.env.PGLITE_DIR || "./.data/pglite");
const reset = process.argv.includes("--reset");

const [{ exists }] = (await db.query("SELECT to_regclass('public.leads') IS NOT NULL AS exists")).rows;
if (!exists) {
  console.error("No schema yet. Start the app and open the admin once, then run this again.");
  process.exit(1);
}

await db.query("DELETE FROM leads WHERE utm_term = 'demo-seed'");
if (reset) {
  console.log("Removed demo leads.");
  process.exit(0);
}

const first = ["Aarav", "Vivaan", "Aditya", "Krish", "Rohan", "Dhruv", "Kavya", "Ananya", "Diya", "Isha", "Meera", "Riya", "Harsh", "Nirav", "Parth", "Jignesh", "Hetal", "Komal", "Bhavesh", "Chirag", "Pooja", "Nisha", "Rakesh", "Sanjay", "Mitesh", "Darshan", "Foram", "Kinjal", "Yash", "Tanvi"];
const last = ["Patel", "Shah", "Desai", "Mehta", "Joshi", "Trivedi", "Bhatt", "Pandya", "Modi", "Parikh", "Amin", "Thakkar", "Vyas", "Rana", "Chauhan"];
const cities = [["Ahmedabad", 55], ["Gandhinagar", 15], ["Other Gujarat", 15], ["Outside Gujarat", 8], ["NRI", 7]];
const interests = [["Pay EOI & reserve", 20], ["Site visit", 45], ["Just want price sheet", 35]];
const plots = [["400 Sq. Yards", 45], ["550 Sq. Yards", 20], ["800 Sq. Yards", 10], ["", 25]];
const sources = [
  ["facebook", "paid", "arvind-metal-launch", 45],
  ["instagram", "paid", "arvind-metal-launch", 25],
  ["google", "cpc", "arvind-metal-search", 12],
  ["", "", "", 18],
];
const statuses = [["new", 22], ["contacted", 22], ["interested", 15], ["site_visit", 12], ["visited", 9], ["eoi_paid", 7], ["booked", 3], ["lost", 10]];
const notes = [
  "Called — wants the layout plan on WhatsApp before deciding.",
  "Asked about loan options for the 400 sq. yd plot.",
  "Busy, call back in the evening.",
  "Interested in corner plot; asked about PLC.",
  "Coming for site visit with family on Sunday.",
  "Comparing with another project near Sanand.",
];

const pick = (arr) => {
  const total = arr.reduce((s, a) => s + a[a.length - 1], 0);
  let r = Math.random() * total;
  for (const a of arr) if ((r -= a[a.length - 1]) <= 0) return a;
  return arr[0];
};
const rand = (n) => Math.floor(Math.random() * n);

const users = (await db.query("SELECT id, name FROM users WHERE active")).rows;
let count = 0;

for (let i = 0; i < 150; i++) {
  // More recent days get more leads (campaign ramping up).
  const daysAgo = Math.floor(Math.pow(Math.random(), 1.6) * 60);
  const created = new Date(Date.now() - daysAgo * 86400e3 - rand(14 * 3600e3));
  const name = `${first[rand(first.length)]} ${last[rand(last.length)]}`;
  const phone = `${[9, 8, 7, 6][rand(4)]}${String(rand(1e9)).padStart(9, "0")}`;
  const [src, med, camp] = pick(sources);
  const status = daysAgo < 2 ? (Math.random() < 0.7 ? "new" : "contacted") : pick(statuses)[0];
  const owner = status !== "new" && users.length ? users[rand(users.length)].id : null;
  const followUp =
    ["contacted", "interested", "site_visit"].includes(status) && Math.random() < 0.6
      ? new Date(Date.now() + (rand(5) - 2) * 86400e3 + rand(8) * 3600e3)
      : null;

  const { rows } = await db.query(
    `INSERT INTO leads (created_at, updated_at, project_slug, project_name, name, phone, email, city, interest, plot_size,
       status, assigned_to, follow_up_at, utm_source, utm_medium, utm_campaign, utm_content, utm_term, landing_url, device)
     VALUES ($1, $1, 'arvind-metal', 'Arvind Metal', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'demo-seed', $15, $16)
     RETURNING id`,
    [
      created,
      name,
      phone,
      Math.random() < 0.3 ? `${name.split(" ")[0].toLowerCase()}@example.com` : "",
      pick(cities)[0],
      pick(interests)[0],
      pick(plots)[0],
      status,
      owner,
      followUp,
      src,
      med,
      camp,
      src ? ["carousel-a", "video-b", "static-c"][rand(3)] : "",
      `https://plots.example.com/${src ? `?utm_source=${src}&utm_campaign=${camp}` : ""}`,
      Math.random() < 0.88 ? "mobile" : "desktop",
    ],
  );
  const id = rows[0].id;
  await db.query("INSERT INTO lead_activities (lead_id, created_at, type, body) VALUES ($1, $2, 'created', $3)", [
    id,
    created,
    `Enquiry received from ${src || "direct"} for Arvind Metal`,
  ]);
  if (status !== "new" && owner) {
    await db.query("INSERT INTO lead_activities (lead_id, user_id, created_at, type, body) VALUES ($1, $2, $3, 'note', $4)", [
      id,
      owner,
      new Date(created.getTime() + 3 * 3600e3),
      notes[rand(notes.length)],
    ]);
  }
  count++;
}

console.log(`Seeded ${count} demo leads (utm_term = 'demo-seed'). Remove them with: npm run seed:demo -- --reset`);
await db.close();
