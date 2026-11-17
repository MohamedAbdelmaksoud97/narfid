# Nerved / نرفد — Landing page

Implemented inside `narfid` only. `go` was read as the reference implementation and was not modified.

## Design

- Arabic, RTL, Tajawal, hosted locally by `next/font`.
- Color source: `.agents/skills/UI-system/supabase.DESIGN.md`.
- Background `#1C1C1C`, cards `#2E2E2E`, text `#EDEDED`, borders `#333333`, accent `#3ECF8E`.
- The `UI-system/SKILL.md` path referenced by `AGENTS.md` does not exist in this checkout; the available design document above was read and used.
- Both existing logos are reused without modifying their files. Go Fitness is the first client, not the product brand.
- The hero uses the actual GO dashboard screenshot, edited to Nerved colors and logo with illustrative values. Source provenance and editing prompt are in `hero-image.md`. It can be opened at full size.

## Main files

- `app/page.tsx`: page entry.
- `app/layout.tsx`: language, font and metadata.
- `app/globals.css`: semantic tokens, responsive styling and reduced motion.
- `components/landing-page.tsx`: sections, system screenshot, FAQ and demo request.
- `public/images/nerved-dashboard.png`: rebranded system screenshot used in the hero.
- `lib/landing-content.ts`: contact, prices and text.
- `components/ui/`: shadcn Base UI primitives.

## Contact flow

The user supplied sales WhatsApp number `+201066471110`. Visitors enter their name, institution, branch count and interested plan, review the details, then open an encoded WhatsApp message. The message sends only when the visitor chooses Send in WhatsApp. No lead database, checkout or automatic external messaging was added. Board authentication is a separate flow described in `board-authentication.md`.

The form validates required names, preserves details when editing the reviewed request and supports copying its text. It does not persist visitor data.

## Commercial proposal

- أساس: SAR 1,800/year, one branch, up to 1,000 registered members.
- نمو: SAR 3,300/year, one branch, up to 5,000 registered members; recommended for growing institutions.
- احتراف: SAR 4,200/year, one branch, up to 10,000 registered members.
- توسّع: SAR 6,600/year, two branches, 10,000 registered members combined; adds central branch management and reporting.
- شراكة تقنية: scoped quote for higher member counts, three or more branches or custom technology needs; platform-only agreements remain possible and bespoke work is optional.

Every fixed plan includes memberships, freezes/renewals, attendance, bookings, coaching/measurements/plans, POS/cash shifts/invoicing/collections/refunds, employee schedules/attendance, permissions and reports. Inventory and kitchen/meal workflows are optional, separately quoted addons. Count all registered members including old/frozen/expired records, once across branches/subscriptions; prospects before member registration do not count. The owner explicitly changed the metric from active members and authorized increasing the proposed bands on 18 November. Quota enforcement and automatic billing remain outside this website/CRM offer update.

The owner approved this structure and these amounts on 18 November 2026. Taxes, migration, hardware, customization, maintenance and service terms require a final quotation. Monthly equivalents of SAR 150/275/350/550 are for comparison; billing is annual. The existing cards are retained in four desktop columns, two tablet columns and one mobile column. The public catalog and private CRM catalog are updated together; existing contract snapshots and account links are preserved.

See `market-and-pricing.md` for primary vendor sources and the platform audits for implementation evidence and SaaS gaps.

## Running locally

Run `npm run dev` from `F:/saas/narfid`.

The live domain is `https://www.narfid.com` (launched 9 November 2026). Production builds default to that origin for share metadata; `NEXT_PUBLIC_SITE_URL` can override it. Local development defaults to `http://localhost:3000`. Indexing defaults to enabled only for the official domain in Vercel production; previews and development stay excluded, and `SITE_INDEXING_ENABLED=false` explicitly disables indexing. See `docs/seo-launch.ar.md` for launch verification. Existing Supabase configuration was preserved; no secrets or production data were used.

## Verification boundary

Pricing verification on 18 November 2026: Next production build, TypeScript, ESLint and six CRM unit checks; Playwright rendering of the home and pricing pages at 320, 390, 768, 1024, 1200 and 1440 pixels with no horizontal overflow or page errors. All four home-page plan buttons select the correct demo-request option. The partnership page supports platform-only scope. The private catalog was verified against the public prices with existing plan IDs, account links and contract snapshots unchanged. The vinext/Cloudflare production build also passed, including public prerender verification; Worker preview was checked at 1440 and 390 pixels under the canonical host, including the four plan buttons.

Registered-member revision verification on 18 November: the same build/lint/type/CRM and responsive checks passed after updating the bands to 1,000 / 5,000 / 10,000 and 10,000 combined across two branches. Browser assertions verify shared core features, optional inventory/kitchen addons, correct renamed demo selections and explicit inclusion of old/frozen/expired members. The live chairman view confirms the updated catalog. CRM migration retains IDs and leaves account links and historical contract snapshots unchanged. Independent review found no actionable defects.

## Next stage

Existing club-member subscriptions are distinct from future Nerved vendor billing. Tenant onboarding, annual SaaS payments, entitlements and tenant lifecycle remain separate work; review the backend audit before implementing them. Board login and a protected welcome area are now implemented; future internal management sections are the next stage. See `board-authentication.md` for account provisioning requirements.
