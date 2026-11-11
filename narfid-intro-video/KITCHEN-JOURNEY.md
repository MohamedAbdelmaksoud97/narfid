# نرفد — رحلة الطلب داخل المطبخ

## Purpose

Show a club's kitchen team how one meal order moves from a new request to preparation, readiness and recorded delivery, using the real system's actions and a visible result.

30 seconds · 1920 × 1080 · 30 fps · Arabic RTL · Tajawal · original stereo effects · no voiceover.

Composition: `NarfidKitchenJourney`. Editable parent: `src/kitchen/Film.tsx`. The product journey, caption instances and closing have connected compositions in the `Kitchen-Journey-Scenes` folder. Each scene and sound cue is an independently authored timeline item. Existing films are preserved.

## Storyboard

| Time | Picture and message | Sound |
| --- | --- | --- |
| 0–4 | Establish the real three-column kitchen queue. Ask «طلب العضو… وصل لأي مرحلة؟». Identify Narfid as a system for clubs and sports facilities. | Soft product-window movement. |
| 4–9 | Move into the same order; show the fictional member, meal and quantity. | Focus and detail cues. |
| 9–15 | Move to «بدء التحضير», show the click, then follow the order into «قيد التحضير». | Click and restrained movement. |
| 15–17 | «بعد انتهاء التحضير…» explicitly represents elapsed preparation time; move to the real readiness action. | Short transition and click. |
| 17–21 | Show the same order under «جاهز للاستلام». | Two-note readiness cue. |
| 21–26 | After handover, show «تسليم وإكمال» and the resulting empty active queue. «تم التسليم. واكتمل الطلب.» | Delivery click and completion cue. |
| 26–30 | Original Arabic logo, sports-management descriptor, demo invitation and official domain. | Original instrumental closing cue. |

## Product evidence and capture provenance

Capabilities were checked against `../docs/platform-frontend-audit.md`, `../docs/platform-backend-audit.md` and the reference system's `go/components/restaurant-management-page.tsx`. The actual action labels are «بدء التحضير», «جاهز للاستلام» and «تسليم وإكمال».

- Reference frontend revision: `d3efa7e870e143539e35a4c86cdd1f8b0b7e0d87`.
- Reference backend revision: `80ec3c75d13bdcae26c2cee9d27b4a6423b8f546`.
- Route: disposable source copies under `.private/video-runs/kitchen-journey`, in-memory PGlite with versioned local migrations, real SQL repositories, business services, Express routes and Next BFF. Authentication uses a test-only random-token verifier. No hosted Supabase, production credentials, customer exports or external delivery adapters were used.
- Backend and frontend socket/fetch egress were restricted to loopback. The browser received a local-only CSP including `worker-src 'none'`. All fonts and identity assets were bundled locally. The connection audit contained loopback destinations only.
- Original customer repositories/configuration were preserved. Only the disposable copy received Narfid colors/logo, local Tajawal fonts, a local session bootstrap and a display-only omission of the legacy member-number prefix.
- The four images in `public/kitchen` are actual UI captures from successive states of one fictional order, `01A1CC93`. The member سلمان الحربي, club نادي المسار الرياضي, branch فرع العليا and meal دجاج مشوي مع الأرز are demonstration data.
- Capture uses a 3200 × 2200 browser viewport with 2× presentation scaling and full-page JPEGs, displayed at a consistent 1590px width in the film. Camera framing, pointer motion, focus outlines and transitions are authored in Remotion; these are database-backed still captures rather than a continuous screen recording.
- Two earlier rehearsal orders remain inside the disposable in-memory instance. The final captures consistently show three allocated meals and seventeen remaining from twenty prepared portions. These are fictional scenario quantities, not customer performance figures.
- The delivered order was independently read through the local API as `COMPLETED`; the local meal entitlement showed three consumed meals after the three capture runs. The UI intentionally removes completed orders from the active queue. No fictitious completed-order card, notification channel or cooking-time measurement is shown.
- Capture session: 11 November 2026 UTC; the displayed system business date is 12 November in `Asia/Riyadh`.

## Audio and review limits

`scripts/make-kitchen-audio.mjs` deterministically creates six original stereo cues without external samples, speech, music services or paid generation. The asset-level rights/provenance record is `public/kitchen/audio-provenance.json`.

The mix must be checked numerically for peaks, loudness, stereo channels, duration and complete decode. Direct listening is unavailable in this agent session and was disclosed to the owner; **audioListened is false**. Numerical validation does not replace a listening review, and no listening waiver has been inferred.

## Build and delivery

```powershell
npm run lint
npm run build
npx remotion render NarfidKitchenJourney out/narfid-kitchen-journey.mp4 --codec=h264 --crf=18 --concurrency=2
```

The delivered cut uses H.264 8-bit 4:2:0, AAC stereo at 192 kb/s and JPEG render quality 95. The stream contains 900 video frames at 30 fps; AAC padding makes the container duration 30.016 seconds. Size: 5,801,249 bytes. A full FFmpeg video/audio decode passed. Ten delivery-size review frames and frames extracted from the final MP4 were inspected. Lint/type checking and the production bundle passed, and Studio reported no composition error. Studio playback was exercised; background-tab throttling limited continuous real-time preview review.

Measured audio: integrated loudness −23.79 LUFS and true peak −8.61 dBTP. The sparse effects intentionally leave quiet reading time. There is no clipping; a listening review remains outstanding. SHA-256: `C5F05513A8CD42002A45ACD3E75AA5F290033230E2364372191706B97B396A4C`.

QA frames, compiled bundles, connection/session records and the MP4 stay in ignored output/private directories. Commit the editable composition, documented fictional UI captures and original sound assets.

This is the standalone kitchen scenario requested in chat; it has no assigned marketing-campaign video ID and does not publish to external social accounts.
