# Frontend and mobile platform audit

Audit date: 13 October 2026. Scope: read-only inspection of the existing GO implementation to inform Narfid / Nerved's first SaaS landing page. All implementation and documentation changes for the new website belong in `narfid`; no GO source was changed for this audit.

GO Fitness is the first customer and a club brand. It is not the name of the technology provider. The provider's proposed public identity is **نرفد / Nerved**, using the logos supplied in the new project's `public` directory.

## Method and confidence

The audit examined route files, specialized workspace components, workflow definitions, authorization code, API clients, generated endpoint contracts, user guide content, Flutter source, mobile parity documentation, and release readiness documentation. A dashboard screenshot was visually inspected to understand the existing information hierarchy.

This was a source and artifact audit, not a fresh authenticated production walkthrough. Existing documentation describes earlier live API checks, but those checks were not rerun. A screen, API contract, and frontend operation demonstrate implemented behavior; they do not independently prove production activation, service-level commitments, hardware compatibility, regulatory certification, or app store publication.

Evidence paths in this document are relative to `F:/saas/go/`.

Useful sources:

- `go/AGENTS.md`: project-specific Next.js rules.
- `go/package.json`: Next.js 16.3.0, React 19.2.8, Tailwind 4, Base UI, Lucide, shadcn-related dependencies; security and operational verification scripts.
- `go/components/app-shell.tsx`: real navigation groups, permissions, account audiences, notifications and gate event stream.
- `go/lib/sections.ts`: primary operational resources and API operation identifiers.
- `go/lib/workflows.ts`: user-facing creation flows, field requirements and API payloads.
- `go/lib/generated/endpoints.json`: 346 generated operations at the time of inspection, including technical operations that are not product features.
- `go/lib/system-guide-content.ts`: 15 task-based guide pages. Some integration limits are stale; see the reconciliation below.

## Product structure and intended users

The current implementation is an operational platform for sports institutions, with multiple activities, services, branches and audiences. It goes materially beyond a membership database.

| Audience | Implemented workspace and behavior | Evidence |
| --- | --- | --- |
| Owner / system administrator | Dashboard, branch context, commercial configuration, employee accounts and permissions, reports and audit | `go/components/app-shell.tsx`, `go/components/master-data-page.tsx`, `go/lib/permissions.ts` |
| Branch manager | Branch-scoped members, sales, bookings, restaurant, staff operations and reporting, depending on assigned grants | `go/components/app-context.tsx`, `go/lib/permissions.ts` |
| Reception / sales | Registration, member search, subscriptions, check-in, bookings, invoices and POS | `go/lib/sections.ts`, `go/lib/workflows.ts`, `go/components/resource-page.tsx` |
| Cashier / finance | Sales collection, split payment, cash shifts, invoices, refund requests, expenses, other income and commissions | `go/components/cashier-workstation.tsx`, `go/components/finance-workspace.tsx`, `go/components/cash-shift-audit.tsx` |
| Restaurant manager / chef | Meal catalog, prices, daily menu, meal-plan redemption and preparation queue | `go/components/restaurant-management-page.tsx` |
| Trainer | Assigned members, own schedule, training plans, measurements and commissions | `go/components/trainer-workspace.tsx`, `go/components/trainer-assignment-manager.tsx`, `go/components/trainer-configuration-manager.tsx` |
| Member / guardian | Membership, purchases, bookings, meals, invoices, attendance, training and support tickets, constrained by relationship capabilities | `go/components/member-portal.tsx`, `go/components/member-self-overview.tsx`, `go/components/self-service-content.tsx` |
| Employee | Personal employee record, shifts and attendance | `go/components/employee-self-panel.tsx`, `go/components/employee-profile-page.tsx` |

The platform accommodates ordinary gyms, sports academies, bookable courts, group classes, personal training and appointment services. Children / guardians and academy contract types are explicitly represented. Landing copy can therefore address **الأندية والأكاديميات والمراكز الرياضية** rather than limiting the proposition to a single gym type.

## Verified capability inventory

### 1. Branch management and authorization

- Institution and branch context is carried throughout the interface.
- Accessible branches are retrieved from the backend and filtered to the account's grants.
- Grants have an institution identifier, permission, and either institution-wide or selected-branch scope.
- Navigation, pages and actions are permission-sensitive. Manage permissions imply the corresponding read permissions through an explicit implication graph.
- Sensitive member data, contact access, account administration, financial corrections and approval actions have separate grants.
- Commercial setup, prices, retail stock, operational lists and reports can be branch-specific.

Evidence: `go/components/app-context.tsx`, `go/components/app-shell.tsx`, `go/lib/permissions.ts`, `go/components/master-data-page.tsx`.

Boundary: existing institution/branch scoping is useful groundwork for SaaS. It is not proof of an annual SaaS billing engine, automatic tenant provisioning or SaaS plan enforcement.

### 2. Members and unified member records

- Register and search members by name, membership identifiers, phone, identity reference and fingerprint PIN where applicable.
- A member record brings together profile, attendance and device access history, subscriptions, older imported subscription history, freezes, renewals, cancellations, blocks, bookings, financial records, purchases, restaurant orders and files.
- Member and identity photos / documents have upload validation and security scanning workflows.
- Member account activation, password reset and status controls are implemented.
- Imported legacy subscription history is explicitly historical reference; it does not grant access or create financial obligations.

Evidence: `go/lib/sections.ts`, `go/components/member-profile-page.tsx`, `go/components/member-legacy-subscription-history.tsx`, `go/lib/member-access-history.ts`, `go/app/join/page.tsx`, `go/lib/owner-file-upload.ts`.

### 3. Club membership plans and lifecycle

- Configure activities, service classifications, services, policies, packages, contracts, prices and promotions.
- Package publication and a price effective for the relevant branch / sale date are required before sale.
- Sale records capture commercial terms, policy and contract snapshots.
- A subscription sale creates an order and pending invoice; collection governs activation.
- Freeze immediately or schedule a future freeze; cancel a pending freeze schedule; resume early.
- Freeze limits include maximum days per freeze, maximum occurrences, minimum active days and an optional total freeze balance.
- Renewal creates a new order / invoice and a subsequent term.
- Cancellation supports an immediate or end-of-term outcome according to captured policy, with a server-authoritative preview and possible refund approval request.
- Authorized adjustments can add days / visits or change a not-yet-started term's start date.
- Subscription display includes dates, status, remaining days and relevant member context.

Evidence: `go/lib/workflows.ts`, `go/components/resource-page.tsx`, `go/components/member-self-overview.tsx`, `go/lib/subscription-term.ts`, `go/lib/subscription-freeze-policy.ts`, `go/components/master-data-page.tsx`, `go/lib/system-guide-content.ts`.

**Important naming distinction:** these are subscriptions sold by a club to its members. Nerved's annual subscriptions sold to institutions are a separate future commercial layer.

### 4. Attendance, membership eligibility and entry credentials

- Manual attendance and barcode-supported attendance are implemented.
- Check-in uses the selected membership, branch eligibility, subscription state / dates, blocks and visit allowance.
- Rejected attempts have reasons and remain reviewable.
- Credentials can be issued, printed, revoked and associated with a member or employee.
- The web UI has a device-management area, PIN assignment, event history and live SSE-based events.
- Device management includes registration, connectivity, operating mode, status and key rotation.

Evidence: `go/lib/sections.ts`, `go/components/resource-page.tsx`, `go/app/(dashboard)/access-control/page.tsx`, `go/app/(dashboard)/barcodes/page.tsx`, `go/components/app-shell.tsx`, `go/lib/access-event.ts`, `go/lib/gate-direction.ts`.

Integration reconciliation: the guide currently says fingerprint integration is future work. That statement is stale relative to the implemented access-control UI and generated contracts. The parallel backend audit verified an existing ZKTeco ACP-260 bridge with device heartbeat / event ingestion / eligibility sync, an offline queue and observation / enforcement modes. It synchronizes eligibility of existing numeric PINs; it does not create biometric templates or provide universal support for every gate. Hardware integration should be offered as an assessed implementation service under the fourth / custom plan.

Backend cross-check evidence: `gosystem/src/modules/attendance/application/access-device-service.ts`, `gosystem/tools/zkteco-bridge/README-ar.md`.

### 5. Bookings, capacity and facilities

- Configure facilities and resources, recurring availability and unavailable periods.
- Resource types explicitly include courts, group classes, personal training and individual service appointments.
- Courts are exclusive resources with operational capacity 1; participant count records the actual group size.
- Group classes support multiple seats and per-session capacity.
- Personal-training slots can be tied to a trainer, with trainer overlap checks.
- Members and visitors can receive invoiced bookings or explicitly free operational bookings.
- Invoiced bookings reserve capacity while pending collection and become confirmed after complete payment.
- Booking cancellation releases capacity and can create a refund request according to the saved policy.
- After the appointment begins, authorized staff can record completed or no-show outcomes.
- Members / authorized guardians can discover and request available appointments from their portal.

Evidence: `go/lib/workflows.ts`, `go/components/booking-availability.tsx`, `go/lib/booking-availability.ts`, `go/components/member-marketplace.tsx`, `go/components/resource-page.tsx`, `go/components/master-data-page.tsx`, `go/lib/system-guide-content.ts`.

### 6. Point of sale and finance

- POS handles services, restaurant items and retail products with a member or guest customer context.
- Pricing previews include tax, discounts, promotions and final totals in SAR.
- Single and split collections are implemented; cash, card and bank transfer records are supported.
- Cash collection is tied to an open cashier shift / cash point.
- Shift opening, closing, declared totals, movement statements and cash differences are represented.
- Financial workspace separates invoices, payments, refund requests, expenses, other income and trainer commissions.
- Refunds and expense approval / payment follow explicit states and permission checks.
- Financial administrative corrections preserve original records and require reasons; certain correction capabilities are reserved to the administrator.
- Invoices and associated adult / academy guardian contracts have dedicated print layouts.

Evidence: `go/components/cashier-workstation.tsx`, `go/components/finance-workspace.tsx`, `go/components/cash-shift-audit.tsx`, `go/components/invoice-details-page.tsx`, `go/components/administrative-correction-dialog.tsx`, `go/lib/branded-print.ts`.

Boundaries: labels for gateway and wallet payment records are not proof of active online payment processing. Printable contract signature lines are not evidence of an electronic-signature provider. No verified ZATCA activation should be claimed.

### 7. Restaurant, meals and kitchen

- Meal categories and meal / product / drink catalog.
- Portion classes, allergens and nutrition values: calories, protein, carbohydrates, fat, fiber, sugar and sodium.
- Branch meal pricing with effective dates and tax treatment.
- Daily menus with publication / closing, quantities and optional special prices.
- Member-facing daily meals and prices.
- Member meal-plan redemption, checking active plan / entitlements and matching portions / balance.
- Paid or redeemed restaurant orders progress through new, preparing, ready and completed states.
- Kitchen view updates periodically; institution-wide permissions can allow a cross-branch queue.
- Order cancellation and financial refund requests are connected.

Evidence: `go/components/restaurant-management-page.tsx`, `go/components/member-daily-menu.tsx`, `go/lib/generated/endpoints.json`, `go/lib/system-guide-content.ts`.

Boundary: the audited feature is meal availability / daily quantities plus retail inventory. No ingredient bill of materials, ingredient costing, purchasing or supplier procurement workflow was verified.

### 8. Retail products and stock

- Product categories, identifiers, barcodes, units, prices and branch stock.
- On-hand, reserved and available quantities.
- Receipt, customer return, positive adjustment and negative adjustment movements.
- Movement notes / supporting document fields and a reorder level.
- Sellable-products queries and checkout enforce available stock.

Evidence: `go/components/master-data-page.tsx` around the `retail-inventory` configuration, `go/components/cashier-workstation.tsx`, generated `listRetailInventory`, `adjustRetailStock` and `listSellableRetailProducts` operations.

Accurate landing label: **المتجر والمخزون**. Avoid broad ERP, supplier management or kitchen raw-material claims without a separate implementation.

### 9. Staff, trainers and operations

- Employee creation can link a login account, employment start date, initial branch, position and permissions.
- Positions, assignments, employee profiles, shifts and clock-in / clock-out events.
- Trainer profiles, specialties, branch assignments, weekly availability and member assignments.
- Trainer self workspace: overview, assigned members, schedule, training plans, measurements and commissions.
- Training plan items can be completed or skipped and outcomes are reflected in the workspace.
- Measurement types / sessions and historical measurement views.
- Operational lockers and assignment / release processes.
- Public online requests and member self-service purchase / booking requests have operational lists.

Evidence: `go/lib/workflows.ts`, `go/components/employee-profile-page.tsx`, `go/components/employee-self-panel.tsx`, `go/components/operations-workspace.tsx`, `go/components/trainer-workspace.tsx`, `go/components/trainer-configuration-manager.tsx`, `go/components/trainer-assignment-manager.tsx`, `go/components/master-data-page.tsx`.

Boundary: shift / attendance / commission handling is not evidence of a complete payroll system.

### 10. CRM, communication and service tickets

- Leads have sources, interest, ownership, notes and a multi-stage lifecycle from new through contacted / qualified / trial scheduled to converted / lost / disqualified.
- Follow-ups have an assignee, channel, scheduled time, result and completion / missed / cancellation state.
- CRM summaries include open leads, scheduled / overdue follow-ups and conversions.
- In-app communication campaigns support reusable templates, member audiences, expiry-based segments, institution / branch scope, recipient preview, immediate send or scheduling, and delivery / read counts.
- Lead audiences are represented, but actual sending to lead audiences is blocked in the present interface pending WhatsApp activation.
- Member / staff support tickets have threaded replies and explicit resolve / close / reopen behavior.

Evidence: `go/components/crm-workspace.tsx`, `go/components/communication-center.tsx`, `go/components/feedback-ticket-center.tsx`, `go/components/account-notification-inbox.tsx`.

Boundary: WhatsApp appears as disabled / coming soon in the actual communication UI. Do not promise active WhatsApp, SMS or email campaign delivery solely because channel labels or API contracts exist.

### 11. Reporting, owner visibility and audit

- Dashboard KPIs and charts retrieve backend data, rather than hardcoded marketing values.
- Current summaries include members, subscriptions, attendance, revenue and operational requests / feedback.
- Revenue charts support rolling periods; subscription status and service activity have dedicated summaries.
- Reporting workspace offers overview, members, subscriptions, expiry, packages, promotions, services, POS, restaurant revenue, attendance, gate access, bookings, debts, expenses, treasury, revenue by payment method and net treasury.
- Reports filter periods and branches, show drill-down records and export CSV / print layouts.
- Subscription expiry views explicitly support urgency windows.
- Activity / audit logs retain executor, time, event and related record context.
- Rebuild requests and as-of metadata exist for reporting projections.

Evidence: `go/app/(dashboard)/page.tsx`, `go/components/dashboard-analytics.tsx`, `go/components/reports-workspace.tsx`, `go/components/target-subscriptions-report.tsx`, `go/components/system-audit-log.tsx`.

Strong supported promise: **صورة واضحة عن أداء مؤسستك وفروعك، من الاشتراك إلى التحصيل والتشغيل.** Do not fabricate improvement percentages or customer adoption statistics.

### 12. Member and guardian experience

- Distinct self-service pages for home, discover / book, daily meals, membership, orders / invoices, activity and tickets.
- Members choose a fulfillment branch for branch-specific prices, appointments and meals.
- Guardians select the child / linked member and operate according to explicit view, booking and membership capabilities.
- Membership actions, purchasing / booking, order status, invoice / contract printing and training activity are visible in member context.
- Member activation is for an already registered member; the `/join` page should not be described as general new-lead enrollment.

Evidence: `go/components/member-portal.tsx`, `go/components/member-self-overview.tsx`, `go/components/member-marketplace.tsx`, `go/components/member-daily-menu.tsx`, `go/components/self-service-content.tsx`, `go/app/join/page.tsx`.

## Technical and localization signals

- Arabic RTL is pervasive, including operational forms and mobile layouts.
- SAR values and Saudi phone patterns are explicitly represented.
- Riyadh timezone is used for important report / menu / scheduling calculations.
- Web sign-in distinguishes staff from member / guardian audiences; staff use email or employee identifier, members use their member account credentials.
- Web requests go through a Next.js backend-for-frontend. Tokens are held in HttpOnly cookies, requests carry correlation identifiers and financial POST actions have idempotency keys.
- Session refresh is deduplicated and coordinated across browser tabs.
- File handling supports owner-bound validation and signed upload / download flows.
- Routes and actions use institution / branch authorization and member relationship capabilities.

Evidence: `go/lib/api-client.ts`, `go/lib/server-session.ts`, `go/lib/request-security.ts`, `go/app/api/backend/[...path]/route.ts`, `go/app/api/session/refresh/route.ts`, `go/components/app-context.tsx`, `go/lib/owner-file-upload.ts`.

These are legitimate implementation observations, not a third-party security certification. In particular, the backend audit identified MFA as reserved / disabled in the current implementation; do not advertise active multi-factor enforcement.

## Mobile inspection

There are two materially different Flutter directories:

1. `gomobile/gomobile/lib/main.dart` is the default Flutter counter demo. It is not the operational mobile product.
2. `gomobileapp/lib/main.dart` is the actual GO mobile implementation. It includes API client / token handling, audience-aware login, dashboard, members, operational resources, POS, finance, communications, settings, trainers, access control, reports, member / guardian portal and mobile workflows.

Actual mobile capabilities verified in source and companion documentation:

- Backend-connected operations and automatic session refresh.
- Secure token storage through `flutter_secure_storage`.
- Institution / branch selection and permission-sensitive navigation.
- Camera barcode scanning for attendance.
- Native file selection and SHA-256 signed upload flow.
- Mobile bookings, member self-service, membership lifecycle, meal orders and training workflows.
- In-app notification inbox and local notifications while the application is running.
- Dark mode, RTL and refresh behavior.

Evidence: `gomobileapp/lib/main.dart`, `gomobileapp/pubspec.yaml`, `gomobileapp/README.md`, `gomobileapp/docs/feature-parity.md`, `gomobileapp/test/widget_test.dart`.

Release boundaries: `gomobileapp/docs/store-release-checklist.md` states that signing, store assets / policy links, device testing, and iOS build / team setup remain required. Background push needs FCM / APNs configuration and a device-token registration endpoint. The repository does not demonstrate a publicly published Android / iOS app. A branded customer mobile app is appropriately positioned as a scoped custom project in the fourth plan.

The parity document records earlier live API checks and earlier operation counts; the currently inspected generated web catalog contains 346 operations. The document also explicitly distinguishes UI / API tests from real-device testing. This audit does not claim those older test results were rerun.

## Available visual artifacts

- `go/public/go-fitness-logo.png`: first customer's logo; not the Nerved provider logo.
- `go/public/guide/screenshots/`: 70 existing PNG captures spanning login, dashboard, member / subscription workflows, cashier / finance, bookings, kitchen, CRM, trainer, reports, settings, member portal and key dialogs.
- `go/public/guide/GO-Fitness-Complete-User-Guide-ar.pdf`: existing comprehensive Arabic usage guide.
- `go/artifacts/`: earlier permission and financial correction captures / QA logs.

The inspected `02-dashboard.png` confirms the source interface's Arabic RTL structure: right sidebar, branch selector, search, KPI row and finance / operational views. It includes first-customer identity and actual-looking operational totals. Other captures may include member identities and financial records. Do not copy them into a public marketing page wholesale. Prefer a newly authored code-native preview with clearly illustrative, anonymous data and provider branding, or deliberately approved / sanitized product captures.

## SaaS landing content recommendations

Supported provider positioning:

> نرفد، شريكك التقني لإدارة المؤسسات الرياضية.

> من الأعضاء والاشتراكات إلى الحجوزات والمطبخ والمخزون، اجمع تشغيل مؤسستك في منصة واحدة.

Supported content groups:

- **إدارة الأعضاء والاشتراكات:** files, packages, lifecycle and attendance.
- **تشغيل مترابط:** POS, collection, kitchen, retail stock and facilities.
- **رؤية للإدارة:** reports, expiry follow-up, branch visibility and audit.
- **تجربة للعضو والفريق:** member / guardian portal and trainer / employee workspaces.
- **تقنية تناسب احتياجك:** assessed mobile apps, hardware integration and custom development.

A coherent proposed tier architecture is: core memberships / attendance / basic selling; expanded restaurant / retail operations; comprehensive booking / coaching / branch operations; custom technical partnership. This is a packaging recommendation based on verified modules, not an existing implementation of entitlements. Annual prices, included branch counts, implementation scope and support commitments require commercial decisions. Competitor market research belongs in the separate pricing research document.

Fourth-plan wording should convey scoped delivery: **تطبيقات بهوية مؤسستك، تكامل أجهزة الدخول والأنظمة الأخرى، وتطوير يناسب عملياتك — وفق دراسة الاحتياج وعرض مستقل.**

The first customer can be described factually as **GO Fitness — أول عميل للمنصة**. Do not invent a quote, satisfaction rating, revenue effect, number of customers or elapsed operational history.

## Explicit landing-page boundaries

Until independently implemented / verified, avoid claims of:

- Instant SaaS self-signup, automatic tenant creation or activated annual payment / tier enforcement.
- ZATCA integration, certification or compliant electronic invoicing.
- Live online payment gateway processing.
- Active WhatsApp / SMS / email delivery merely from available channel labels.
- Universal biometric / gate compatibility.
- Background mobile push, app store availability or ready-made customer-branded mobile apps.
- Electronic contract signatures, payroll, accounting ERP, ingredient procurement / costing or supplier management.
- Guaranteed migration time, hosting location, availability / SLA, 24/7 support or measured business outcomes.

The authorized first deliverable is a professional marketing landing page in `narfid`. Administration login for the technology provider, annual SaaS billing, onboarding, entitlements and technical integrations are later phases. Present a working, honest demo / inquiry flow rather than manufacturing an activated checkout or administration portal.
