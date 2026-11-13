# SEO autopilot — narfid

Last daily run: 2026-11-13. Setup baseline: 2026-11-12.

## Daily update — 2026-11-13

- Production moved to Cloudflare Workers/vinext; `cloudflare.config.ts` and `README.md` now own deployment facts. Normal pushes to `master` trigger Workers Builds. Prior Vercel deployment references below describe the dated setup baseline.
- Current crawl: 71 sitemap URLs, 76 discovered pages. Seventeen pages encountered HTTP 503; two still failed after three attempts. Workers logs identify `exceededCpu`, not missing metadata, as the observed runtime failure. Do not declare the site healthy or these failed pages orphaned/thin. See `reports/2026-11-13-health.json` and `reports/2026-11-13-runtime.json`.
- Local system DNS still returned old Vercel IPs (HTTP 402), while 1.1.1.1, 8.8.8.8 and authoritative Cloudflare DNS returned Cloudflare IPs. Verification retained TLS hostname and scoped resolution to those site hosts; no DNS records or machine configuration changed. This sample does not establish worldwide propagation.
- Fixed the Google report transport: Workers rejects `redirect: "error"`; use `manual`, with existing non-2xx rejection preventing redirects or credential forwarding. No Google settings or scopes changed.
- Existing authorized Google connection read directly using repository functions: GSC 2026-10-16–2026-11-12, latest returned day 2026-11-10; global 3 impressions/1 click, Saudi 1 impression/0 clicks; no query rows or previous-period totals. GA4 direct requests unavailable. See `reports/2026-11-13-metrics.json`; do not reuse yesterday's GA4 as today's measurement.
- `cf accounts subscriptions get` returned no account subscriptions; current Worker reports `usage_model: standard` without a custom limit. CPU-limit mitigation remains P0. Do not silently upgrade billing, cache private board responses, or loosen authentication to address it.
- Commits since setup changed hosting, images, JavaScript delivery and video handling; `lib/landing-content.ts`, `lib/solutions.ts` and `lib/identity-service.ts` have no intervening product/price/scope changes. No fact correction needed.
- Weekly and monthly work remain due on 2026-11-19 and 2026-12-12. No automation created.

Site: https://www.narfid.com
Product: مزوّد تقني للمؤسسات الرياضية في السعودية، بمنصة تربط العضويات والاشتراكات والحجوزات والتحصيل والمبيعات والوجبات ومخزون المنتجات والفروع.
Conversion: طلب عرض توضيحي مؤهل بعد متابعة الفريق؛ أحداث التواصل مؤشرات أولية فقط.
Competitors: Gymtrics, IDS Fitness, AskFlow. Adjacent results: inyad and Sektura.
Ship mode: commit and normal push to the current branch's upstream after checks, per `AGENTS.md`; verify the resulting public deployment. No recurring schedule created.

## Product and claims

| Fact | Source checked |
| --- | --- |
| Buyers: owners and managers of Saudi sports institutions; reception, finance, coaches and operations staff influence adoption | `.agents/skills/narfid/SKILL.md`, `lib/brand.ts` |
| Memberships, renewals, freezes, attendance; bookings for courts/classes/personal training; invoices and collections; POS shifts, retail stock and meals; branches and permissions | `lib/solutions.ts`, `lib/landing-content.ts`, `docs/platform-backend-audit.md` |
| أساس: SAR 3,600/year, one branch; تشغيل: SAR 7,200/year, one branch; توسّع: SAR 12,000/year, up to three branches | `lib/landing-content.ts`; [live pricing](https://www.narfid.com/pricing), checked 2026-11-12 |
| Prices are launch proposals, annual billing; monthly figures are equivalents. Tax, setup, migration, training/support and extra scope require an agreed quote | same live pricing page and `app/pricing/page.tsx` |
| Custom applications, hardware/integrations and technology partnership are separately scoped; no universal device or automatic payment integration claim | `lib/solutions.ts`, `app/technology-partnership/page.tsx` |
| Invoice/VAT calculations do not establish ZATCA integration; meal quantities do not establish recipe/ingredient costing | `docs/platform-backend-audit.md` §§ Finance, Kitchen |
| Optional visual identity service has a separate quote | `docs/visual-identity.ar.md`, `lib/landing-content.ts` FAQs |
| No verified customer outcome statistics, unlimited usage promise, instant self-serve activation, Saudi incorporation/location, or certifications inferred | `.agents/skills/narfid/SKILL.md`, product audits |

Go Fitness is the reference system/customer, not the public product name. No customer data or production reference-system access is needed for SEO.

## Existing publishing and SEO architecture

- Next.js 16.4.6 App Router with Cache Components, upgraded from 16.4.0 on 2026-11-12 after the owner's instruction; read local `node_modules/next/dist/docs/` before code changes. Supabase holds editorial records and separate public publication snapshots. Articles must use the existing editor/API and `publish_article` RPC; source JSON is historical, not the live inventory.
- Live authenticated inventory: 58 publications and 3 drafts. Sitemap: 71 public URLs. Pagination expands the navigable HTML graph to 76 URLs. Sources: `seo/reports/2026-11-12-health.json`, board/publication read on 2026-11-12.
- Metadata/canonicals/JSON-LD: `lib/seo.ts`, route metadata, `app/articles/[slug]/page.tsx`; sitemap: `app/sitemap.ts`; robots: `app/robots.ts`. Existing published-only guide lists in `lib/solutions.ts` and `components/articles/solution-operating-guides.tsx`.
- Credentials stay in `.private` and environment files, never in SEO state. Use the authorized chairman for board inspection. No schema changes, article reimports, or publishing test records in this run.
- The referenced `UI-system/SKILL.md` could not be found in repository or local skill roots. This run changes existing guide data only and reuses the existing rendering/styles; no new UI components or visual rules.

## Research, mapping and interpretation

- Preserve `content/seo-campaign/{keywords,research-log,initial-assessments,briefs}.json` and the opportunity register `.agents/skills/narfid-seo/references/keyword-opportunities.json` as the research sources. Existing campaign dates remain 2026-10-21. New focused competitor research is registered as `research-20261112-autopilot-setup`.
- Every research session must retain a top-level `pageChecks` array, even when query results also store inspection details. The article expansion importer consumes that array. After the final registry edit, run TypeScript without incremental cache and the existing `tests/article-expansion.test.tsx` before building; validation before editing the registry is not validation of the final change.
- `keyword-map.csv` is a derived working map: 71 primary rows, one per live canonical URL, and 19 supporting variants from the baseline. Supporting variants share their existing owner, not competing new pages. Provisional title-based and navigational assignments are explicitly sourced as editorial mappings, not proven demand. Rebuild date 2026-11-12; do not change historical phrase ownership automatically.
- Empty volume/difficulty/position means unavailable, never zero. Search Console returned no query rows; page-average positions must not populate query positions. Web retrieval order is not Google Saudi ranking.
- Three selected competitors are live Saudi category vendors found in current web results; the first sitemap snapshots are under `seo/competitors/`. No previous snapshot means no publication/traffic gains can be inferred. Sources: [Gymtrics](https://gymtrics.com/), [IDS](https://idsfitness.com/ar/), [AskFlow](https://askflow.sa/ar/gym-software), opened 2026-11-12.

## Measurement

Read the existing protected board APIs, not old reports: `GET /api/board/seo/google?country=all|sau`, `GET /api/board/seo/analytics?country=all|sau`, and Google POST `action: inspect` for a justified sample. Read-only Google access; do not change settings or request indexing via this integration. See `docs/search-console.md` and `.agents/skills/narfid-seo/SKILL.md`.

First baseline: `seo/reports/2026-11-12-metrics.json`. Both services connected. Historical window 2026-10-15–2026-11-11 vs 2026-09-17–2026-10-14; previous values unavailable. Search Console latest returned day 2026-11-10, Pacific reporting dates. GA4 property 563435056 uses Asia/Riyadh. Use each report's `fetchedAt`; this run's retrieval was approximately 13:23–13:26 Cairo time.

GA4 events `demo_request_start` and `whatsapp_click` are not completed lead submissions. Current all-country traffic is Direct and can include owner/test activity; no qualified leads or SEO revenue verified. Owner confirmed Enhanced measurement Off on 2026-11-10. Do not ask to turn it off again; duplicate page-view source remains unresolved. No analytics/contact test events sent this run.

The first report does not trigger a separate weekly/monthly production quota. Next weekly check is due from 2026-11-19, monthly map rebuild from 2026-12-12; dates are run triggers, not created automations.
