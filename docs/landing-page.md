# Nerved / نرفد — Landing page

Implemented inside `narfid` only. `go` was read as the reference implementation and was not modified.

## Design

- Arabic, RTL, Tajawal, hosted locally by `next/font`.
- Color source: `.agents/skills/UI-system/supabase.DESIGN.md`.
- Background `#1C1C1C`, cards `#2E2E2E`, text `#EDEDED`, borders `#333333`, accent `#3ECF8E`.
- The `UI-system/SKILL.md` path referenced by `AGENTS.md` does not exist in this checkout; the available design document above was read and used.
- Both existing logos are reused without modifying their files. Go Fitness is the first client, not the product brand.
- Dashboard numbers and member/appointment examples are synthetic and explicitly labeled.

## Main files

- `app/page.tsx`: page entry.
- `app/layout.tsx`: language, font and metadata.
- `app/globals.css`: semantic tokens, responsive styling and reduced motion.
- `components/landing-page.tsx`: sections, preview tabs, FAQ and demo request.
- `lib/landing-content.ts`: contact, prices and text.
- `components/ui/`: shadcn Base UI primitives.

## Contact flow

The user supplied sales WhatsApp number `+201066471110`. Visitors enter their name, institution, branch count and interested plan, review the details, then open an encoded WhatsApp message. The message sends only when the visitor chooses Send in WhatsApp. No lead database, checkout, login or automatic external messaging was added.

The form validates required names, preserves details when editing the reviewed request and supports copying its text. It does not persist visitor data.

## Commercial proposal

- أساس: SAR 3,600/year, one branch.
- تشغيل: SAR 7,200/year, one branch; adds POS, kitchen and retail inventory.
- توسّع: SAR 12,000/year, up to three branches; adds bookings and branch reporting.
- شراكة تقنية: separately scoped services added to the platform subscription.

These are proposed launch prices. Taxes, migration, extra branches, hardware, customization and maintenance require a final quotation. Monthly equivalents are for comparison; billing is annual.

See `market-and-pricing.md` for primary vendor sources and the platform audits for implementation evidence and SaaS gaps.

## Running locally

Run `npm run dev` from `F:/saas/narfid`.

Before production publishing, set `NEXT_PUBLIC_SITE_URL` to the actual HTTPS origin. Share metadata defaults to `http://localhost:3000` for local development. Existing Supabase configuration was preserved; no secrets or production data were used.

## Verification boundary

Production build, TypeScript, ESLint and HTTP checks are run against the completed source. CUA browser inventory returned no browsers or apps, so actual desktop/mobile rendering and browser interaction testing could not be performed in this session. Responsive rules, the request flow and RTL behavior were reviewed statically.

## Next stage

Existing club-member subscriptions are distinct from future Nerved vendor billing. Tenant onboarding, annual SaaS payments, entitlements, tenant lifecycle and management accounts remain separate work; review the backend audit before implementing them.
