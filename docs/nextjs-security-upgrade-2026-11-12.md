# Next.js security upgrade — 12 November 2026

Upgraded `next` and `eslint-config-next` from **16.4.0 to 16.4.6**, pinned exactly in `package.json` and `package-lock.json`. Matching Next.js environment, SWC and lint-plugin packages resolve to 16.4.6. React and React DOM remain at 19.3.0. The existing Cache Components and Partial Prefetching configuration needs no migration for this patch update.

The installed-version upgrade guide permits manual package installation. npm's current stable tag and the [official 16.4.6 release](https://github.com/vercel/next.js/releases/tag/v16.4.6) were checked on 2026-11-12. The security upgrade helper remained at “Preparing upgrade” without selecting a target; installation used the independently verified exact stable versions.

Before the update, npm reported these Next.js advisories affecting 16.4.0. Their vendor advisories list 16.4.1 as the patched 16.x release:

- [GHSA-673q-mjm6-r5xr](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr): Cache Components handling of typed-array return values.
- [GHSA-2464-fhr4-w9xw](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw): image optimization's upstream library on affected Linux configurations.
- [GHSA-p3m5-59mp-jv5r](https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r): resource consumption through App Router Server Actions.

This update removes the installed package from the reported affected ranges. It does not claim that every exploit condition existed in this application, and no exploit requests were sent to production.

Validation:

- `npm run lint` passed.
- `npx tsc --noEmit --incremental false` passed.
- `npm run build` passed on Next.js 16.4.6 without the vulnerability reminder.
- All 72 existing unit/content tests passed, including article expansion, OAuth, access control and SEO.
- Five existing Playwright tests passed for public article navigation and responsive member-app interaction, keyboard behavior and reduced motion.
- Production-mode browser checks cover public pages, protected-route responses, chairman login, board navigation, logout and desktop/mobile rendering. Detailed temporary output and screenshots stay under `.private/next-security-qa/`, outside Git.

`npm audit --omit=dev --json` no longer reports `next` and has **zero critical findings**. It still reports 13 other package findings (7 high, 5 moderate, 1 low), down from 14 before the update. These are dependency advisories, not demonstrated application vulnerabilities. Packages named by that production-dependency audit include `shadcn`, `@shadcn/registry`, `ts-morph`, `@ts-morph/common`, `body-parser`, `deepmerge`, `fast-uri`, `minimatch`, `qs`, `re2js`, `systeminformation`, `undici` and `zod`; they require separate reachability and upgrade review. No broad `npm audit fix` was applied. Raw audit output is local in `.private/security-upgrade-audit-{before,after}.json`.

Delivery: commit and push to the existing `master` upstream, then verify Vercel's commit status and the live site's public/protected responses. The previous SEO run's warning remains a dated observation; the current backlog marks this Next.js upgrade complete.
