# Rendering within Workers Free

The owner requires the Cloudflare Free plan. No billing or subscription change is
authorized or made. Keep the existing authentication, article publication workflow,
SEO metadata and user interface.

## Evidence on 2026-11-13

The original live invocation logs show `exceededCpu` at 10 CPU ms. A sequential
24-request reproduction across contact, archive page 2 and the employee-offboarding
article failed 9 times. An active 63-sample production CPU profile identified React
HTML rendering in `ssr/index.js` as the main inclusive stack. Minified frames limit
function-level attribution; profile totals are not per-request measurements.

## Changes

- vinext prerenders routes that prove static and packages HTML/Flight artifacts
  with its existing Static Assets adapter. No external cache resource is added.
  Five live marketing routes returned cache HIT: about, contact, pricing,
  technology partnership and visual identity. The unavailable/404 outputs are also
  static. The article lists, articles, solutions, author and authenticated routes
  remain dynamic: database updates and publication checks still happen at request
  time. Do not force these routes static without designing invalidation first.
- The article validator reuses its immutable schema while validating every input.
  The renderer compiles Tiptap extension mappings/schema once, reusing only those
  definitions. Document nodes, React elements, heading counters and overrides stay
  local to a render. This is not a content or permission cache.
- Publication date formatters are reused, retaining existing locale, date style
  and the homepage's explicit Riyadh timezone.

## Verification and limits

Lint, TypeScript, Next production build, Workers production build and the 11
article tests pass. All 58 current public articles produce byte-identical body HTML
against the previous renderer. A five-pass local Node comparison shows a clear
reduction in render wall time; it is not a Workers CPU benchmark. Desktop/mobile
checks cover contact, archive pagination and the affected article without overflow
or browser errors.

Manual deployment `4cf90a84-850c-4628-9e42-e5383d98a0d6` returned 200 for all 76
public pages, then 24/24 repeated reproduction requests. All 13 inspected board
routes returned 200 with private/no-store and noindex; anonymous board access
redirected to login, and an unknown article returned 404. No test records were
published and no contact events were sent.

Some successful post-deployment invocations still report CPU above 10 ms. HTTP
success in one warm sample therefore does not prove a strict 10 ms worst case.
Verify the automatic deployment, repeated cold and warm requests and subsequent
invocation outcomes before declaring the Free-plan issue resolved. Account
subscription reads before and after deployment returned no subscriptions.

Operational assets and profiles stay in ignored `.private/free-worker-*` files.
The static cache index contains public prerender outputs only. New public dynamic
content must not be placed in that read-only cache without an update policy.
