# Local system capture

This procedure does not authorize production access, including read-only access or login. It does authorize disposable local services and fictional seed data for video captures.

## Choose a database-backed route

Inspect each reference project's `AGENTS.md` before adapting its code. Read Supabase guidance for local Supabase work and Postgres best practices before writing schema/seed SQL. Do not contact production as part of discovery.

**PGlite route:** inspect `gosystem/tests/support/local-coaching-environment.ts` and `local-coaching-database.ts`. They create a local in-memory PostgreSQL-compatible database, a loopback socket, real business services/repositories/routes and an isolated test token verifier. `local-resource-data.ts`, `local-reporting-data.ts`, `local-renewal-data.ts` and related helpers supply scenarios. `go/scripts/test-resource-regressions-e2e.mjs` demonstrates connecting Next to the returned local URL and organization ID. Adapt the pattern in a disposable capture workspace; these are references, not a promised ready-made video launcher. Preserve test-only authentication, local identifiers and cleanup boundaries. Never put the adapter in a production build. This route may use local test sessions rather than password login.

**Local Supabase route:** use Docker-backed Supabase only in an isolated, unlinked copy of the backend. Start from versioned schema/migrations and fictional seeds, not production dumps. Inspect the current CLI `--help`; use explicit local scope for schema/seed operations. Never copy `.supabase` / `supabase/.temp` remote link state, use `--linked`, run remote bootstrap or set production override confirmations. Reference `gosystem/supabase/config.toml`: ports 54321 (local API/Auth), 54322 (Postgres), 54323 (Studio) are examples; verify availability and instance ownership before choosing them. Use local instance keys, never remote service-role keys.

If the route is unavailable, resolve the local dependency/setup issue. Do not silently replace the required local database with browser fixtures. The older `scripts/capture-marketing-screens.ts` uses actual UI with mocked API responses; it is useful for styling/capture ideas or explicitly approved fixture-only work, not evidence of local database execution.

## Isolate before starting anything

1. Create a disposable capture copy below `.private/video-runs/<run>/` (or an equivalent ignored directory). Copy source and approved assets only. Exclude `.git`, `.env*` except example templates, linked-project metadata, private files, dumps, customer spreadsheets, caches, build outputs and stored browser profiles. Never start `npm run dev` in the original production-configured directories for this task.
2. Supply an explicit environment file **outside** the service working directory, derived from `.env.example` and local instance output. Bind services to `127.0.0.1`, use fresh local organization/branch IDs and unrelated free ports. Do not overwrite the original `.env.local`. Remove inherited production configuration rather than merging the shell environment wholesale.
3. Verify the entire chain: browser → local Next BFF → local backend → local Postgres and local Auth/Storage. `API_BASE_URL` and `NEXT_PUBLIC_API_BASE_URL` must point to the local backend; the frontend must not receive Supabase secrets. Check `DATABASE_URL`, `SUPABASE_URL`, token/JWKS issuer, storage, workers and notification adapters. A localhost page, tunnel or proxy can still reach production: verify it is a genuine disposable local service.
4. Use `../scripts/run-local.mjs` for supported direct frontend/backend entrypoints (run `--help`). It refuses inherited dotenv files in the isolated service directory, validates explicit endpoint settings, and launches with a small OS environment allowlist. Its `--check-only` does not open connections. For a custom PGlite harness, apply the same invariants in its launcher, including explicit local config; do not run a harness just because its filename says local.
5. Disable real SMS/WhatsApp/FCM, email delivery, payments, device bridges, webhooks and remote background jobs. Use local sinks/no-op adapters and dummy credentials; no production service account files. Block non-loopback traffic in the capture browser, including service workers and WebSockets where relevant. Also enforce backend egress restrictions or inspect/stub every external adapter; browser interception alone cannot constrain server-side traffic. Bundle fonts/assets locally. Retain a redacted request/connection audit; investigate any remote destination before continuing.

## Optional local login

Example preflight from the narfid root, after preparing an isolated service and an explicit local environment file outside that service directory:

```powershell
node .agents/skills/narfid-video/scripts/run-local.mjs --role backend --dir .private/video-runs/demo/gosystem --env .private/video-runs/demo/backend.env --check-only
```

After verifying local instance ownership and adapter/egress isolation, omit `--check-only` to start that service. Use `--role frontend` with the isolated `go` directory and a frontend-only environment file for Next. Run guard tests with `node --test .agents/skills/narfid-video/scripts/run-local.test.mjs`.

Read `.private/video-reference-accounts.json` only if password login is needed. It contains the owner's supplied system-admin account; **create/use it only in the isolated local Auth/database**, never try the password against remote production. Existing bootstrap commands can load `.env.local` or permit remote override flags: inspect them and run their entrypoint with verified explicit local settings, not their production-oriented npm wrapper. MFA, if needed, must belong to a local test account. Never print the password, include it in shell arguments, screenshot its field, or copy it to tracked instructions.

## Seed and capture

Use plausible fictional Arabic member/staff names, demo-only contact values, Saudi currency/timezone, sensible memberships, dates, prices and workflows. Create related records through real local business services where practical so invoice totals, payments, stock, bookings, attendance and dashboard counts agree. Include useful active/frozen/expiring states without claiming the demo numbers are business results. Choose current relative dates to avoid stale-looking dashboards.

Capture real screens only after loading settles, fonts/images are ready and error/empty states have been checked. Use the original NARFID logo and browser-only styling when the reference app carries customer branding. Never show unrelated real data, notifications, system secrets or customer logos. For the current mobile source use `gomobileapp`; launch it against the same local API if actual mobile screenshots are needed. Otherwise label illustrative mobile graphics accurately in provenance.

Store assets and a redacted capture manifest with source revision, local route, seed scenario, screen paths, time and any limitations. Keep cookies/tokens/debug logs private. Clean up only owned disposable processes/data after assets are saved. Verify target ownership before any local reset/delete; never run cleanup against the reference/production configuration.
