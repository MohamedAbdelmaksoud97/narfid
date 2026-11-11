# NARFID members app

Arabic product film for club owners and operators. 46 seconds, 1920 × 1080, 30 fps, original stereo music and recorded foley.

| Time | Message | Picture and sound |
| --- | --- | --- |
| 00–06 | Members can manage their club subscription from their phones | The real membership screen and the club-system connection |
| 06–14 | Choose a package and review it before placing the order | A close-up of the catalog, a tactile tap, then the order callout |
| 14–23 | Pay online or at reception | Two payment illustrations converge on the order and invoice, accompanied by a short paper rustle |
| 23–31 | Renew from the membership screen | A push into the renewal preview and a tap on the order action |
| 31–40 | Freeze or resume under club policy | A push into the freeze form and a cue on the duration field |
| 40–46 | See the app in a demo | NARFID logo, invitation and URL over the music fade |

## Preview and export

From this Remotion project, run `npm run dev` and select `NarfidMembersApp`. The Members App Scenes folder exposes the six scenes separately. The edit lives in `src/MembersApp.tsx` and `src/members/`.

```powershell
npm run lint
npm run build
npx remotion render NarfidMembersApp out/narfid-members-app.mp4 --codec=h264 --crf=18 --concurrency=2
```

The delivery master uses a two-pass loudness adjustment targeting −17 LUFS and −1.5 dBTP, with the H.264 stream copied through and stereo AAC at 48 kHz. For an audio-only revision, render the composition with `--codec=wav` and remux that mix with the picture master.

The recorded-foley edition passed a full decode and measured −17.00 LUFS integrated and −2.34 dBTP. All four cue placements matched the rendered mix, and all 1,380 video packet hashes matched the picture master.

## Capture and audio provenance

- November 11, 2026. The four phone screens are Flutter widget renders from `gomobileapp` (revision `80a7e5a`) and real responses from `gosystem` (revision `80ec3c7`). The isolated copy ran the self-service routes against a disposable loopback PGlite database seeded through the local renewal helpers. The capture harness injected a test member session and restricted requests to the loopback self-service API. The Flutter copy used NARFID branding and a local Arabic font.
- The demo uses fictional member Salman Alharbi, the Olaya branch, and fictional monthly packages. Screenshot sources are the app's membership overview, package catalog, renewal quote dialog, and freeze request screen. Prices and freeze limits in the captures are demo values.
- Local service checks created both subscription and renewal invoices and confirmed the active, frozen, and resumed subscription states.
- The owner confirmed both payment options for NARFID. The payment cards are illustrations. The reference app's documented reception flow creates the order and invoice for collection at the club. Online checkout was not executed in the isolated reference environment.
- The original logo, local Tajawal fonts and instrumental score come from the existing NARFID project. The score dips briefly as the invoice appears and fades under the closing card.
- The three phone touches are distinct short edits from [Finger Tapping Phone by jentlemen](https://freesound.org/people/jentlemen/sounds/704862/), CC0. Source windows start at 0.591, 1.781 and 3.477 seconds.
- The invoice cue is a short edit from [receipt handling2 by Alpaca_Audio](https://freesound.org/people/Alpaca_Audio/sounds/816684/), CC0. The source window starts at 0.349 seconds. The four clips are band-limited, faded and gain-matched 48 kHz PCM WAVs made from the published high-quality previews.
