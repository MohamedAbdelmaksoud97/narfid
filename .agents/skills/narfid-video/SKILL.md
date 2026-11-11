---
name: narfid-video
description: "Create, revise and export professional narfid videos with the Remotion plugin, realistic fictional captures of the reference system in an isolated local database, and verified MP4 delivery. Use for narfid video requests; ordinary website edits and still-image requests do not activate this workflow."
---

# NARFID video production

Deliver a finished MP4, its absolute local link, and editable Remotion source. A request to create a video authorizes export by default. The owner's standing instruction overrides Remotion guidance that otherwise stops at a preview. Respect an explicit request for preview-only work.

## Route and establish the production

1. Use the installed **Remotion plugin**. Load `remotion:remotion-best-practices` and its relevant create, markup, interactivity, studio and render skills. Discover current installed paths; do not pin a plugin cache version here. Repository `.agents/skills/remotion-*` skills are a fallback if the plugin is unavailable; explain that fallback briefly and continue where possible.
2. Read `../narfid/SKILL.md` for claims and Arabic voice. Use original NARFID assets and current `lib/brand.ts` tokens; read the UI-system skill if present. Do not substitute Go Fitness customer identity for the narfid brand.
3. Inspect the project, user changes and assets. The owner named the **first `narfid-intro` film as the preferred creative reference** on 11 November 2026. Review its original composition and storyboard in `narfid-intro-video` before choosing a treatment: `NarfidIntroOriginal`, `src/Composition.tsx`, `src/style.css` and `STORYBOARD-ORIGINAL.md`. `NarfidIntro` currently opens a later director cut; distinguish the two rather than assuming the current default is the first version. Reference system: **`F:/newproject/go front-back`**, with `go` web, `gosystem` backend and **`gomobileapp`** current Flutter app (`gomobile` is older).
4. Infer a brief from the request and brand context. Default to Arabic RTL for Saudi club decision-makers, 1920×1080 / 30 fps and roughly 45–60 seconds when unspecified. Adapt aspect ratio, pacing and duration to the destination. Ask only for missing choices that materially affect the result while progressing independent work.
5. For a marketing-board campaign video, load [board-production.md](references/board-production.md) before production. Use its permanent `NV-001`–`NV-050` ID and full brief from `/board/marketing/videos` / `lib/marketing/video-briefs.ts`. These fifty videos are new: earlier intro/members-app films remain outside the campaign count; the original intro still serves as the preferred creative reference. Campaign format is 1080×1920 / 30 fps, 25–45 seconds; use the brief's intended duration. Update the live board automatically at production start and after verified delivery using the supplied command. Merely documenting that an update is needed is not completion.

## Capture the system safely

Read [local-capture.md](references/local-capture.md) **before starting reference services, logging in, seeding or collecting screenshots**. Production Supabase is off limits: no queries, logins, reads, dumps, migrations, CLI links, deployments or remote data imports. The supplied credentials are not an exception.

- Preferred capture: actual web/backend services connected to a disposable **local database**, seeded with coherent fictional Arabic business data. Existing PGlite test helpers or isolated local Supabase can provide it. Do not represent mocked responses as database-backed captures.
- Optional credentials are in `F:/saas/narfid/.private/video-reference-accounts.json`, never in this skill or tracked files. Read without echoing. Use only for a locally created test account after isolation is verified. Locally generated test sessions may not need them.
- Preserve reference repositories and production configuration. Adapters, accounts, seeds and identity changes belong in the isolated workspace or browser. Use browser-only NARFID styling and fictional customer details.
- Record screenshot source, local mode, seed scenario, date and limitations. Reuse useful captures; recapture stale screens or missing workflows. Keep real customers, personal details, payment records, credentials and secret-bearing logs out of shots and outputs.

## Direct the film

Define the video's goal in one sentence before storyboarding. For a short product demo, establish a concrete situation in the opening, show the action that addresses it, and end on a visible result or a decision the viewer can use. Link each scene to a message, visual action, sound cue and verified capability.

- **Follow the first intro's product-led direction.** Build around the sports-management system: purposeful product close-ups, connected club workflows, clear Arabic typography, depth and synchronized sound. Adapt the treatment to each topic and delivery format; the later NV-001 card treatment is not the owner's preferred benchmark. Reference footage remains subject to the capture and provenance rules above.
- **Keep a dark mood throughout every video.** Use charcoal/near-black backgrounds, dark surfaces and restrained brand-green accents in every scene, transition and end card. Use dark-mode product captures and dark information cards, with readable light text. A dark outer frame around a large white card does not meet this direction. Earlier reference scenes with white or full mint backgrounds do not override this newer preference.
- **Identify the category in every video.** Show a readable on-screen descriptor such as **«نرفد — نظام لإدارة الأندية والمنشآت الرياضية»** in the opening and closing. Keep the body grounded in recognizable sports-management workflows, such as memberships, class/court bookings, collection or branches, using verified system views when useful. The logo or a generic shift/administration scenario alone is insufficient to identify the product. Preserve the practical value of educational content while making its sports-institution context explicit.
- Use visual progression: kinetic Arabic phrases, purposeful close-ups, workflow connections, depth, changes in scale or light, and a clear final invitation. Avoid one repeated screenshot-and-text layout. Motion must clarify the message and leave time to read.
- For short product demos, use **«رحلة داخل النظام»** by default. Follow its description in [Video styles](#video-styles) and adapt the workflow to the brief.
- Showcase actual behavior and coherent local screenshots. Illustrative mobile cards can complement them; document their provenance instead of claiming they are app captures. Never invent features, customer results, live counts, integrations or testimonials.
- Keep Arabic words joined, set RTL direction and bundle Arabic fonts. Use generous safe areas, readable type and deliberate contrast. Animate with frame-based Remotion APIs; keep scenes and meaningful cues separately authored/editable.
- Open Studio as soon as the project can run, before editing the composition. Keep it running for steering. Review transitions as motion, not only isolated stills.

## Video styles

### رحلة داخل النظام

Use this name when the owner asks for **«رحلة داخل النظام»** or **Journey Inside the System**. The owner approved the [reservation handoff direction](../../../narfid-intro-video/NV001.md#reservation-handoff-direction-test) as its creative reference. The finished `NarfidReservationFilm` composition builds on that reference.

- **Goal and story:** Start with one practical question from a sports club or facility, follow a specific action in the system, and finish with the result and a useful decision.
- **Picture and motion:** Use dark product screens, short readable Arabic text and deliberate camera movement. Keep the relevant field, record or status visually connected as the framing moves through the workflow.
- **Sound:** Synchronize restrained effects with actions such as focusing, typing and revealing a result. Follow the owner's standing no-voiceover preference.
- **Context:** Identify narfid as a system for managing clubs and sports facilities, and use fictional data in system views.

### هوية نرفد المتحركة

Use **«هوية نرفد المتحركة»** when the owner requests the identity-film direction. The owner liked the `BrandMotionStudy` sample on 11 November 2026. Use its editable composition in `narfid-intro-video/src/DirectionStudies.tsx` as a reference, and develop the message around the requested subject.

- Introduce a focused brand or product message through animated Arabic typography and brand elements, with clear visual progression and readable pacing.
- Keep the dark Narfid palette and synchronized effects, with an ending suited to the film.

### حكاية من النادي

Use **«حكاية من النادي»** when the owner requests the use-story direction. The owner liked the `ClubMomentStudy` sample on 11 November 2026. Use its editable composition in `narfid-intro-video/src/DirectionStudies.tsx` as a reference.

- Begin with a specific situation involving club staff or a member. Show how the relevant Narfid workflow leads to a result the viewer can act on.
- Use appropriate Saudi-audience imagery and disclose generated or illustrative scenes in provenance. Do not represent fictional people as customers. The sample combines an AI-generated still with an animated camera move and the fictional reservation sequence.

Add other named styles under this section as the owner approves them. Apply the shared brand, dark mood, capture and delivery requirements to each style.

## Design the sound

Use **synchronized sound effects as the starting point**. In the approved reservation handoff direction, the key sounds mark focus, typing and the result. Let visible actions determine where a cue belongs and leave space between them. Select the sound and ending for the particular film; music is optional. Communicate through readable Arabic text and purposeful motion. Treat brief `message` fields as visual editorial guidance. Add narration or a spoken brand line only if the owner explicitly changes that preference.

The owner clarified on 11 November 2026 that the Narfid visual end card stays consistent across videos, while its sound is chosen for each film. Use the Arabic logo and sports-management descriptor in the closing. The existing instrumental `narfid-sonic-v1` is available when specifically appropriate; its earlier use remains historical context. A signature, when used, is instrumental unless the owner explicitly requests speech. Document audio provenance and usage rights.

Bundle audio locally, record provenance/usage rights and verify licensing for the intended use. A downloadable sample is not automatically commercially licensed. Existing generators and cue tracks in `narfid-intro-video` are starting points, not a quality ceiling. Follow applicable tool authorization rules for paid services.

Listen to the actual mix when possible and always check it numerically. If listening is unavailable, disclose the limitation; never mark `audioListened: true`. If the owner explicitly directs completion/publication after that disclosure, record their exact instruction as the listening-review waiver and proceed with the other checks. Do not infer a waiver from silence or generate one yourself. Preserve useful stereo, smooth cuts and tails, allow headroom and prevent clipping. Choose loudness for the destination rather than imposing one target on every film.

## Export and finish

1. Run video lint/type checks and bundle/build. Review complete Studio playback and representative scenes at delivery size against the directing requirements above, including dark surfaces throughout and a readable sports-management descriptor. Fix missing assets/fonts, RTL errors, clipping, timeline overlaps, bad transitions and audio problems. Keep standalone video dependencies excluded from website checks where needed.
2. Load the Remotion render skill. Export the **requested cut** as H.264 MP4 with AAC stereo audio when audio is present, 1080p / 30 fps by default. From the existing video folder:

   ```powershell
   npx remotion render NarfidIntro out/narfid-intro.mp4 --codec=h264 --crf=18 --concurrency=2
   ```

   Confirm current CLI flags when changing settings. Follow the render to completion and resolve failures rather than returning only a preview. Preserve the prior final export when the new cut is a separate deliverable.

3. Verify the file: nonzero size, intended duration/dimensions/fps, video/audio streams, full decode, extracted-frame review and listening where available. Bundled Windows FFmpeg: `node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe`. Its null output needs explicit encoders, e.g. `-c:v libx264 -preset ultrafast -c:a pcm_s16le -f null NUL`. A missing default null encoder is a verification-command issue, not proof of corruption.
4. For a campaign video, run the board completion command from [board-production.md](references/board-production.md), confirm its MP4 is privately uploaded and its status reads **جاهز**, then verify playback/download from the board. On failed production, record **يحتاج تعديل** with a concise safe note; preserve the previous export. Publication is independent per platform: a completed render never marks it published. The owner can mark **تم النشر** manually, like image posts; automation marks it only after an explicitly requested external publication is verified.
5. Deliver an absolute MP4 link, duration/resolution/size, editable project location and the board video ID/link with its saved state. A Studio link is supplemental. Exclude exports, caches, QA files and private capture work from Git; commit/push editable source and relevant documentation per `AGENTS.md`. Finish when the requested MP4 and board update pass verification, or report the concrete blocker and remaining work.
