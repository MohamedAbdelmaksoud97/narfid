# Campaign production and board synchronization

Use for `NV-001`–`NV-050` in [the video library](https://www.narfid.com/board/marketing/videos). The library is a shared production plan, not a hosted rendering service. Read the selected brief and current state before starting; the owner may have changed its status. Keep earlier films outside the fifty records while applying the [main skill's directing requirements](../SKILL.md#direct-the-film): use Tajawal, choose the visual mood for the film, and make its sports-management purpose explicit. An existing brief's older treatment does not override the owner's newer direction.

## Read, start, and recover

Run from `F:/saas/narfid`. Commands read local `.env.local` and the authorized chairman account in `.private/board-accounts.json`; never print credentials. They use ordinary board authentication, RLS and revision-aware RPCs against **narfid's board**, never the reference system's remote production database.

```powershell
npm run marketing:video -- brief NV-001
npm run marketing:video -- status NV-001
npm run marketing:video -- start NV-001
```

Start automatically when actual production begins, not during idea planning. It saves **قيد الإنتاج** and a render attempt in `.private/video-runs/NV-001.json`. Re-running start resumes the same matching attempt; it refuses to replace someone else's. A changed revision or attempt requires re-reading the board and resolving the change, not blindly retrying. A failed start response can be checked with `status` before any new start.

On a blocked or failed production, automatically record the safe reason without secrets:

```powershell
npm run marketing:video -- revise NV-001 --note "تحتاج لقطة الحجز إلى إعادة تصوير محلي."
```

Preserve the last attached export; **يحتاج تعديل** does not erase it. Revisions of a completed video start a new attempt and create a new immutable MP4.

## Verify, attach, and finish

Render and perform the main skill's media review first. Local QA records `videoSha256` and `visualReviewed: true` after frame/playback review. Record `signatureSha256` when using the optional master. Set `audioListened: true` only after actual listening to that exact export. If unavailable, keep it false and disclose the limitation. An explicit owner instruction to finish/publish after that disclosure can instead be recorded as `audioReviewWaivedByOwner: true` with their nonempty exact `ownerAuthorization`; the verifier accepts that documented exception while preserving all applicable media and hash checks. Silence or an inferred preference is not a waiver. QA reports and exports stay ignored.

```powershell
npm run marketing:video -- verify NV-001 --file "absolute/video.mp4" --qa ".private/video-runs/NV-001-qa.json"
npm run marketing:video -- finish NV-001 --file "absolute/video.mp4" --qa ".private/video-runs/NV-001-qa.json"
```

`verify` works locally without signing in. It checks the brief's dimensions/duration/fps, H.264/AAC streams, full decode and matching QA hashes. If `--signature` is supplied, it also checks the master and final-audio correlation. `finish` repeats verification, uploads to the private `marketing-videos` bucket, downloads and hashes the uploaded bytes, then records **جاهز** for the same attempt/revision and reads it back. The bucket limit is 50 MiB; compress while preserving verified quality if necessary. Files stay outside Git and the Next build.

An uncertain upload is recovered by comparing existing bytes; it never overwrites an object. An uncertain completion is checked against the stored output hash; rerunning finish for the same completed output does not duplicate it. If the board changed meanwhile, stop the write and review the current state. Deliver the local MP4 plus the board link and confirm protected playback/download. A failed board update remains unfinished even if the local MP4 is valid.

## Publication

Production and external publication are separate. Instagram, X, LinkedIn, Facebook and Snapchat each have their own **تم النشر** switch, timestamp and revision. The timestamp records the board action, not an imported platform date. The owner may toggle it after manual publication and undo a mistake. No publishing permission follows from rendering or this synchronization.

For an explicitly authorized social publication, verify the live post before updating its matching video/platform record. Use the local social-publishing skill when applicable; keep the image and video libraries distinct. Public captions may need adapting to the destination's current requirements. A failed external publication leaves its switch off.
