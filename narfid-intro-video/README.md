# NARFID system introduction

A 60-second Arabic product introduction for club owners and managers. 1920 × 1080, 30 fps, nine editable scenes, original stereo music and synchronized sound effects, no voiceover.

## Preview

```powershell
cd F:/saas/narfid/narfid-intro-video
npm ci
npm run dev -- --port=3026
```

Select **NarfidIntro** for the new director cut, or **NarfidIntroOriginal** to compare the first version. Preview: http://localhost:3026/NarfidIntro while Studio is running.

## Edit

- `src/DirectorCut.tsx`: current scenes, copy, timing and sound cues.
- `src/director.css`: current visual direction; `src/Composition.tsx` and `src/style.css` preserve the original cut.
- `src/Root.tsx`: dimensions, frame rate and duration.
- `STORYBOARD.md`: scene plan, evidence and asset provenance.
- `scripts/make-director-audio.mjs`: current score and original effects; `scripts/make-soundtrack.mjs` preserves the original music generator.

Web screenshots use fictional demo data. The phone scene is a motion-design representation of verified mobile workflows. Credentials and live customer data are not required.

## Checks

```powershell
npm run lint
npm run build
```

## Export when needed

Use Studio's Render button, or:

```powershell
npx remotion render NarfidIntro out/narfid-intro.mp4
```

Remotion licensing terms: https://www.remotion.dev/license.
