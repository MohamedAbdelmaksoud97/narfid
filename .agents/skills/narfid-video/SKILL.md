---
name: narfid-video
description: "Create, revise and export professional narfid videos with the Remotion plugin, realistic fictional captures of the reference system in an isolated local database, and verified MP4 delivery. Use for narfid video requests; ordinary website edits and still-image requests do not activate this workflow."
---

# NARFID video production

Deliver a finished MP4, its absolute local link, and editable Remotion source. A request to create a video authorizes export by default. The owner's standing instruction overrides Remotion guidance that otherwise stops at a preview. Respect an explicit request for preview-only work.

## Route and establish the production

1. Use the installed **Remotion plugin**. Load `remotion:remotion-best-practices` and its relevant create, markup, interactivity, studio and render skills. Discover current installed paths; do not pin a plugin cache version here. Repository `.agents/skills/remotion-*` skills are a fallback if the plugin is unavailable; explain that fallback briefly and continue where possible.
2. Read `../narfid/SKILL.md` for claims and Arabic voice. Use original NARFID assets and current `lib/brand.ts` tokens; read the UI-system skill if present. Do not substitute Go Fitness customer identity for the narfid brand.
3. Inspect the project, user changes and assets. Reuse `narfid-intro-video` when suitable. Its `NarfidIntro` composition is the current director cut; `NarfidIntroOriginal` preserves the first version. Reference system: **`F:/newproject/go front-back`**, with `go` web, `gosystem` backend and **`gomobileapp`** current Flutter app (`gomobile` is older).
4. Infer a brief from the request and brand context. Default to Arabic RTL for Saudi club decision-makers, 1920×1080 / 30 fps and roughly 45–60 seconds when unspecified. Adapt aspect ratio, pacing and duration to the destination. Ask only for missing choices that materially affect the result while progressing independent work.

## Capture the system safely

Read [local-capture.md](references/local-capture.md) **before starting reference services, logging in, seeding or collecting screenshots**. Production Supabase is off limits: no queries, logins, reads, dumps, migrations, CLI links, deployments or remote data imports. The supplied credentials are not an exception.

- Preferred capture: actual web/backend services connected to a disposable **local database**, seeded with coherent fictional Arabic business data. Existing PGlite test helpers or isolated local Supabase can provide it. Do not represent mocked responses as database-backed captures.
- Optional credentials are in `F:/saas/narfid/.private/video-reference-accounts.json`, never in this skill or tracked files. Read without echoing. Use only for a locally created test account after isolation is verified. Locally generated test sessions may not need them.
- Preserve reference repositories and production configuration. Adapters, accounts, seeds and identity changes belong in the isolated workspace or browser. Use browser-only NARFID styling and fictional customer details.
- Record screenshot source, local mode, seed scenario, date and limitations. Reuse useful captures; recapture stale screens or missing workflows. Keep real customers, personal details, payment records, credentials and secret-bearing logs out of shots and outputs.

## Direct the film

Write a short storyboard linking each scene to one message, its visual action, sound cue and verified capability. Choose a treatment for the specific brief, such as daily operational complexity becoming a connected system.

- Use visual progression: kinetic Arabic phrases, purposeful close-ups, workflow connections, depth, changes in scale or light, and a clear final invitation. Avoid one repeated screenshot-and-text layout. Motion must clarify the message and leave time to read.
- Showcase actual behavior and coherent local screenshots. Illustrative mobile cards can complement them; document their provenance instead of claiming they are app captures. Never invent features, customer results, live counts, integrations or testimonials.
- Keep Arabic words joined, set RTL direction and bundle Arabic fonts. Use generous safe areas, readable type and deliberate contrast. Animate with frame-based Remotion APIs; keep scenes and meaningful cues separately authored/editable.
- Open Studio as soon as the project can run, before editing the composition. Keep it running for steering. Review transitions as motion, not only isolated stills.

## Design the sound

Use music with changes in intensity, restrained transition movement, tactile action sounds and a brief resolving brand cue where appropriate. Synchronize cues to visible events; avoid constant generic whooshes or a repetitive bare oscillator loop. Narration is optional.

Bundle audio locally, record provenance/usage rights and verify licensing for the intended use. A downloadable sample is not automatically commercially licensed. Existing generators and cue tracks in `narfid-intro-video` are starting points, not a quality ceiling. Follow applicable tool authorization rules for paid services.

Listen to the actual mix and check it numerically. If listening is unavailable, disclose that limitation instead of claiming an auditory review. Preserve useful stereo, smooth cuts and tails, allow headroom and prevent clipping. Choose loudness for the destination rather than imposing one target on every film.

## Export and finish

1. Run video lint/type checks and bundle/build. Review complete Studio playback and representative scenes at delivery size. Fix missing assets/fonts, RTL errors, clipping, timeline overlaps, bad transitions and audio problems. Keep standalone video dependencies excluded from website checks where needed.
2. Load the Remotion render skill. Export the **requested cut** as H.264 MP4 with AAC stereo audio when audio is present, 1080p / 30 fps by default. From the existing video folder:

   ```powershell
   npx remotion render NarfidIntro out/narfid-intro.mp4 --codec=h264 --crf=18 --concurrency=2
   ```

   Confirm current CLI flags when changing settings. Follow the render to completion and resolve failures rather than returning only a preview. Preserve the prior final export when the new cut is a separate deliverable.
3. Verify the file: nonzero size, intended duration/dimensions/fps, video/audio streams, full decode, extracted-frame review and listening where available. Bundled Windows FFmpeg: `node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe`. Its null output needs explicit encoders, e.g. `-c:v libx264 -preset ultrafast -c:a pcm_s16le -f null NUL`. A missing default null encoder is a verification-command issue, not proof of corruption.
4. Deliver an absolute MP4 link, duration/resolution/size and editable project location. A Studio link is supplemental. Exclude exports, caches, QA files and private capture work from Git; commit/push editable source and relevant documentation per `AGENTS.md`. Finish when the requested MP4 passes verification, or report the concrete blocker and remaining work.
