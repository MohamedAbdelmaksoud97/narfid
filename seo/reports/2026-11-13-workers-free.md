# Workers Free follow-up — 2026-11-13

The owner requires Free and accepts a short automatic-build delay after article
publication. Public pages now use packaged HTML/Flight snapshots; responsive
article images are generated during build. Publishing queues a production deploy
hook, with a build-only retry. Unpublishing retains the immediate live slug/RLS
gate. Board routes stay private, dynamic and noindex. No article content, billing,
DNS, Google setting or contact event was changed for verification.

Live checks after automatic source deployment `fc7c18b`:

- 58/58 articles and 76/76 public URLs returned 200, with body HTML, one H1,
  matching title/description, canonical and indexable metadata. Article JSON-LD
  matches publication titles and dates; all publications are in the sitemap.
- 310/310 image URLs (including responsive variants) returned valid, decodable
  images; 77 internal targets and 293 fragment links passed. Archive pages share
  their existing generic description; `?page=1` canonicalizes to `/articles`.
- 304/304 repeated public requests returned 200. Sampled runtime events had no
  errors; occasional CPU measurements exceed 10 ms, so this is observed recovery,
  not a guaranteed maximum or unlimited Free capacity.
- Desktop/mobile layout, pagination/navigation, 13 authenticated board routes,
  three anonymous draft 404s, cache-file blocking and editor rebuild-retry UI
  passed. Rebuild endpoint rejects anonymous/foreign-origin requests. Both the
  source-push build and the authenticated deploy-hook build succeeded.

Local lint, TypeScript, Next/Workers production builds, 11 article checks and five
domain SEO checks pass. The Workers build verifies 58 articles/75 canonical pages
and prepares 290 variants. Detailed public evidence is in the companion JSON;
credentials and raw logs remain ignored. Google indexing/ranking changes were
not established by these technical checks. Existing GA4 timeout investigation
remains a separate backlog item.

Final refinement: resolve the production archive URL before vinext's rewrite
cache-key namespacing. Direct prebuilt archive controls were HIT while the public
rewrite still rendered dynamically. This forwarding preserves URL/canonical and
RSC/cookie headers; the source-level routing check and rebuilt package pass.
