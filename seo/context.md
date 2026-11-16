# SEO autopilot — narfid

Last daily run: 2026-11-16. Setup baseline: 2026-11-12.

## Daily update — 2026-11-16

- The homepage links to the memberships solution, which now links to the published inquiry-call and locker-assignment guides. Their baseline depths of four and three become two. The guides retain their existing keyword owners. See [daily report](reports/2026-11-16.md) and [crawl evidence](reports/2026-11-16-health.json).
- All 72 sitemap URLs and 77 discovered pages returned HTTP 200. The crawl checked 78 internal targets and 291 fragment links. Request p95 was 394 ms from this probe.
- Search Console showed 38 global impressions and 15 clicks, with 9 Saudi impressions and no Saudi clicks. Final data ran through November 14. The only reported query was `narfid` at position 1.875 globally. URL Inspection confirmed the memberships solution indexed. The annual-cost guide was discovered, and the library URL returned unknown. GA4 recorded 2 users, 7 Direct sessions, 43 views and 4 demo starts. Saudi GA4 and previous-period totals were unavailable. See [Google evidence](reports/2026-11-16-metrics.json).
- The commits since November 15 covered local walkthrough media and documentation. They did not change public product or pricing sources. Weekly and monthly work remain due November 19 and December 12.

## Daily update — 2026-11-15

- The 72 sitemap URLs and 77 discovered public pages returned HTTP 200 on their first requests. The HTML audit checked 78 internal targets and 291 fragment links and found server-rendered main content on every page. Its request p95 was 636 ms from this probe. Pagination pages 2–5 already have distinct titles and individual canonicals. They share a description, which [Google's pagination guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading#use-urls-correctly) allows. See [crawl evidence](reports/2026-11-15-health.json).
- The bookings solution now links to the academy procedures for coach substitution and group transfers. Both guides were reachable only through library page 2 before the change, and URL Inspection already confirmed both indexed. The article library was discovered and awaiting indexing. See [daily report](reports/2026-11-15.md).
- Search Console for October 18–November 14 showed 28 global impressions and 14 clicks, with 6 impressions and no clicks in Saudi Arabia. Final data ran through November 13. The only available query was branded (`narfid`), added as a supporting variant with its observed global position. GA4 reported 2 users, 7 Direct sessions, 43 views and 4 demo starts. Saudi GA4 and previous-period totals were unavailable. [Google evidence](reports/2026-11-15-metrics.json).
- The footer profile commit introduced no changes to sourced prices, features, limits, or integration claims. The keyword map still has 72 primary owners, with its full rebuild dated November 12. Weekly work is due November 19 and monthly work December 12.

## Daily update — 2026-11-14

- Fresh native-DNS crawl: 72 sitemap URLs, 77 discovered pages, all first responses 200. Both the system resolver and 1.1.1.1 now return Cloudflare IPv4. A separate HTML audit checked 78 internal targets and 291 fragments with no failures; request p95 was 369 ms from this probe, not a Core Web Vitals measurement. Pagination repeats the library title/description and remains a focused backlog item. See [health evidence](reports/2026-11-14-health.json).
- Added contextual links from `/solutions/kitchen-inventory` to the already-published damaged-stock and meal-order-correction procedures, with a review scenario separating stock balance from meal entitlement. Ten articles had library-only inbound links before this change; these two already had depth two through the library. The benefit is a relevant commercial entry point, not a shorter click path. Automatic build `09580bb9-e77a-4750-bf8e-7eb1f355cc79` deployed `23060bb` successfully at 17:26 UTC; public desktop/mobile links, targets, metadata and layout verified. See [deployment proof](reports/2026-11-14-deployment.json).
- Existing Google connection read on 2026-11-14 at 17:15–17:20 UTC: GSC 2026-10-17–2026-11-13, final data through November 11: 8 impressions/1 click globally, 4/0 in Saudi Arabia. No query rows or previous totals; page averages do not establish query positions. GA4 historical reporting worked: 2 users, 7 sessions, 43 views, all sessions Direct, 4 `demo_request_start` events; Saudi totals and previous-period values unavailable. No qualified leads established. [Current measurements and inspection sample](reports/2026-11-14-metrics.json).
- URL Inspection still does not confirm indexing of the memberships solution or annual-cost guide. The former currently returns unknown URL, the latter discovered/not indexed. No technical block found in the public crawl; do not infer a cause or sitewide indexing count from this sample.
- Since the previous run, commits added a class-occupancy guide and local videos/audio changes; no product, pricing or scope source changed. The incremental keyword map now covers the new live guide using its existing November 13 research, with 72 primary owners. Map rebuild date remains November 12.
- Weekly remains due November 19 and monthly December 12. No recurring automation, Google setting, paid service, submission, outreach or social post created.

## Daily follow-up — 2026-11-13

- Two fresh Cloudflare crawl samples returned 200 for all 76 public pages (71 sitemap URLs). The local router resolver still returned Vercel addresses and HTTP 402 while Cloudflare, Google Public DNS and the authoritative server returned Cloudflare addresses. See [follow-up report](reports/2026-11-13-autopilot.md).
- Added two contextual links from the point-of-sale solution to published guides on unmatched payments and discount approvals. Search Console URL Inspection confirmed both guides and the solution were already indexed before the update.
- The board returned current-window Search Console totals of 3 impressions/1 click globally and 1 impression/0 clicks in Saudi Arabia, with final data through 2026-11-10. Historical GA4 returned a quota error. No new price, feature or scope changes were found in the intervening commits.

## Daily update — 2026-11-13

- Production moved to Cloudflare Workers/vinext; `cloudflare.config.ts` and `README.md` now own deployment facts. Normal pushes to `master` trigger Workers Builds. Prior Vercel deployment references below describe the dated setup baseline.
- Current crawl: 71 sitemap URLs, 76 discovered pages. Seventeen pages encountered HTTP 503; two still failed after three attempts. Workers logs identify `exceededCpu`, not missing metadata, as the observed runtime failure. Do not declare the site healthy or these failed pages orphaned/thin. See `reports/2026-11-13-health.json` and `reports/2026-11-13-runtime.json`.
- Local system DNS still returned old Vercel IPs (HTTP 402), while 1.1.1.1, 8.8.8.8 and authoritative Cloudflare DNS returned Cloudflare IPs. Verification retained TLS hostname and scoped resolution to those site hosts; no DNS records or machine configuration changed. This sample does not establish worldwide propagation.
- Fixed the Google report transport: Workers rejects `redirect: "error"`; use `manual`, with existing non-2xx rejection preventing redirects or credential forwarding. No Google settings or scopes changed.
- Workers Build `173c9623-2bc5-462a-abe6-7e9161242b85` successfully deployed code commit `a334fd3` as version 10. Post-deploy GSC all/Saudi endpoints return HTTP 200 without provider errors; global fetchedAt `2026-11-13T12:50:26.638Z`. GA4 remains unavailable, with timeout messages in live logs. See `reports/2026-11-13-deployment.json`.
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

### Workers Free publication model — 2026-11-13

The owner explicitly accepts a few minutes for public changes after an automatic
build, while unpublishing must block article access immediately. Current public
HTML/Flight snapshots and responsive image variants are built from publications
only. Article requests retain the live slug/publication gate; image requests
retain storage RLS. The editor queues a server-only deploy hook and offers a
build-only retry without repeating publication. Direct RPC batch importers must
queue a build after their authorized batch. Board/API routes stay dynamic and
private. See `docs/workers-free-rendering.md` and the dated follow-up report.

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
