# Director cut — من التفاصيل إلى المنظومة

60 seconds · 1920 × 1080 · 30 fps · Arabic · stereo instrumental + synchronized sound design.

## Direction

The club's daily activity becomes a connected system. The opening scatters operational words around a central statement, then draws them inward. Scale, pace and light change throughout the film: kinetic type, close product views, a mint booking scene, a financial flow, paired operational screens, an orbital mobile scene, a pullback to the ecosystem, and a calm brand close.

| Time  | Scene               | Picture / sound                                                                  |
| ----- | ------------------- | -------------------------------------------------------------------------------- |
| 00–06 | ناديك لا يتوقف      | Floating labels converge; sparse musical introduction and rising air             |
| 06–11 | خلّ التفاصيل تتصل   | Expanding rings and large type; low impact on the reveal                         |
| 11–19 | العلاقة تبدأ بعضوية | Tilted subscription UI and changing lifecycle callout; switch / click            |
| 19–26 | لكل حجز مكانه       | Mint background, staggered booking types, UI tilt; restrained confirmation tone  |
| 26–34 | كل حركة، لها سياق   | Sale → invoice → collection motion; synchronized clicks                          |
| 34–41 | تشغيل يتكامل        | Inventory / kitchen mosaic with a connecting node; soft impact                   |
| 41–50 | النادي معك          | Phone with staggered service satellites; music drops in density                  |
| 50–55 | منظومة واحدة        | Camera pulls away from the product ecosystem; riser and impact                   |
| 55–60 | نرفدك بالتقنية      | Logo, demo invitation and URL; original three-note signature and musical resolve |

## Audio

23 authored audio items across music, transition and action tracks. Original stereo score at 44.1 kHz, encoded at 256 kbps after loudness processing. Pads, sparse keys, bass and percussion enter in stages; the score makes space at scene boundaries. The full mix was measured at approximately -20.6 LUFS integrated / -4.6 dBTP true peak, with no clipping.

- `scripts/make-director-audio.mjs` generates the score, low impact, air riser and three-note signature. Uses the Remotion-bundled Windows FFmpeg executable; set FFMPEG_PATH on another platform.
- Intermediate `public/director-score.wav` is ignored; `public/director-score.mp3` is the mastered playback asset.
- Local whoosh, switch, ding and click files come from the sound-effect URLs supplied in the installed Remotion skill: https://remotion.media/whoosh.wav, https://remotion.media/switch.wav, https://remotion.media/ding.wav, https://remotion.media/mouse-click.wav.
- No voiceover is included.

## Evidence and provenance

The same verified capabilities, NARFID branding and fictional-data web captures documented in STORYBOARD-ORIGINAL.md are reused. The phone and booking cards illustrate workflows; they are not new live captures. No customer records, credentials, unsupported performance claims or customer identity appear.

`NarfidIntro` opens this cut; `NarfidIntroOriginal` preserves the first version for comparison.
