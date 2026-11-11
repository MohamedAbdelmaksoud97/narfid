# NARFID members app

Arabic product film for club owners and operators. 46 seconds, 1920 × 1080, 30 fps, original stereo music and cues.

| Time | Message | Picture and sound |
| --- | --- | --- |
| 00–06 | Members can manage their club subscription from their phones | The real membership screen and the club-system connection |
| 06–14 | Choose a package and review it before placing the order | A close-up of the catalog, a tactile tap, then the order callout |
| 14–23 | Pay online or at reception | Two payment illustrations with stereo cues, converging on the order and invoice |
| 23–31 | Renew from the membership screen | A push into the renewal preview and a tap on the order action |
| 31–40 | Freeze or resume under club policy | A push into the freeze form and a cue on the duration field |
| 40–46 | See the app in a demo | NARFID logo, invitation, URL and original audio signature |

## Preview and export

From this Remotion project, run `npm run dev` and select `NarfidMembersApp`. The Members App Scenes folder exposes the six scenes separately. The edit lives in `src/MembersApp.tsx` and `src/members/`.

```powershell
npm run lint
npm run build
npx remotion render NarfidMembersApp out/narfid-members-app.mp4 --codec=h264 --crf=18 --concurrency=2
```

The delivery master uses a two-pass loudness adjustment targeting −17 LUFS and −1.5 dBTP, with the H.264 stream copied through and stereo AAC at 48 kHz. The exported file passed full decode and measured −17.01 LUFS integrated and −2.46 dBTP.

## Capture and audio provenance

- November 11, 2026. The four phone screens are Flutter widget renders from `gomobileapp` (revision `80a7e5a`) and real responses from `gosystem` (revision `80ec3c7`). The isolated copy ran the self-service routes against a disposable loopback PGlite database seeded through the local renewal helpers. The capture harness injected a test member session and restricted requests to the loopback self-service API. The Flutter copy used NARFID branding and a local Arabic font.
- The demo uses fictional member Salman Alharbi, the Olaya branch, and fictional monthly packages. Screenshot sources are the app's membership overview, package catalog, renewal quote dialog, and freeze request screen. Prices and freeze limits in the captures are demo values.
- Local service checks created both subscription and renewal invoices and confirmed the active, frozen, and resumed subscription states.
- The owner confirmed both payment options for NARFID. The payment cards are illustrations. The reference app's documented reception flow creates the order and invoice for collection at the club. Online checkout was not executed in the isolated reference environment.
- The original logo and local Tajawal fonts come from the existing NARFID project. The score and brand signature reuse the original synthesized `director-score.mp3` and `signature.wav`. Five new stereo cues were synthesized for the edit with `node scripts/make-members-sound.mjs`. Music levels are automated around the payment scene and final signature. No external samples or narration were used.
