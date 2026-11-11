# NARFID members app

Arabic product film for club owners and operators. 46 seconds, 1920 × 1080, 30 fps, with an original electric-piano and brushed percussion score.

| Time | Message | Picture and sound |
| --- | --- | --- |
| 00–06 | Members can manage their club subscription from their phones | Electric piano and bass introduce the membership screen |
| 06–14 | Choose a package and review it before placing the order | A lightly syncopated percussion groove supports the catalog |
| 14–23 | Pay online or at reception | The piano phrase returns with the payment options. The drums step back for a short two-note invoice cue |
| 23–31 | Renew from the membership screen | The groove resumes under the renewal preview |
| 31–40 | Freeze or resume under club policy | A brief percussion lift leads into the last chord |
| 40–46 | See the app in a demo | A three-note electric-piano motif resolves over the logo |

## Preview and export

From this Remotion project, run `npm run dev` and select `NarfidMembersApp`. The Members App Scenes folder exposes the six scenes separately. The edit lives in `src/MembersApp.tsx` and `src/members/`.

```powershell
npm run lint
npm run build
npx remotion render NarfidMembersApp out/narfid-members-app.mp4 --codec=h264 --crf=18 --concurrency=2
```

The delivery master uses a two-pass loudness adjustment targeting −17.5 LUFS and −2 dBTP, with the H.264 stream copied through and stereo AAC at 48 kHz. For an audio revision, render the composition with `--codec=wav` and remux that mix with the picture master.

The electric-piano edition measured −17.52 LUFS integrated and −2.53 dBTP after AAC encoding. It passed full decode. The two spot cues matched their intended frames in the render, and all 1,380 video packets matched the picture master.

## Capture and audio provenance

- November 11, 2026. The four phone screens are Flutter widget renders from `gomobileapp` (revision `80a7e5a`) and real responses from `gosystem` (revision `80ec3c7`). The isolated copy ran the self-service routes against a disposable loopback PGlite database seeded through the local renewal helpers. The capture harness injected a test member session and restricted requests to the loopback self-service API. The Flutter copy used NARFID branding and a local Arabic font.
- The demo uses fictional member Salman Alharbi, the Olaya branch, and fictional monthly packages. Screenshot sources are the app's membership overview, package catalog, renewal quote dialog, and freeze request screen. Prices and freeze limits in the captures are demo values.
- Local service checks created both subscription and renewal invoices and confirmed the active, frozen, and resumed subscription states.
- The owner confirmed both payment options for NARFID. The payment cards are illustrations. The reference app's documented reception flow creates the order and invoice for collection at the club. Online checkout was not executed in the isolated reference environment.
- The original logo and local Tajawal fonts come from the existing NARFID project.
- The original 100 BPM arrangement uses a sampled Hohner Pianet T for the keyboard, bass and two spot cues. The instrument samples are from [Hohner Pianet T by tarane468](https://freesound.org/people/tarane468/packs/26137/), CC0.
- The percussion uses [Acoustic Drum Kick by Sound_Bar_KK](https://freesound.org/people/Sound_Bar_KK/sounds/424662/), [Brushes on Drum Kit Sample Set by Srirachasocks](https://freesound.org/people/Srirachasocks/sounds/843460/) and [Improv Shaker, Hit 6 by quatricise](https://freesound.org/people/quatricise/sounds/734467/), all CC0. The arrangement uses trimmed, filtered and gain-matched clips from the published high-quality previews.
