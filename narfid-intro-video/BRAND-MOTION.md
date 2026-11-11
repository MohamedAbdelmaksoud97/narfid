# هوية نرفد المتحركة — كل تفاصيل ناديك

Goal: Introduce Narfid to club owners as a system connecting their daily memberships, bookings and collection workflows.

30 seconds · 1080×1920 · 30 fps · Arabic RTL · Tajawal · no voiceover.
Composition: `NarfidBrandMotion`. Separate deliverable; preserves `BrandMotionStudy` and all earlier exports.

| Time | Message | Motion and sound |
| --- | --- | --- |
| 0–5 | كل يوم في ناديك — تفاصيل تستحق الاهتمام | Large joined Arabic type; expanding ring and soft landing |
| 5–12.5 | عضويات / حجوزات / تحصيل | Three separately authored timed cues, upward word changes |
| 12.5–19 | كل تفاصيل ناديك في منظومة واحدة | Three operational labels converge; one continuous green circle |
| 19–25 | نرفدك بالتقنية لتتفرّغ لتطوير ناديك | Green typography and restrained arc movement |
| 25–30 | Arabic logo, product descriptor, demo invitation, official website | Existing logo lockup, bespoke quiet instrumental ending |

## Sources and rights

- Creative reference: approved `BrandMotionStudy` in `src/DirectionStudies.tsx`; original intro composition and `STORYBOARD-ORIGINAL.md` reviewed.
- Original Arabic logo and locally bundled Tajawal fonts from the existing Narfid project; brand green `#3ECF8E` from `../lib/brand.ts`.
- `UI-system/SKILL.md` is absent from this checkout and installed skill roots; existing brand assets/tokens and the approved study are used as visual sources.
- Membership, booking and collection wording supported by `../docs/platform-backend-audit.md` and the Narfid brand skill. No invented performance, customer or pricing claims.
- This is an identity film using authored typography and geometry. No system screenshots, people, database access or customer data.
- Sound is original deterministic synthesis in `scripts/make-brand-motion-audio.mjs`. No third-party recordings or samples; no third-party sample license is needed. Generate with `node scripts/make-brand-motion-audio.mjs`.
- Outside the NV-001–NV-050 campaign; no campaign record or publication status is changed.

## Delivery and review

Export: `npx remotion render NarfidBrandMotion out/narfid-brand-motion.mp4 --codec=h264 --crf=18 --concurrency=2`.
Exports and QA artifacts stay in ignored `out/`.

Verified on 11 November 2026:

- `npm run lint` passed ESLint and TypeScript; the render bundle completed successfully.
- H.264, 1080×1920, 30 fps, 900 video frames; AAC stereo at 48 kHz. Container duration 30.016 s (AAC padding), file size 4,525,136 bytes.
- Entire video/audio decoded successfully with FFmpeg, exit code 0.
- Eight frames extracted from the finished MP4 reviewed, including both final frames: Arabic shaping, readable type, safe margins, colors and original Arabic logo all correct.
- Decoded AAC sample peak −5.26 dBFS, whole-file RMS −26.58 dBFS; zero clipped samples. This is deliberately sparse sound effects, not a continuous music bed.
- `audioListened: false`: no direct audio-listening tool was available; no listening waiver is inferred.
- Studio loads and seeks correctly without a reported error. This in-app browser did not advance playback despite reporting `playing: true`, and did not display the CanvasImage logo. The exported MP4 contains the logo correctly. Continuous Studio playback review remains unverified; extracted-frame review and full file decode passed.
