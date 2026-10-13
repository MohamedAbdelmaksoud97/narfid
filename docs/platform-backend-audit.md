# Narfid platform backend audit

Reviewed on **13 October 2026**. Reference implementation: `F:\saas\go\gosystem`; first-client mobile implementation: `F:\saas\go\gomobileapp`.

## Scope and evidence limits

This is a source-code audit to support the first Narfid / Nerved marketing site and the subsequent SaaS conversion. **GO Fitness is the first customer, not the SaaS product name.** No source in the `go` tree was edited, and no production requests, customer records, environment secrets, or imported spreadsheets were read. No backend tests or database migrations were executed during this audit.

The audit reviewed the composition root, modules, domain models, HTTP contracts, persistence schemas/repositories, migration history, architecture contracts, representative tests, CI configuration, ZKTeco bridge documentation, and Flutter feature/release documentation. Existing code takes precedence over older phase documentation. “Implemented” below means a real source implementation is present; it is not a new live-production or load-test certification.

Source-tree inventory at review time:

- 20 business modules and 262 TypeScript files under `gosystem/src`.
- 118 `*.test.ts` files under `gosystem/tests`.
- 80 SQL migration files; these contain 139 distinct historical `app` table definitions. The latter is not a claim about the current deployed table count because migrations can change or replace objects.
- A simple count of explicit HTTP method registrations in module route files gives 344 registrations. Some older mobile documentation says 335 operations; this is a documentation snapshot, not a current API count. Do not use either count as marketing proof.

## Overall assessment

The reference system is a substantial club-management platform with real transactional workflows, not a landing-page prototype. It supports membership operations, sales and collections, bookings, restaurant preparation, retail stock, coaching, employees, CRM, communications, reporting, access devices, and member self-service.

The underlying model is already organization-aware and branch-aware. It has useful foundations for SaaS: organization identifiers, scoped permissions, composite ownership constraints, audit records, idempotency, and background maintenance. **It does not yet provide the vendor-side SaaS product lifecycle**: tenant onboarding, annual software billing, plan entitlements, quotas, renewals, suspension, and a Narfid platform administration console. Club-member subscriptions and a club's annual subscription to Narfid must remain separate domains.

## Architecture

| Area | Implementation and implication | Evidence |
| --- | --- | --- |
| Runtime | Node.js 24, Express 5, TypeScript; one modular monolith API. | `gosystem/package.json`; `src/main.ts`; `src/bootstrap/create-app.ts` |
| Composition | Manual composition root wires application services through public module APIs. Commercial, Sales, Finance, Subscriptions, Bookings, and Restaurant have explicit ownership boundaries. | `src/bootstrap/composition-root.ts`; module `index.ts` files |
| Persistence | PostgreSQL through Drizzle ORM; Supabase provides Auth and private object storage. Business data is in private schema `app`. | `src/platform/database/client.ts`; `src/platform/database/schema.ts`; `supabase/migrations/20260809120822_foundation.sql` |
| Authentication | Supabase JWT issuer/audience/JWKS verification; internal active account is checked before loading grants. Staff password sign-in, member password sign-in, activation and OTP paths exist. | `src/platform/auth/supabase-token-verifier.ts`; `src/modules/identity-access/application/identity-access-service.ts` |
| Authorization | Effective permissions are loaded from the database, with organization or selected-branch scope. The code keeps each permission tied to its scope. | `src/modules/identity-access/application/authorization-context.ts`; `authorization-context-factory.ts` |
| Transactions | Application workflows use a shared transaction runner; audit and outbox facts are commonly committed with their source mutations. | `src/platform/database/transaction-runner.ts`; `src/platform/audit/audit-writer.ts`; `src/platform/eventing/*` |
| Maintenance | In-process maintenance dispatches outbox events, advances subscriptions, delivers messages, validates files, rebuilds reports, removes old rate-limit counters and queues expiry reminders. | `src/bootstrap/composition-root.ts`; `src/platform/maintenance/api-maintenance-scheduler.ts`; `docs/adr/032-single-api-process.md` |
| HTTP hardening | Helmet, explicit CORS origins, strict 1 MiB JSON limit, request context, structured logging and mapped public errors. | `src/bootstrap/create-app.ts`; `src/platform/http/*` |
| Historical data | Separate resumable legacy XLS import tool with private staging, mapping, dry runs, reconciliation and controlled domain promotion. It does not run inside the API. | `tools/legacy-import/`; `docs/architecture/phase-12.md`; `docs/runbooks/phase-12-legacy-migration.md` |

Business modules: `attendance`, `audit`, `backoffice`, `catalog`, `coaching`, `commercial`, `crm`, `facilities-bookings`, `files`, `finance`, `identity-access`, `members`, `notifications`, `organization`, `reporting`, `restaurant`, `sales`, `self-service`, `subscriptions`, and `workforce`.

## Capability matrix for truthful site content

### Members, memberships and access

| Capability | Status and actual behavior | Evidence |
| --- | --- | --- |
| Member directory | Implemented: registration, search/list/read/update, organization-scoped member numbering, registration branch, typed contacts, masked reads and restricted notes/contact permissions. Members need not have a login account. | `src/modules/members/application/member-service.ts`; `domain/member.ts`; `docs/architecture/phase-2.md` |
| Children and guardians | Implemented: external or member guardian, multiple dependents and explicit view/book/manage-membership rights; optional user-account links. | Member service; `src/modules/members/infrastructure/persistence/schema.ts`; self-service access checks |
| Disciplinary blocks | Implemented: member block/lift with reasons and history; access eligibility observes blocked status. | Member service; `supabase/migrations/20260825133000_member_block_history.sql`; attendance access service |
| Member login activation | Implemented: reception-issued short-lived activation code, member-number/phone verification and password setup; password reset actions exist. | `src/modules/identity-access/application/identity-access-service.ts` methods `issueMemberAccountActivation`, `activateMemberAccount`, `resetMemberPassword` |
| Packages and benefits | Implemented: activities/services, package publication, entitlements/visit allowances, price versions, branch price overrides, promotions, typed freeze/cancellation/renewal policies and captured contract snapshots. | `src/modules/catalog/`; `src/modules/commercial/`; `supabase/migrations/20260909150000_structured_package_contracts.sql` |
| Membership lifecycle | Implemented: pending-payment activation, scheduled/active/frozen/expired/cancelled states, renewal linked to the preceding subscription, scheduled freezes, resumption, cancellation settlement, adjustments and start-date changes. | `src/modules/subscriptions/application/subscription-service.ts`; `domain/subscription.ts`; `docs/architecture/phase-4.md` |
| Renewal integrity | Implemented: renewal preserves the previous commercial record; captured policy controls renewal, freeze and cancellation behavior. Lifecycle maintenance advances due states. | Subscription service/domain; freeze schedule and cancellation settlement migrations |
| Branch access policies | Implemented: single branch, selected branches or all organization branches. Selling branch, registration branch and access branch are distinct. | Subscription domain/service; `docs/architecture/phase-4.md` |
| Attendance and visits | Implemented: manual/device attempts, accepted/rejected reasons, credential lookup and atomic visit consumption. Eligibility is rechecked under transactional locking. | `src/modules/attendance/application/attendance-service.ts`; subscription `evaluateAccess` and `consumeAuthorizedVisit`; `tests/integration/database/attendance-subscription-visits.test.ts` |
| Barcodes | Implemented: Code 39 credentials, issuance, revocation and single/batch printable SVG output. | `src/modules/backoffice/application/backoffice-service.ts`; `domain/barcode.ts`; `docs/architecture/backend-legacy-parity.md` |

### Sales, financial operations and reporting

| Capability | Status and actual behavior | Evidence |
| --- | --- | --- |
| Point of sale | Implemented checkout with membership, service, booking, restaurant and retail lines; previews, invoice discounts/promotions and immutable commercial snapshots. | `src/modules/sales/application/sales-service.ts`; `domain/order.ts`; `tests/unit/sales/*` |
| Invoices and VAT math | Implemented SAR minor-unit totals, net/discount/tax/gross snapshots, tax-inclusive/exclusive pricing and invoice numbers. **VAT-ready calculations are not evidence of ZATCA integration.** | `src/modules/finance/domain/finance.ts`; sales/finance schemas; `docs/architecture/phase-5.md` |
| Payments and balances | Implemented: payment allocation, outstanding invoice balances, split payments and recorded cash/card/bank-transfer/gateway/wallet methods. Fulfillment occurs on settlement. | Finance `recordPayment`, `recordSplitPayment`; `presentation/http/schemas.ts`; Sales `markInvoicesPaid` |
| Refunds and corrections | Implemented: original-payment-linked refunds, approval/fulfillment of refund requests, subscription/booking/restaurant cancellation requests and administrative corrections. These are operational workflows, not automatic payment-provider refunds. | Finance service; `administrative-correction-service.ts`; `tests/integration/database/administrative-corrections.test.ts` |
| Cash operations | Implemented: branch cash points, exclusive open shifts, append-only cash movements, close reconciliation and shift ledger. | Finance service; Backoffice `getCashierShiftLedger`; `supabase/migrations/20260822220000_cashier_shift_financial_audit.sql` |
| Expenses and other income | Implemented expense categories, submission/approval/payment/void workflow and typed other income. Expense creator cannot approve the same expense in the recorded workflow. | Finance service; Backoffice other-income methods; `docs/architecture/phase-5.md`; backend parity contract |
| Dashboard | Implemented: summary, attendance heatmap, member debts, subscription statuses, revenue/service activity and freeze trend. | `src/modules/backoffice/application/backoffice-service.ts` dashboard/report methods |
| Standard reports | Implemented daily branch metrics, snapshots, package performance and detailed reports for members, subscriptions, packages, promotions, services, attendance, bookings, debts, expenses, POS, restaurant revenue, treasury and payment-method revenue. | `src/modules/reporting/domain/reporting-repository.ts` `DETAILED_REPORT_TYPES`; reporting service |
| Reporting freshness | Projections include `asOf`; event-driven refresh and resumable rebuilds exist. Avoid an unconditional claim that every analytical number is instantaneous. | `docs/architecture/phase-11.md`; Reporting repository/service |
| External payment processing | Not evidenced: no Moyasar/Tap/HyperPay/PayTabs/Stripe adapter or provider webhook checkout lifecycle found in reviewed backend source. A `GATEWAY` payment label records a method and external reference. | Finance schemas/domain; composition root; integration search across source/migrations |
| ZATCA / Fatoora | Not implemented in reviewed source: Phase 5 explicitly excludes QR, clearance and reporting integration. Do not claim Saudi e-invoicing certification/compliance on the landing page. | `docs/architecture/phase-5.md`; invoice table comment in `20260809172634_phase_5_sales_finance_cash.sql` |

### Kitchen and stock: an important scope distinction

| Capability | Status and actual behavior | Evidence |
| --- | --- | --- |
| Meal catalog | Implemented: meal/product/drink categories, editable meals, portion classes, nutrition values and allergens. | `src/modules/restaurant/domain/catalog.ts`; restaurant create/update/archive methods |
| Branch meal pricing | Implemented: effective-dated branch prices, tax treatment and daily special prices. | Restaurant service/repository and `MealPrice` domain |
| Daily preparation | Implemented: draft/publish/close daily menus, prepared quantity and derived reserved/sold/remaining quantities; menu reductions cannot fall below quantities already allocated. | Restaurant `reviseDailyMenu`, `quoteMeal`; repository `listDailyMenuAvailability` and capacity locking |
| Kitchen queue | Implemented: pending, confirmed, preparing, ready, completed and cancelled lifecycle; preparation and management permissions are separate. | `src/modules/restaurant/domain/restaurant-order.ts`; service `transitionOrder`, `cancelOrder` |
| Meal subscriptions | Implemented: meal-plan entitlement reservation, consumption and release, including portion-class checks. | Restaurant `createMealPlanRedemption`; Subscription entitlement methods |
| Retail inventory | Implemented per branch: categories/products, prices, stock on hand, reorder level, receipts, adjustments, sales, returns, reserved stock and sale fulfillment. | Backoffice retail methods; `supabase/migrations/20260817123000_retail_inventory_and_sales.sql` |
| Ingredient procurement / recipes | Not evidenced: no complete supplier/purchase-order/ingredient-recipe/BOM/food-cost workflow found. Retail inventory must not be presented as a complete restaurant ingredient ERP. | Restaurant and Backoffice domains/repositories; Phase 8 deferred-scope statement |

The old Phase 8 document says quantity stock is deferred. Current source has added daily meal preparation quantities, so that particular statement is stale. The safe marketing wording is **“إدارة المطبخ والوجبات، والمخزون والمبيعات”**, supported by a description of daily menus and retail stock. Avoid implying automatic ingredient depletion, procurement or detailed food costing.

### Bookings, coaching and workforce

| Capability | Status and actual behavior | Evidence |
| --- | --- | --- |
| Facilities and resources | Implemented: branch facilities, saleable bookable resources, weekly availability, blackout periods and session slots. | `src/modules/facilities-bookings/application/booking-service.ts`; `domain/facility.ts` |
| Booking types | Current source supports courts, classes, personal training and individual appointments. Some older Phase 7 text mentions only the first three. | `domain/reservation.ts`; `20260908223000_booking_appointments_participants.sql` |
| Customer and capacity | Implemented member and guest bookings, participant counts, pending payment and paid confirmation, cancellation/outcome tracking. | Reservation domain; `20260909120000_allow_paid_guest_bookings.sql`; Booking service |
| Conflict prevention | Implemented database court/slot exclusion constraints and capacity checks; cancellation releases capacity transactionally. | `docs/architecture/phase-7.md`; booking repository; domain/API tests |
| Trainers | Implemented specialties, profiles, effective branch/member assignments, weekly availability and trainer availability checks before personal-training slots. | `src/modules/coaching/application/coaching-service.ts`; `docs/architecture/phase-9.md` |
| Measurements | Implemented configurable types, units and bounds; append-only member measurement sessions preserve type snapshots. | Coaching service/domain and persistence schemas |
| Training plans | Implemented templates, assignments/customized exercises, plan lifecycle and completion/skipping of plan items. | Backoffice training methods; SelfService training methods; parity contract |
| Trainer commissions | Implemented effective percentage/fixed plans, accrual, approval/payment/void transitions. Older Phase 9 deferred statement is superseded by the parity extension. | Backoffice commission methods; `docs/architecture/backend-legacy-parity.md` |
| Employees and positions | Implemented employees, positions, branch assignments and account provisioning. Position permissions and employee login support exist. | `src/modules/workforce/application/workforce-service.ts`; `20260820120000_position_permissions_and_employee_login.sql` |
| Shifts and time clock | Implemented rosters with overlap prevention and alternating clock-in/out events. Device events can record employee attendance. | Backoffice shift/attendance methods; access-device service |
| Lockers | Implemented branch lockers, exclusive active assignments, release, maintenance and inactive states. | Backoffice locker methods; parity migration/contract |
| Payroll/HR suite | Not evidenced: do not promise payroll calculation, employment contracts, statutory payroll integrations or a full HR product from the workforce module. | Workforce/Backoffice public API inventory |

### Relationship management, communication, documents and portals

| Capability | Status and actual behavior | Evidence |
| --- | --- | --- |
| CRM | Implemented lead sources, leads, explicit sales-pipeline transitions, follow-ups, outcomes and member conversion references. | `src/modules/crm/application/crm-service.ts`; `domain/lead.ts` |
| Requests | Implemented public intake and idempotent online-request queues with approval/rejection/cancellation. | Backoffice online-request methods; `20260812143000_self_service_public_intake.sql` |
| Complaints and suggestions | Implemented cases, priorities, assignment/resolution, conversation replies and read state. | Backoffice feedback methods; `20260822190000_feedback_ticket_conversations.sql` |
| In-app communication | Implemented templates, audience preview/segments, scheduled campaigns, inbox/read counts, expiry reminders and self-service-order notifications. | `src/modules/notifications/application/communication-service.ts`; communication schemas/repository |
| Business SMS | Implemented Unifonic adapter, versioned templates, queued delivery attempts and bounded retry. Availability and message costs depend on provider configuration. | `notification-service.ts`; `infrastructure/providers/unifonic-business-sms-provider.ts` |
| WhatsApp | A separate Meta template-campaign delivery implementation exists when credentials are configured. The newer communication service is instantiated with `whatsappEnabled: false`. Do not promise general WhatsApp automation as an active default feature. | Composition root; `src/modules/backoffice/infrastructure/providers/meta-whatsapp-provider.ts`; parity contract |
| Files | Implemented private PDF/JPEG/PNG uploads up to 10 MiB, signed upload/download URLs, checksums, size/type checks and processing status. Downloads wait for validation. | Files application/persistence; `built-in-file-validator.ts`; `pdf-validation-worker.ts` |
| Audit | Implemented branch-scoped history, append-only database enforcement, and centralized redaction of sensitive fields/reasons. | `src/platform/audit/audit-writer.ts`; `src/modules/audit/`; foundation migration |
| Member/guardian portal | Implemented membership management, purchases, invoices, attendance, bookings, meals, files, measurements, plans and feedback under explicit self-access rights. | `src/modules/self-service/application/self-service.ts`; SelfService HTTP routes |
| Staff/trainer self-service | Implemented own profile, shifts/time clock, trainer schedule, assigned members, plans, measurements and commissions. | SelfService methods; workforce/coaching APIs |
| Email / background push | No general business email provider or deployed FCM/APNs/device-token backend was evidenced. In-app notifications and foreground mobile alerts must not be described as background push. | Composition root; Flutter README/store checklist |

## Hardware and mobile: existing first-client implementations, bespoke SaaS options

**ZKTeco access is implemented.** `src/modules/attendance/application/access-device-service.ts` registers devices, rotates hashed bridge credentials, accepts heartbeat/events, supplies eligibility sync plans and streams/listens for events. It supports observation and enforcement modes, maps numeric PINs to members/employees and records reasons for system acceptance/rejection. Event ingestion is idempotent and has a bounded historical/time-skew window.

`tools/zkteco-bridge/README-ar.md` describes a Windows service for the ACP-260 with durable offline event queue, rejected-event isolation and a field-tested reader-direction correction. Its enforcement behavior updates the validity of existing numeric controller users. It does **not** enroll or export biometric templates and does not remotely open a door. This is evidence of a specific controller integration, not universal compatibility with every access-control vendor.

The Flutter project in `gomobileapp` is a substantial Arabic RTL app branded for GO Fitness, with real API workflows and secure token storage. It includes member, guardian, staff and trainer views, camera barcode attendance, files, stock, bookings and kitchen operations. Its documentation reports API-level checks and local Android artifacts. The store checklist still requires signing/store setup, privacy/support/account-deletion links and real-device validation; no public-store availability was established by this audit. Background FCM/APNs push is explicitly deferred.

Landing-page framing should offer **a club-branded mobile application and assessed hardware/API integrations by agreement** in the fourth plan. Do not imply that a generic Narfid mobile app, App Store listing, universal gate integration or bundled third-party operating costs are already included in all tiers.

Evidence: `gomobileapp/README.md`; `gomobileapp/docs/feature-parity.md`; `gomobileapp/docs/store-release-checklist.md`; `gosystem/tools/zkteco-bridge/README-ar.md`.

## Organization, branches and security assessment

### Useful existing SaaS foundations

- The Organization/Branch model is explicit; business rows routinely carry `organization_id` and the appropriate `branch_id`.
- Composite foreign keys reject cross-organization role/branch/member/service links. Scopes are checked in application services and passed to repository list filters.
- Effective grants are database-loaded for each authenticated request, rather than trusting editable user metadata or stale permission lists copied into JWTs.
- The private `app` schema is not in local Supabase `api.schemas`; `public`, `anon` and `authenticated` are denied business schema/table access. A limited backend role performs business work. This architecture puts authorization in the Express layer; it is not equivalent to a complete per-tenant RLS isolation strategy.
- Financial workflows use minor-unit arithmetic, fingerprints/idempotency keys, ordered row locks and append-only historical facts. Booking/visit/stock concurrency constraints are present.
- Storage secrets remain in server adapters and clients receive short-lived signed URLs. Audits redact sensitive values.

Evidence: foundation migration; `supabase/config.toml`; authorization context/factory; organization/member/role schemas; Phase 4/5/7 contracts and relevant integration tests.

### Findings requiring care before general SaaS rollout

1. **MFA is currently disabled.** `20260816173000_disable_mfa.sql` explicitly clears `requires_mfa` and labels it reserved for a future phase. Current `EffectiveAuthorizationContext.assertCan` ignores the `requireAal2` option. Older phase documentation and calls passing that flag must not be used to claim current two-factor enforcement.
2. **New organization provisioning is missing from the public application flow.** Organization routes read an organization and manage its branches. There is no reviewed organization-create/onboarding lifecycle or vendor tenant console; seeds/bootstrap tools center on the first organization.
3. **Staff short login identifiers are globally looked up.** `provisionEmployeeAccount` rejects an existing employee identifier without an organization predicate; `findAccountByStaffLoginIdentifier` is global. A generated Auth email includes an organization fragment, but the short-identifier lookup still needs a deliberate SaaS identity strategy so multiple clubs can both use employee number `EMP000001`.
4. **Internal user identity is global.** Phone/Auth-user/email uniqueness can support a deliberate shared identity across organizations, but cross-club member/guardian/staff linking and recovery must be designed explicitly. Account activation currently rejects a phone already linked to another login account.
5. **No central paid-tenant gate is present.** Permissions express what a user can do; they do not express whether the organization has paid for a Narfid feature or whether its annual SaaS term is expired/suspended.
6. **Current file “CLEAN” means structural/integrity validation.** The composed validator checks signatures, lengths, checksums and PDF structure with bounded worker parsing; it is not a configured external antivirus service. Phase 10's old external-scanner requirement is stale.
7. **JWT verification does not itself revoke every active token immediately.** Current code checks the internal account's active status, which is useful. Strict per-session revocation requirements must be specified separately; a parsed `session_id` is not an active-session database lookup.
8. **Operational isolation still needs validation.** Organization constraints are a strong base, but this audit did not prove load isolation, per-tenant rate/usage quotas, restore-by-tenant, region residency or a contractual SLA. Device event subscriptions are process-local, which should be considered if the API is later scaled across multiple instances.

Relevant source: `authorization-context.ts`; disable-MFA migration; Organization routes/service; IdentityAccess service lines around staff provisioning/sign-in; `drizzle-identity-repository.ts`; `supabase-token-verifier.ts`; composition root; built-in validator and access-device service.

## SaaS conversion work to keep separate from the first landing page

| Needed domain or decision | Why it is separate from existing club functionality |
| --- | --- |
| Narfid tenant onboarding | Creates the organization, initial branches, owner identity, role defaults, settings and brand; the first-client seed is not onboarding. |
| Annual software contracts | Tracks plan, annual term, invoices, renewal date, cancellation and commercial status for the **club as customer**. Existing subscriptions sell the club's packages to its members. |
| Plan entitlements | Gates modules/API capabilities and limits independently of staff permissions; must be enforced server-side, not only hidden in navigation. |
| Branch/member/storage/message limits | Needs enforceable commercial quotas, counters and upgrade handling. Existing branch-aware data is not a plan-limit implementation. |
| Tenant payment lifecycle | Needs a chosen Saudi-capable payment provider, signed webhooks, idempotent reconciliation, failed-payment behavior and SaaS invoice issuance. |
| Suspensions and grace periods | Needs an explicit organization access policy for overdue terms, grace access, export/recovery and reactivation. Organization `ACTIVE/INACTIVE` alone does not model the subscription contract. |
| Platform team access | The later Narfid administration/email-password workspace needs its own vendor-side roles, authorizations and governance. Club staff accounts are not this internal portal. |
| Identity/branding configuration | Removes first-client-only strings, generated domains, OTP branding, numbering assumptions, storage names and default club context from reusable delivery paths. |
| Saudi compliance and provider costs | Determine tax/e-invoicing requirements, privacy/data policies, hosting commitments and who pays SMS, WhatsApp, devices and app-store fees before making contract claims. |
| SaaS operations | Define backups/restore, migration rollout, tenant offboarding/export, observability, incident support, isolation tests and resource limits. |

No subscription payments, tenant enforcement or vendor-admin authentication should be implied as live merely because the marketing site shows annual tiers. The landing page can collect a request for demonstration or plan consultation while these product domains are developed later.

## Feature grouping suitable for the proposed annual tiers

The following is an implementation-based feature grouping, not a researched Saudi price recommendation. Market/pricing research is documented separately.

| Tier intent | Defensible included feature group | Notes |
| --- | --- | --- |
| Core club operations | Members/guardians, packages and memberships, freeze/renewal/cancellation, attendance, basic cash/invoice operations, dashboard and permissions. | Keep membership lifecycle and financial collection coherent; avoid making a club buy a higher plan merely to collect member payments. |
| Operational expansion | Core plus kitchen/daily menus/meal subscriptions and retail products/branch stock/POS. | Say retail inventory and daily preparation accurately; third-party message charges should be explicit commercially. |
| Advanced club operation | Prior tier plus resource/class/personal-training/appointment booking, coaching/measurements/plans, CRM/follow-ups and consolidated multi-branch reporting. | Multi-branch administration is already implemented; SaaS branch quotas remain to be implemented. |
| Tailored technology partnership | Agreed application development, branded mobile app, assessed gate integrations, API integration and tailored rollout/support. | Scope and price by proposal; check hardware/app distribution/provider requirements. |

Suggested defensible product positioning: **“نرفد، الشريك التقني للمؤسسات الرياضية: إدارة مترابطة للأعضاء والاشتراكات والتشغيل، مع حلول تتوسع مع احتياج منشأتك.”** The fourth tier should emphasize ongoing technology partnership rather than only a higher feature count.

## Verification evidence in the repository

Tests cover domain invariants, branch isolation across phases, auth hook/password flows, request authorization caches, idempotency, quote/fulfillment behavior, freeze/cancellation logic, final-visit consumption, stock/booking behavior, administrative corrections, reporting and file validation. Examples:

- `tests/api/branch-isolation.test.ts`, `phase4-branch-isolation.test.ts` through the later phase suites, `crm-branch-isolation.test.ts`.
- `tests/unit/identity-access/authorization-context.test.ts`, `member-account-activation.test.ts`, `password-policy.test.ts`.
- `tests/integration/database/foundation.test.ts`, `attendance-subscription-visits.test.ts`, `access-device-branch-scope.test.ts`, `administrative-corrections.test.ts`, `counter-invoice-promotions.test.ts`.
- `tests/unit/restaurant/restaurant-service.test.ts`, `tests/unit/sales/retail-fulfillment.test.ts`, `tests/unit/bookings/booking-service.test.ts`.
- `tests/unit/files/built-in-file-validator.test.ts`, `tests/unit/audit/audit-redaction.test.ts`, architecture route/migration/dependency checks.

`package.json` provides `npm run check` covering typecheck, lint/dependency boundaries, Vitest, legacy-import tests and production build. `.github/workflows/ci.yml` additionally describes fresh/upgrade local Supabase database checks. **These are available checks, not a claim that they were run or passed in this audit.**

## Claims to exclude from the first website

- Narfid already has automated annual subscription checkout, instant self-service tenant provisioning or enforced SaaS tiers.
- ZATCA certification/integration or universal tax/legal compliance.
- An active general WhatsApp/SMS/push package with unlimited messages.
- Universal fingerprint/gate compatibility or biometric enrollment/storage.
- A publicly available generic Narfid app in both app stores.
- Complete ingredient purchasing/recipes/food-cost ERP, payroll or arbitrary report builder.
- Saudi data residency, audited certifications, uptime percentages, guaranteed support response times, unlimited users/branches or numerical business outcomes without independently established evidence.
- Customer counts, testimonial quotes or improvement metrics invented from the source repository.

Use GO Fitness only as the first-customer implementation reference when permitted by the owner; the user has expressly identified it as the first successful sale. Do not copy customer records or screenshots containing real member data into the marketing site.
