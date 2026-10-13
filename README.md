# KS Properties — Project Landing Pages

Mobile-first lead-gen site for **KS Properties** (authorised channel partner) marketing plotted developments by builders such as **Arvind Group**. Built from [prd.md](prd.md). Next.js 16 (App Router, TypeScript, Tailwind v4).

## Routes

| Route | What |
| --- | --- |
| `/` | Featured project landing page (Meta ad target), canonical → `/projects/{slug}` |
| `/projects` | Project listing cards |
| `/projects/{slug}` | Full project landing page: hero + lead form, highlights, plot prices, lifestyle, location, gallery, FAQ |
| `/privacy-policy` | DPDP-aligned privacy policy with TOC (legal review required) |
| `/thank-you` | Post-submit page (noindex), fires Pixel `Lead` with the server's `event_id` |
| `POST /api/lead` | Validates → Google Sheet + email/Telegram/WhatsApp/CRM alerts → Meta CAPI `Lead` |
| `POST /api/event` | Mirrors `PageView` / `Contact` to Meta CAPI (deduped by `event_id`) |
| `admin.<host>/*` | Lead management dashboard (see below) |

## Editing content

**All copy lives in [`src/content/`](src/content):**
- [`site.ts`](src/content/site.ts): KS Properties brand, phones, form, footer, privacy policy
- [`projects.ts`](src/content/projects.ts): one object per project (prices, plot sizes, highlights, connectivity, FAQ, images, SEO)

**Add a project:** append an object to `projects` in `projects.ts`, put its images in `public/projects/{slug}/`, and rebuild. It appears on `/projects` and gets its own page automatically. Set `featured: true` on the project that `/` should show.

Fields marked `TODO(client)` are open questions; `next build` prints the remaining launch blockers.

## Admin dashboard (lead desk)

Served on the **`admin.` subdomain** of whatever host the app runs on. [`src/proxy.ts`](src/proxy.ts) rewrites `admin.<host>/leads` to the internal `app/admin/leads` route and hides `/admin` on the public site (404).

| URL (local) | What |
| --- | --- |
| http://admin.localhost:3000/login | Sign in |
| http://admin.localhost:3000/ | Overview: KPIs, leads per day, pipeline, sources/projects/cities, follow-ups due, latest enquiries (7/30/90-day range) |
| http://admin.localhost:3000/leads | Search, filters (project, source, owner, dates), status tabs, inline status change, bulk status/assign/delete, CSV export |
| http://admin.localhost:3000/leads/{id} | Call/WhatsApp, pipeline stepper, owner, follow-up scheduling, notes + activity log, attribution, repeat enquiries |
| http://admin.localhost:3000/team | Admins: add members (sales/admin), change role, deactivate, reset password |
| http://admin.localhost:3000/account | Change your name and password |

`*.localhost` resolves to your machine in Chrome, Edge and Firefox, so no hosts-file change is needed.

**Data:** every lead submitted on the site is stored in Postgres (and still copied to Google Sheets/email if configured). Locally this is an embedded [PGlite](https://pglite.dev) database in `./.data/pglite`; in production set `DATABASE_URL` (Neon, Supabase or Vercel Postgres). Tables are created automatically on first use.

**Users:** the first admin is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` when the users table is empty (local test credentials are in `.env.local`). Passwords are hashed with scrypt; sessions are signed, http-only cookies scoped to the admin host (set `SESSION_SECRET`). Roles: **sales** manage leads; **admin** can also manage the team and delete leads.

**Demo data (local only):** stop the server, then `npm run seed:demo` adds ~150 sample leads; `npm run seed:demo -- --reset` removes them. PGlite is single-process, so the app must not be running while you seed.

**Production:** add `admin.<your-domain>` as a domain on the same Vercel project and set `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. Change the first admin's password after signing in.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in what you have; everything is optional locally
npm run dev
```

With no lead destination configured, `/api/lead` logs the lead to the server console and still succeeds.

## Environment variables

See [`.env.example`](.env.example). Summary:

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | Canonical URL, sitemap, OG |
| `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_CLARITY_ID` | Browser tracking (loaded after first interaction or 3 s) |
| `META_CAPI_TOKEN`, `META_TEST_EVENT_CODE` | Conversions API (remove the test code before launch) |
| `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_SHEET_RANGE` | Lead storage |
| `RESEND_API_KEY`, `LEAD_NOTIFY_EMAILS`, `LEAD_FROM_EMAIL` | Sales email alert |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Optional Telegram alert |
| `WHATSAPP_CLOUD_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ALERT_TO`, `WHATSAPP_ALERT_TEMPLATE` | Optional WhatsApp Cloud API alert |
| `CRM_WEBHOOK_URL` | Optional CRM webhook (receives the lead row as JSON) |

The WhatsApp chat number shown to visitors is `content.whatsapp.number` (not an env var) so it stays next to the rest of the offer copy.

### Google Sheet setup
1. Create a Google Cloud service account, download its JSON key.
2. Create a sheet with a tab named **Leads**; add this header row:
   `timestamp_ist, project, name, phone, city, interest, plot_size, email, duplicate, utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid, fbc, fbp, landing_url, referrer, device, ip, user_agent, event_id`
3. Share the sheet with the service account's `client_email` as **Editor**.
4. Paste the JSON (raw or base64) into `GOOGLE_SERVICE_ACCOUNT_JSON`.

## Deploy (Vercel)

`vercel.json` pins functions to Mumbai (`bom1`). Add the env vars in the Vercel dashboard, attach the custom domain, deploy.

## Implementation notes

- **Anti-spam:** honeypot field, 3 s minimum time-on-page before submit, 5 submissions/IP/hour, duplicate phone within 24 h flagged (`duplicate=yes`) but accepted. Rate limit and duplicate detection are in-memory per serverless instance (best effort). Swap in Upstash/Vercel KV if abuse appears.
- **Failure path:** if storage and email both fail, the user sees call/WhatsApp buttons and the payload is queued in `localStorage` and retried once on the next page load.
- **Attribution:** UTMs + `fbclid` are captured on landing (session + local storage), `_fbc` is set immediately from `fbclid`, and the query string is carried to `/thank-you`.
- **WhatsApp FAB** fades out only while the form's submit button passes underneath it, so it never covers the button.
- **Design system** ("editorial luxury estate") lives in [`src/app/globals.css`](src/app/globals.css): brand green + ivory, gold only for price/CTAs, Manrope throughout. **No font weight above 500 anywhere.** Hierarchy comes from size, serif/sans contrast and tracking.
- **Images:** project photos in `public/projects/arvind-metal/` are cropped from the developer brochure and the ad creative (sources in `creative/`), so they are low resolution. Replace them with original renders when available.
- **Hero art** is a gold-line masterplan drawing (`public/hero-masterplan.svg`) until the client supplies the source creative. Replace it with an optimised photo via `next/image` (`priority`, blur placeholder, 800/1600 px).
- **Logo** is a placeholder wordmark in `src/components/Logo.tsx`. Replace it with the official SVG.
- **Share image** (`src/app/opengraph-image.jpg`) is the ad creative on a blurred backdrop, so WhatsApp/Facebook previews match the ad. The source creative is kept in `creative/`; `src/assets/site-impression.webp` is the township photo cropped from it.
- **JS budget:** app code is ~25 KB gzipped. The Next 16 + React 19 runtime adds ~170 KB, so the PRD's 120 KB target is not reachable on Next.js alone. Verify Lighthouse on the deployed URL with PageSpeed Insights.

## Pre-launch checklist (from PRD)

- [ ] RERA details were removed from the site on request: get legal sign-off before running ads without them
- [ ] Project/locality name, site address, connectivity bullets
- [ ] Legal entity, registered address, Grievance Officer in `content.privacy` / `content.brand`; legal sign-off on the privacy policy
- [ ] Channel partner name + RERA (if applicable) in `content.brand`
- [ ] Confirm price inclusions and EOI refundability (update FAQ + footnote)
- [ ] Confirm the WhatsApp Business number
- [ ] Official logo SVG, hero artwork, site photos
- [ ] KS Properties registered legal entity name and address
- [ ] Meta ad copy says 58 acres / 400–750 sq. yd; brochure says 50+ acres / 400, 550, 800 sq. yd (site follows the brochure). Align the ads
- [ ] Confirm the amenity list from the ad copy (pool, aqua yoga deck, box cricket…) belongs to Arvind Metal
- [ ] Verify the Google Maps short link and embed location
- [ ] Exact site map pin (`content.location.mapQuery`); currently centred on Ahmedabad city
- [ ] "Pre-launch benefits" was deliberately left off the site: confirm RERA status before using pre-launch language with EOI collection
- [ ] Test a lead in Events Manager with `META_TEST_EVENT_CODE`, confirm Pixel + CAPI `Lead` dedupe, then remove the code
- [ ] PageSpeed Insights mobile on production domain
