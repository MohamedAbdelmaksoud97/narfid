# NARFID members app

Arabic product film for club owners and operators. 46 seconds, 1920 × 1080, 30 fps, stereo synthwave and transition effects.

| Time | Message | Picture and sound |
| --- | --- | --- |
| 00–06 | Members can manage their club subscription from their phones | The real membership screen enters over the first drumbeat and a short impact |
| 06–14 | Choose a package and review it before placing the order | A close-up of the catalog, a soft percussive accent, then the order callout |
| 14–23 | Pay online or at reception | The beat opens up as the payment choices enter. A short accent marks the invoice |
| 23–31 | Renew from the membership screen | A fast sweep leads into the renewal preview |
| 31–40 | Freeze or resume under club policy | The score moves to its final phrase with the cut to the freeze form |
| 40–46 | See the app in a demo | A short sweep introduces the logo and invitation. The track resolves and its tail fades |

## Preview and export

From this Remotion project, run `npm run dev` and select `NarfidMembersApp`. The Members App Scenes folder exposes the six scenes separately. The edit lives in `src/MembersApp.tsx` and `src/members/`.

```powershell
npm run lint
npm run build
npx remotion render NarfidMembersApp out/narfid-members-app.mp4 --codec=h264 --crf=18 --concurrency=2
```

The delivery master uses a two-pass loudness adjustment targeting −15.5 LUFS and −1.5 dBTP, with the H.264 stream copied through and stereo AAC at 48 kHz. For an audio revision, render the composition with `--codec=wav` and remux that mix with the picture master.

The active soundtrack export measured −15.55 LUFS integrated and −1.23 dBTP after AAC encoding. It passed full decode, all seven cue placements matched the render, and all 1,380 video packet hashes matched the picture master.

## Capture and audio provenance

- November 11, 2026. The four phone screens are Flutter widget renders from `gomobileapp` (revision `80a7e5a`) and real responses from `gosystem` (revision `80ec3c7`). The isolated copy ran the self-service routes against a disposable loopback PGlite database seeded through the local renewal helpers. The capture harness injected a test member session and restricted requests to the loopback self-service API. The Flutter copy used NARFID branding and a local Arabic font.
- The demo uses fictional member Salman Alharbi, the Olaya branch, and fictional monthly packages. Screenshot sources are the app's membership overview, package catalog, renewal quote dialog, and freeze request screen. Prices and freeze limits in the captures are demo values.
- Local service checks created both subscription and renewal invoices and confirmed the active, frozen, and resumed subscription states.
- The owner confirmed both payment options for NARFID. The payment cards are illustrations. The reference app's documented reception flow creates the order and invoice for collection at the club. Online checkout was not executed in the isolated reference environment.
- The original logo and local Tajawal fonts come from the existing NARFID project.
- Music is [Brain Dance by Kevin MacLeod](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN2300006), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The edit adjusts the tempo from 124 to 120 BPM and crossfades from the opening groove to the track's final phrase at 31 seconds. The music credit is in the export metadata. Include the same credit in the description when publishing.
- The three percussive cues adapt [Transition (hit and whoosh) by xkeril](https://freesound.org/people/xkeril/sounds/736852/), CC0. The four sweeps adapt [Short Whoosh, 13x by Kinoton](https://freesound.org/people/Kinoton/sounds/427979/), CC0. The edits use the public high-quality previews and apply trims, fades, filtering and gain changes.
