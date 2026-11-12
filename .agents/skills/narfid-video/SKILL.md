---
name: narfid-video
description: "Create, revise and export professional narfid videos with the Remotion plugin, realistic fictional captures of the reference system in an isolated local database, and verified MP4 delivery. Use for narfid video requests; ordinary website edits and still-image requests do not activate this workflow."
---

# NARFID video production

Deliver a finished MP4, its absolute local link, and editable Remotion source. A request to create a video authorizes export by default. The owner's standing instruction overrides Remotion guidance that otherwise stops at a preview. Respect an explicit request for preview-only work.

The owner moved video work to the local computer on 13 November 2026. Produce, edit and deliver files locally; do not upload videos to the narfid website or board. The board video section and its upload/status workflow have been removed. External social publication remains a separate task requiring the owner's request.

## Route and establish the production

1. Use the installed **Remotion plugin**. Load `remotion:remotion-best-practices` and its relevant create, markup, interactivity, studio and render skills. Discover current installed paths; do not pin a plugin cache version here. Repository `.agents/skills/remotion-*` skills are a fallback if the plugin is unavailable; explain that fallback briefly and continue where possible.
2. Read `../narfid/SKILL.md` for claims and Arabic voice. Use original NARFID assets and current `lib/brand.ts` tokens; read the UI-system skill if present. Do not substitute Go Fitness customer identity for the narfid brand.
3. Inspect the project, user changes and assets. The owner named the **first `narfid-intro` film as the preferred creative reference** on 11 November 2026. Review its original composition and storyboard in `narfid-intro-video` before choosing a treatment: `NarfidIntroOriginal`, `src/Composition.tsx`, `src/style.css` and `STORYBOARD-ORIGINAL.md`. `NarfidIntro` currently opens a later director cut; distinguish the two rather than assuming the current default is the first version. Reference system: **`F:/newproject/go front-back`**, with `go` web, `gosystem` backend and **`gomobileapp`** current Flutter app (`gomobile` is older).
4. Infer a brief from the request and brand context. Default to Arabic RTL for Saudi club decision-makers, 1920×1080 / 30 fps and roughly 45–60 seconds when unspecified. Adapt aspect ratio, pacing and duration to the destination. Ask only for missing choices that materially affect the result while progressing independent work.
5. For an `NV-001`–`NV-050` campaign video, load [local-production.md](references/local-production.md). Read its full brief from `lib/marketing/video-briefs.ts` or the local `brief` command. Earlier intro/members-app films remain outside the fifty ideas. Campaign format is 1080×1920 / 30 fps, 25–45 seconds; use the brief's intended duration. Keep production notes and delivery files locally.

## Capture the system safely

Read [local-capture.md](references/local-capture.md) **before starting reference services, logging in, seeding or collecting screenshots**. Production Supabase is off limits: no queries, logins, reads, dumps, migrations, CLI links, deployments or remote data imports. The supplied credentials are not an exception.

- Preferred capture: actual web/backend services connected to a disposable **local database**, seeded with coherent fictional Arabic business data. Existing PGlite test helpers or isolated local Supabase can provide it. Do not represent mocked responses as database-backed captures.
- Optional credentials are in `F:/saas/narfid/.private/video-reference-accounts.json`, never in this skill or tracked files. Read without echoing. Use only for a locally created test account after isolation is verified. Locally generated test sessions may not need them.
- Preserve reference repositories and production configuration. Adapters, accounts, seeds and identity changes belong in the isolated workspace or browser. Use browser-only NARFID styling and fictional customer details.
- Record screenshot source, local mode, seed scenario, date and limitations. Reuse useful captures; recapture stale screens or missing workflows. Keep real customers, personal details, payment records, credentials and secret-bearing logs out of shots and outputs.

## Direct the film

Define the video's goal in one sentence before storyboarding. For a short product demo, establish a concrete situation in the opening, show the action that addresses it, and end on a visible result or a decision the viewer can use. Link each scene to a message, visual action and verified capability.

- **Follow the first intro's product-led direction.** Build around the sports-management system: purposeful product close-ups, connected club workflows, clear Arabic typography and depth. Adapt the treatment to each topic and delivery format; the later NV-001 card treatment is not the owner's preferred benchmark. Reference footage remains subject to the capture and provenance rules above.
- **Choose the visual mood for each film.** Light, dark and mixed backgrounds are available. Select colors, lighting and product-screen treatment to suit the idea and maintain readable contrast and Narfid identity.
- **Identify the category in every video.** Show a readable on-screen descriptor such as **«نرفد — نظام لإدارة الأندية والمنشآت الرياضية»** in the opening and closing. Keep the body grounded in recognizable sports-management workflows, such as memberships, class/court bookings, collection or branches, using verified system views when useful. The logo or a generic shift/administration scenario alone is insufficient to identify the product. Preserve the practical value of educational content while making its sports-institution context explicit.
- Use visual progression: kinetic Arabic phrases, purposeful close-ups, workflow connections, depth, changes in scale or light, and a clear final invitation. Avoid one repeated screenshot-and-text layout. Motion must clarify the message and leave time to read.
- For short product demos, use **«رحلة داخل النظام»** by default. Follow its description in [Video styles](#video-styles) and adapt the workflow to the brief.
- Showcase actual behavior and coherent local screenshots. Illustrative mobile cards can complement them; document their provenance instead of claiming they are app captures. Never invent features, customer results, live counts, integrations or testimonials.
- Use **Tajawal (تجول)** for video text. Bundle the required weights locally; the existing Remotion project defines them in `narfid-intro-video/src/fonts.css`. Keep Arabic words joined and set RTL direction. Use generous safe areas, readable type and deliberate contrast. Animate with frame-based Remotion APIs; keep scenes and meaningful cues separately authored/editable.
- Open Studio as soon as the project can run, before editing the composition. Keep it running for steering. Review transitions as motion, not only isolated stills.

## Video styles

### رحلة داخل النظام

Use this name when the owner asks for **«رحلة داخل النظام»** or **Journey Inside the System**. The owner approved the [reservation handoff direction](../../../narfid-intro-video/NV001.md#reservation-handoff-direction-test) as its creative reference. The finished `NarfidReservationFilm` composition builds on that reference.

- **Goal and story:** Start with one practical question from a sports club or facility, follow a specific action in the system, and finish with the result and a useful decision.
- **Picture and motion:** Use product screens, short readable Arabic text and deliberate camera movement. Keep the relevant field, record or status visually connected as the framing moves through the workflow.
- **Context:** Identify narfid as a system for managing clubs and sports facilities, and use fictional data in system views.

### هوية نرفد المتحركة

Use **«هوية نرفد المتحركة»** when the owner requests the identity-film direction. The owner liked the `BrandMotionStudy` sample on 11 November 2026. Use its editable composition in `narfid-intro-video/src/DirectionStudies.tsx` as a reference, and develop the message around the requested subject.

- Introduce a focused brand or product message through animated Arabic typography and brand elements, with clear visual progression and readable pacing.
- Use Narfid identity and an ending suited to the film.

### حكاية من النادي

Use **«حكاية من النادي»** when the owner requests the use-story direction. The owner liked the `ClubMomentStudy` sample on 11 November 2026. Use its editable composition in `narfid-intro-video/src/DirectionStudies.tsx` as a reference.

- Begin with a specific situation involving club staff or a member. Show how the relevant Narfid workflow leads to a result the viewer can act on.
- Use appropriate Saudi-audience imagery and disclose generated or illustrative scenes in provenance. Do not represent fictional people as customers. The sample combines an AI-generated still with an animated camera move and the fictional reservation sequence.

Add other named styles under this section as the owner approves them. Apply the shared brand, Tajawal typography, capture and delivery requirements to each style.

## Unified closing

Keep the visual end card consistent across narfid videos, using the Arabic logo and sports-management descriptor.

## Export and finish

1. Run video lint/type checks and bundle/build. Review complete Studio playback and representative scenes at delivery size against the directing requirements above, including Tajawal typography, readable contrast and a readable sports-management descriptor. Fix missing assets/fonts, RTL errors, clipping, timeline overlaps, bad transitions and audio problems. Keep standalone video dependencies excluded from website checks where needed.
2. Load the Remotion render skill. Export the **requested cut** as H.264 MP4 with AAC stereo audio when audio is present, 1080p / 30 fps by default. From the existing video folder:

   ```powershell
   npx remotion render NarfidIntro out/narfid-intro.mp4 --codec=h264 --crf=18 --concurrency=2
   ```

   Confirm current CLI flags when changing settings. Follow the render to completion and resolve failures rather than returning only a preview. Preserve the prior final export when the new cut is a separate deliverable.

3. Verify the file: nonzero size, intended duration/dimensions/fps, video/audio streams, full decode, extracted-frame review and listening where available. Bundled Windows FFmpeg: `node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe`. Its null output needs explicit encoders, e.g. `-c:v libx264 -preset ultrafast -c:a pcm_s16le -f null NUL`. A missing default null encoder is a verification-command issue, not proof of corruption.
4. For a campaign video, retain its ID, export path and verification report locally. The optional `verify` command in [local-production.md](references/local-production.md) makes no network requests. Do not sign into the board, upload the MP4 or update production/publication records there.
5. Deliver an absolute local MP4 link, duration/resolution/size and editable project location. A Studio link is supplemental. Exclude exports, caches, QA files and private capture work from Git; commit/push editable source and relevant documentation per `AGENTS.md`. Finish when the requested local MP4 passes verification, or report the concrete blocker and remaining work. Publish directly to the requested social platform only as a separately authorized task.
