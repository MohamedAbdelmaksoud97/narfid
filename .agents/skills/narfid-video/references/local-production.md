# Local campaign production

The owner removed the website's board video section on 13 November 2026. Video production, editing and MP4 delivery stay on the local computer. Do not upload films to narfid storage or synchronize board production/publication records.

The fifty campaign ideas remain in `lib/marketing/video-briefs.ts`, with contracts and script formatting in `lib/marketing/video-plan.ts`. Preserve their `NV-001`–`NV-050` IDs when producing an existing idea. Earlier intro and members-app films are separate. Follow the main skill's current creative direction over an older brief's treatment.

## Read a brief

From the narfid root:

```powershell
npm run marketing:video -- brief NV-001
```

This command uses local source files and does not load board credentials or `.env.local`.

## Verify and deliver

Follow the main skill's export checks. For campaign-format files, the existing local verifier can also check the brief's 1080×1920 dimensions, 30 fps, intended duration, H.264/AAC streams, full decode and matching QA hash:

```powershell
npm run marketing:video -- verify NV-001 --file "absolute/video.mp4" --qa ".private/video-runs/NV-001-qa.json"
```

The QA JSON must contain `videoSha256`, `visualReviewed: true` and `audioListened: true`. An explicit owner waiver may instead be recorded as `audioReviewWaivedByOwner: true` with its actual instruction in `ownerAuthorization`; do not invent a waiver. If an approved sonic signature applies, add `--signature "absolute/manifest.json"`; its hash and final-audio correlation are checked too. The main skill permits other formats for other briefs; this campaign verifier is not a universal format restriction.

Keep the MP4, QA and any local progress notes under the ignored export/private directories. Deliver an absolute file link and editable source. `status`, `start`, `revise` and `finish` board commands are retired; only `brief` and `verify` remain.

External publication is separate. When the owner asks to publish, upload the local file directly to the named social platform and verify its live post. Keep any needed publication notes locally; do not recreate a website video library.
