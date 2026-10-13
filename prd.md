PRD — Arvind Group Ahmedabad Plot Launch Landing Page
Oct 13, 2026 · @Saurav Bhai
Overview
Build a single-purpose, mobile-first landing page that converts Meta ad clicks into qualified plot-enquiry leads for the Arvind Group 400 sq. yard plot launch in Ahmedabad. The site has two routes (Home, Privacy Policy), one lead form, a floating WhatsApp button, and click-to-call. No CMS, no login, no blog.
Primary goal: capture name, phone and intent from Meta traffic and push each lead to the sales team within 60 seconds.
Target users: Ahmedabad and Gujarat residents and NRIs aged 28–60, arriving from a Facebook or Instagram ad on a mobile phone (expect 85%+ mobile traffic).
Metric
Target
Landing page conversion rate (form submit / sessions)
8–12%
Mobile Largest Contentful Paint (4G)
under 2.5 s
Lighthouse mobile performance score
90+
Form error / abandonment after first field
under 40%
Lead delivery to sales (sheet + email/WhatsApp alert)
under 60 s
Pixel + Conversions API event match quality
Good or Great in Events Manager
Offer details (content source of truth)
All offer copy must match the ad creative exactly; Meta rejects or penalises ads whose landing page contradicts the ad. Store these values in one config file so they can be changed without touching components.
Field
Value
Notes
Brand
Arvind Group
Tagline: "Building Tomorrow"
Location
Ahmedabad, Gujarat
Exact project/locality name: open question
Product
Residential plot, 400 sq. yards
Show as "400 Sq. Yards" (approx. 3,600 sq. ft / 334 sq. m)
Price
₹36 Lakhs
Label "Starting price" + "*Price excl. registration & other charges" unless client confirms all-inclusive
EOI amount
₹50,000
Expression of Interest; refundable status: open question
Highlights
Prime Location, Secure Investment, Well Planned Township, Wide Roads & Infrastructure
Use as the 4 feature cards
Phone 1
+91 75290 42124
Primary call CTA
Phone 2
+91 88728 88900
Secondary call CTA
WhatsApp number
+91 75290 42124 (assumed)
Confirm which number is on WhatsApp Business
Campaign line
"Invest Today for a Better Tomorrow"
Closing CTA section
RERA number
TBD
Mandatory before launch — see Compliance
The uploaded creative (Ahmedabad_Premium_Plot_Launch.png) is the visual reference and may be reused as the hero image's mobile fallback, but the hero should be rebuilt in HTML/CSS so the text is crisp, translatable and indexable.
Site map and routes
Three routes, no navigation menu beyond a logo and a call button — every extra link leaks ad traffic.
Route
Purpose
Indexed
/
Home: hero, highlights, lead form, location, FAQ, footer
Yes
/privacy-policy
Privacy policy (required by Meta for lead collection and by India's DPDP Act 2023)
Yes
/thank-you
Post-submit confirmation; fires the Lead conversion
No (noindex)
Global elements on every route: sticky header (logo left, "Call Now" right), floating WhatsApp button (bottom-right), footer with privacy policy link, RERA number and disclaimer. On mobile, a sticky bottom bar replaces the header call button: Call | Enquire Now (scrolls to form). The WhatsApp button sits above that bar so they never overlap.
Preserve UTM parameters (utm_source, utm_medium, utm_campaign, utm_content, utm_term) and fbclid across all three routes and attach them to every lead.
Home page specification
The home page is one scroll, in this order. The lead form must be reachable within one thumb-scroll on mobile and visible above the fold on desktop.
1. Header (sticky, 56 px mobile / 72 px desktop)
    ◦ Arvind Group logo (left, links to /), "Call Now" button with phone icon (right, tel:+917529042124).
2. Hero
    ◦ Background: landscaped plotted township with city skyline (from creative), dark gradient overlay for legibility.
    ◦ Eyebrow chip: "New Launch Alert • Ahmedabad".
    ◦ H1: "400 Sq. Yards Plots in Ahmedabad"
    ◦ Price line: "Starting at ₹36 Lakhs*" (large, yellow highlight).
    ◦ EOI badge: "Book with EOI of just ₹50,000".
    ◦ Primary CTA: "Get Price Sheet & Site Visit" (scrolls to form). Secondary CTA: "WhatsApp Us".
    ◦ Desktop: hero text left, lead form card right (form embedded in hero). Mobile: form appears directly below hero.
3. Highlights strip — 4 icon cards in a 2×2 grid (mobile) / 4-column row (desktop): Prime Location, Secure Investment, Well Planned Township, Wide Roads & Infrastructure. One line of supporting copy each, e.g. "Wide internal roads with planned drainage and street lighting" (client to confirm each claim).
4. Offer snapshot — three stat tiles: "400 Sq. Yards" · "₹36 Lakhs*" · "₹50K EOI". Note under tiles: "*Limited plots in first release" only if client confirms scarcity is true.
5. Lead form section (if not in hero on mobile) — heading "Reserve Your Plot Today", subhead "Our team will call you within 30 minutes with price sheet, layout plan and site visit slots."
6. Why Arvind Group — 2–3 short trust lines (legacy, delivered projects) supplied by client. Optional; hide section if no copy.
7. Location — embedded Google Map (lazy-loaded on scroll, static image placeholder first) + 3–5 connectivity bullets (distance to SG Highway, airport, etc. — client to supply).
8. Gallery (optional) — up to 6 site/render images in a swipeable carousel, WebP, lazy-loaded.
9. FAQ — accordion, 5–6 items: What is EOI and is it refundable? Is the project RERA registered? Are home loans available? What are additional charges? Can I visit the site? Is the title clear?
10. Closing CTA — "Invest Today for a Better Tomorrow" with "Enquire Now" and both phone numbers.
11. Footer — logo, RERA number + RERA site link, both phone numbers, privacy policy link, disclaimer text (see Compliance), © year.
Copy tone: confident, short sentences, English primary. Gujarati version is out of scope for v1 but components must not hardcode strings outside the content config.
Lead form
Keep the form to 4 visible fields plus consent; every extra field costs roughly 5–10% of conversions on mobile.
Field
Type
Required
Validation / behaviour
Full name
text
Yes
2–60 chars, letters, spaces, dots only; autocomplete="name"
Mobile number
tel
Yes
+91 prefix fixed; exactly 10 digits starting 6–9; inputmode="numeric", autocomplete="tel-national"
City
select
Yes
Ahmedabad, Gandhinagar, Other Gujarat, Outside Gujarat, NRI
Interested in
radio chips
Yes
"Pay EOI & reserve" / "Site visit" / "Just want price sheet"
Email
email
No
Standard email regex; optional — hide on mobile behind "Add email (optional)" link
Consent
checkbox
Yes
Unticked by default: "I agree to be contacted by Arvind Group and its authorised partners via call, SMS and WhatsApp about this project, and accept the Privacy Policy." (link opens /privacy-policy in new tab)
Hidden fields
hidden
Auto
utm_*, fbclid, _fbc, _fbp, landing URL, referrer, device type, timestamp (IST), event_id (UUID for Pixel/CAPI dedupe)
Submit button: "Get Price Sheet" (full-width on mobile, yellow, min 48 px tall). Disabled with spinner while submitting.
Anti-spam: honeypot field, minimum 3 s time-to-submit, server-side rate limit (5 submissions per IP per hour), duplicate check on mobile number within 24 h (accept silently, flag as duplicate). No CAPTCHA — it hurts conversion.
Submission flow:
1. Client-side validation with inline error messages under each field (no alert popups).
2. POST to a serverless endpoint (/api/lead) — never expose sheet/CRM keys in the browser.
3. Server re-validates, then writes the lead to Google Sheets (v1 store) and sends an instant notification: email to sales inbox + WhatsApp/Telegram alert to the sales lead (configurable via env vars). CRM webhook (e.g. LeadSquared, Zoho, HubSpot) supported as an optional env-configured URL.
4. Server fires Meta Conversions API Lead event with hashed phone, email, city, fbc, fbp, client IP, user agent and the shared event_id.
5. Browser redirects to /thank-you, which fires Pixel Lead with the same event_id.
6. On failure: show "Something went wrong — please call 75290 42124 or WhatsApp us" with both buttons; also queue the payload in localStorage and retry once on next page load.
Thank-you page: "Thank you, {first name}! Our team will call you shortly." Show both call buttons, a WhatsApp button with pre-filled message, and the EOI amount as a reminder. No form.
WhatsApp button and call CTAs
The floating WhatsApp button is visible on every route, every scroll position, and never covers the form submit button.
• Position: fixed, bottom-right, 16 px from edges on desktop; on mobile, 16 px above the sticky bottom bar. Respect env(safe-area-inset-bottom) on iPhones.
• Look: 56 px circle, WhatsApp green #25D366, white official glyph (inline SVG), soft shadow. A one-time pulse animation 3 s after load; respects prefers-reduced-motion.
• Tooltip / label: on desktop, a pill reading "Chat with us" slides out on hover; on mobile, show a small dismissible bubble "Hi! Need the price sheet?" once after 8 s.
• Link: https://wa.me/917529042124?text= + URL-encoded message: "Hi, I'm interested in the 400 sq. yard plot in Ahmedabad (₹36 Lakhs). Please share price sheet and site visit details." Opens in new tab on desktop; native app on mobile.
• Tracking: fire Pixel Contact (custom param method: whatsapp) and a GA4 event whatsapp_click on tap. Send the same via CAPI with an event_id.
• Accessibility: aria-label="Chat on WhatsApp", focus ring visible, 44 px minimum tap target.
Call buttons: all phone numbers are tel: links. Fire Pixel Contact (method: call) and GA4 call_click on tap. On desktop, phone numbers are shown as text with a copy-on-click fallback since most desktops cannot dial.
Privacy policy page
The privacy policy must name the legal entity that receives the data and match what the site actually collects; a generic template is a common reason for Meta ad rejections. The agent drafts it from the outline below, and the client's legal team approves before launch.
Required sections:
1. Who we are — legal entity name, registered address, contact email and phone (client to supply). If the site is run by a channel partner or agency, name both and their roles.
2. What we collect — name, mobile, city, interest, optional email; automatically collected IP address, device/browser, cookies, UTM and ad-click identifiers.
3. Why we collect it — respond to the enquiry, share project details, schedule site visits, process EOI, measure ad performance.
4. Consent and legal basis — consent given via the form checkbox, per the Digital Personal Data Protection Act, 2023; how to withdraw consent.
5. Cookies and tracking — Meta Pixel, Conversions API, Google Analytics 4; what each does; how to opt out.
6. Sharing — with Arvind Group sales team, authorised channel partners, and service providers (hosting, Google Workspace, CRM). No sale of data.
7. Calls, SMS and WhatsApp — the user may be contacted on these channels even if registered on DND/NCPR, based on their explicit request; how to opt out (reply STOP or email).
8. Retention — e.g. 24 months from last contact, then deleted (client to confirm).
9. Your rights — access, correction, erasure, grievance redressal; named Grievance Officer with email and response time (within 30 days).
10. Security — HTTPS, restricted access, encrypted storage of credentials.
11. Children — not intended for users under 18.
12. Changes — last-updated date at top; material changes noted on the page.
Layout: same header and footer as home, single readable column (max 720 px), table of contents with anchor links, plain HTML (no PDF).
Design system
The page borrows the creative's palette so the ad-to-page jump feels seamless: deep green base, gold/yellow for offers and CTAs, red only for urgency accents.
Token
Hex
Use
--green-900
#0F3D2A
Footer, form card, dark sections
--green-700
#1E5B3C
Section backgrounds, icon rings
--gold-500
#F5C518
Primary CTA, price highlight, EOI badge
--gold-300
#FFE082
Hover states, badge gradients
--red-600
#C8102E
"New Launch" chip, brand wordmark accent (sparingly)
--ink
#111111
Body text on light
--paper
#FAFAF5
Light section background
--white
#FFFFFF
Text on dark
Typography: headings in Poppins 700/800 (matches the creative's bold sans), body in Inter 400/500, both from Google Fonts with font-display: swap and system fallbacks. Mobile sizes: H1 32 px, H2 24 px, body 16 px, price 40 px. Desktop: H1 52 px, price 64 px.
Components: primary button (gold fill, dark text, 12 px radius, 48 px min height), secondary button (white outline on dark), feature card (icon in gold ring + 2-line label), stat tile, form card (white, 16 px radius, shadow), accordion, sticky bottom bar, WhatsApp FAB.
Imagery: hero uses the plotted-layout landscape; export at 1600 px and 800 px widths, WebP/AVIF, with a blurred low-quality placeholder. Logo as SVG — request the official file from the client rather than cropping the PNG.
Layout: mobile-first, content max-width 1200 px, 16 px gutters on mobile, 8 px spacing scale. Test at 360, 390, 768, 1280 and 1440 px widths.
Tech stack, tracking and performance
Use Next.js (App Router, static export for pages + one API route) on Vercel or Netlify; it ships fast static HTML and keeps the lead endpoint server-side. An equivalent Astro build is acceptable.
Area
Choice
Framework
Next.js 14+ with TypeScript, Tailwind CSS
Hosting
Vercel (Mumbai region bom1 for API route), custom domain with HTTPS
Lead storage
Google Sheets via service account (v1); optional CRM webhook
Notifications
Email (Resend or SMTP) + optional WhatsApp Cloud API / Telegram bot alert
Analytics
Meta Pixel + Conversions API, GA4, Microsoft Clarity (heatmaps)
Config
content.ts for all copy/prices/phones; .env for keys
Environment variables: META_PIXEL_ID, META_CAPI_TOKEN, META_TEST_EVENT_CODE, GA4_ID, CLARITY_ID, GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_JSON, LEAD_NOTIFY_EMAILS, CRM_WEBHOOK_URL, WHATSAPP_NUMBER, SITE_URL.
Meta events:
Event
Trigger
Pixel
CAPI
PageView
Every page load
Yes
Yes
ViewContent
Form scrolled into view (50% visible)
Yes
No
InitiateCheckout (or custom FormStart)
First form field focused
Yes
No
Lead
Successful submit (on /thank-you)
Yes
Yes, deduped by event_id
Contact
WhatsApp or call tap
Yes
Yes
Pass hashed (SHA-256) phone in E.164, email, city, country in via CAPI. Verify with META_TEST_EVENT_CODE in Events Manager before launch, then remove it.
Performance budget: total JS under 120 KB gzipped on home; hero image under 150 KB; load Pixel, GA4 and Clarity after first interaction or 3 s idle (but capture fbclid immediately); Google Map lazy-loaded; no web-font flash.
SEO basics: title "400 Sq. Yard Plots in Ahmedabad from ₹36 Lakhs | Arvind Group", meta description, Open Graph image (the creative), RealEstateListing/Organization JSON-LD, sitemap.xml, robots.txt (disallow /thank-you), canonical URLs.
Accessibility: WCAG 2.1 AA contrast (gold buttons use dark text), labelled inputs, keyboard-navigable form and accordion, alt text on all images.
Compliance (blocking for launch)
Real-estate ads in India carry legal requirements on top of Meta's own policies; the site must not go live until each item below is confirmed. These are general requirements, not legal advice — the client's counsel should sign off.
[ ] Gujarat RERA: a registered project's RERA registration number and the GujRERA website URL must appear on the page (hero or offer snapshot, and footer) and ideally in the ad creative itself, which currently has none. Agent/channel partner RERA number too, if a broker runs the campaign. If the project is not yet RERA-registered, the client must confirm it can be advertised at all, including EOI collection.
[ ] Brand authorisation: written confirmation that the advertiser is Arvind Group or an authorised channel partner permitted to use the Arvind name and logo. If a partner, footer must say "Marketed by {partner name}, authorised channel partner".
[ ] Price claims: ₹36 Lakhs and ₹50K EOI must be accurate; add footnote listing what is excluded (stamp duty, registration, development/maintenance charges, GST if applicable).
[ ] Disclaimer text in footer: "Images are artistic impressions and for representation only. Prices, plot sizes and availability are subject to change without notice. This is not an offer or contract. Refer to RERA-registered documents for details."
[ ] Meta advertising policies: declare the Housing special ad category when creating the campaign (Meta applies it to real-estate ads and restricts age, gender and narrow location targeting in many regions — check current rules for India in Ads Manager). Landing page must be functional, match the ad, have a privacy policy, and avoid fake urgency (no fake countdown timers or invented "only 3 left").
[ ] DPDP Act 2023 and TRAI: explicit unticked consent checkbox, privacy policy linked at point of collection, Grievance Officer named; consent wording covers calls/SMS/WhatsApp so follow-ups to DND-registered numbers are defensible.
[ ] WhatsApp Business: the WhatsApp number must be on WhatsApp Business with a business profile (name, address, hours) to avoid looking like a personal number.
Acceptance criteria and open questions
The build is done when every box below is ticked on the production domain.
[ ] Home, /privacy-policy and /thank-you render correctly at 360, 390, 768, 1280 and 1440 px with no horizontal scroll.
[ ] Lighthouse mobile: Performance 90+, Accessibility 95+, Best Practices 95+, SEO 95+.
[ ] Valid submission lands in the Google Sheet with all hidden fields and triggers the sales email within 60 s.
[ ] Invalid phone (9 digits, starts with 5, letters) shows inline errors and does not submit; honeypot submissions are dropped silently.
[ ] Pixel Lead and CAPI Lead appear in Events Manager test events, deduplicated into one event.
[ ] WhatsApp button opens chat with the pre-filled message on Android and iOS, and never overlaps the submit button or bottom bar.
[ ] tel: links dial the right numbers; WhatsApp and call taps fire Contact.
[ ] UTM parameters from a test ad URL survive to the sheet row.
[ ] All compliance checklist items confirmed by client.
[ ] All copy, prices and phones come from content.ts; changing one value there updates every instance.
Open questions for the client (agent uses the noted default until answered):
[ ] Project/locality name and exact site address? (default: "Ahmedabad")
[ ] RERA registration number? (no default — blocks launch)
[ ] Which number is on WhatsApp? (default: 75290 42124)
[ ] Is ₹36 Lakhs all-inclusive, and is the ₹50K EOI refundable? (default: "excl. charges", refundability not stated)
[ ] Lead destination: Google Sheet only, or a CRM? (default: Sheet + email)
[ ] Domain to use? (default: subdomain on the advertiser's domain)
[ ] Official logo SVG, site photos and connectivity distances?