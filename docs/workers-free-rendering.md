# Rendering within Workers Free

The owner requires Cloudflare Free and accepts a few minutes between publication
and the refreshed public site. No subscription or billing setting was changed.

## Diagnosis, 2026-11-13

Original invocation logs show `exceededCpu` at 10 CPU ms. A sequential 24-request
reproduction across contact, archive page 2 and the offboarding article failed
nine times. A production CPU profile identified React SSR as the dominant stack.
Reusing immutable Tiptap definitions and date formatters helped, but a later
automatic deployment still failed 26 of 304 requests. That first optimization
alone was insufficient.

## Public build and publishing

- Vite prerenders current public publication snapshots, archive pages, solutions,
  author and marketing pages. vinext's Static Assets adapter packages HTML and
  Flight artifacts. The build-only `NARFID_PRERENDER_PUBLIC` flag is never a Worker
  binding. Production prerenders retain the official canonical host and indexing
  policy; preview builds remain noindex.
- `/articles?page=n` is internally rewritten to a prerenderable page parameter.
  Existing public URLs, pagination links and canonical URLs remain the same.
- Publishing commits through the existing validated RPC, then queues a production
  deploy hook. The editor reports queued/failed status and can retry only the
  build. A build failure leaves the previous deployment serving. Check Workers
  Builds if an update has not appeared; queued does not mean completed.
- Unpublishing is immediate: every article HTML/Flight request still resolves its
  slug against the live database before serving its cached body. Unknown and
  unpublished slugs return 404/noindex; renamed slugs retain 308 redirects. Lists
  may retain a removed card until the build, but its article cannot be opened.
- Responsive WebP variants are prepared with Sharp at build time from public
  images only. The media route still performs the private storage RLS read before
  serving a prebuilt variant. Draft/new image previews use their original raster
  until the next build on Workers. Node deployments keep their existing resizer.
- Generated `/_vinext/` assets cannot be fetched directly over HTTP, including
  encoded paths. They are read only through the internal ASSETS binding after
  routing or media permission checks. Board/API routes are not prerendered.

`scripts/verify-public-prerender.mjs` fails the build if a current article or
required public route lacks packaged HTML, body, one H1, metadata, canonical,
Article schema or the expected indexing policy. It rejects private routes in the
rendered manifest. Image generation must succeed before deployment.

## Verification

The Workers build checks 58 publications and 75 public canonical pages and
prepares 290 responsive variants from 58 published image sources. The existing
11 article and five domain SEO checks pass. All 58 article body outputs match the
previous renderer byte for byte. Lint, type checking and production build checks
are recorded with final live verification in the dated SEO report. Profiles,
credentials and detailed QA output stay in ignored `.private/`.

Live checks cover every publication, metadata/schema, sitemap, robots, images and
internal links, plus repeated requests, desktop/mobile navigation and privacy.
Manual deployment success alone does not establish a strict CPU bound: repeat
public checks after Workers Builds deployment.

This removes expensive public SSR and per-request image resizing. Authenticated
APIs, the live publication gate, storage access and Free account request/build
quotas still apply. Google indexing and rankings are separate from technical
eligibility.
