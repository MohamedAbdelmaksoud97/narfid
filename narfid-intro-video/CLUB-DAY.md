# نرفد — يوم ناديك، بصورة أوضح

60 seconds · 1920×1080 · 30 fps · Arabic RTL · Tajawal · music and sound effects only.

Goal: show a club owner or operations manager how membership renewal, class reservations and collection can be followed in Narfid, then invite a demonstration.

The owner approved the eight-scene scenario, removed voiceover, and requested implementation. This is a separate composition; prior exports remain intact. It follows the original intro's product-led direction, using a dark opening/closing, pale mint product stage and purposeful screen close-ups. The UI-system skill is absent from this checkout; original Narfid assets and established project colors are reused.

| Time | Frames (end exclusive) | Message and picture | Sound |
| --- | --- | --- | --- |
| 0–6 | 0–180 | من جدّد؟ هل تأكّد الحجز؟ كم تحصّل؟ Arabic logo and readable sports-management descriptor. | Three tactile question accents; abstract room ambience; sparse original music. |
| 6–12 | 180–360 | ابدأ من مكان واحد. Actual subscriptions screen enters the composition. | Soft sweep and rounded settling accent. |
| 12–21 | 360–630 | من الاشتراك… إلى التجديد. Original subscription, real confirmation dialog and saved paid renewal with new dates. | Selection click, confirmation click, success after visible result. |
| 21–30 | 630–900 | الموعد. السعة. حالة الحجز. Real class slot, capacity and confirmed complimentary reservation. | Transition, selection and confirmation accents. |
| 30–39 | 900–1170 | فاتورتك واضحة → المحصّل والمتبقي أمامك. Real invoice, then camera and highlights emphasize its collection and balance. | Two restrained focus accents. |
| 39–47 | 1170–1410 | تفاصيل مترابطة. Three workflows shown together, connected editorially. | Three-note connection gesture. |
| 47–54 | 1410–1620 | تشغيل أوضح اليوم. أساس تقني ينمو معك غدًا. | Music thins; light sweep with second phrase. |
| 54–60 | 1620–1800 | Arabic logo, sports-management descriptor, احجز عرضًا توضيحيًا, www.narfid.com. Final three seconds held. | Three-note sonic ending; score fades to silence. |

## Captures and capability limits

All six screenshots were captured from a disposable local PGlite-backed instance, with real business services, SQL repositories, HTTP routes and Next BFF. See `public/club-day/provenance.json`. No production database, credentials or external integrations were accessed. Capture services and local session tokens remain under ignored `.private/video-runs/club-day/`.

Fictional members سلمان الحربي and خالد القحطاني, staff عبدالله العتيبي and فرع العليا are demonstration records. The real renewal flow creates a sale and invoice; payment was recorded through the local payment service before capturing the scheduled future term. The cut compresses those steps; it does not imply renewal becomes effective without payment. The class reservation is explicitly complimentary/operational. The SAR 1,000 membership invoice, SAR 650 collection and SAR 350 balance are a separate transaction, not the price of that class reservation. These numbers are not Narfid pricing or customer outcomes.

Camera movement, pointer, click ring and field highlights are editorial layers over the captured screens. Screenshots are not an uninterrupted screen recording. The actual reference frontend's display strings and date formatting are retained. Only Narfid identity, capture density and displayed legacy member-number prefixes were adapted. Source revisions are recorded in the manifest.

The built-in browser became unavailable. The owner explicitly authorized local Playwright capture and video review as the alternative. The browser blocked non-loopback requests and service workers; the backend/frontend launch also enforced loopback egress.

## Audio

`scripts/make-club-day-audio.mjs` creates an original deterministic stereo arrangement at 90 BPM and 48 kHz, plus individual room, question, click, focus, sweep, settle, success, connection and signature files. No samples, recordings, voices or third-party music are used. The score combines electric-piano-like synthesis, warm pads, restrained bass/percussion and a closing resolution. Music and every meaningful cue have independent editable timeline nodes in `src/club-day/Film.tsx`.

The WAV music master is reproducible and ignored by Git; the MP3 composition asset and small effect WAVs are retained. No voiceover or subtitles track exists.

## Edit and reproduce

Open `NarfidClubDay` in the existing Remotion Studio. Each scene is separately registered under `Club-Day-Scenes`. Source: `src/club-day/`.

```powershell
node scripts/make-club-day-audio.mjs
& node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe -y -i public/club-day/audio/score.wav -c:a libmp3lame -b:a 256k public/club-day/audio/score.mp3
npm run lint
npm run build
npx remotion render NarfidClubDay out/narfid-club-day.mp4 --codec=h264 --crf=18 --concurrency=2 --timeout=120000
& node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe -y -i out/narfid-club-day.mp4 -map 0:v:0 -map 0:a:0 -c:v copy -af 'loudnorm=I=-20:TP=-2:LRA=11:measured_I=-27.87:measured_TP=-12.31:measured_LRA=7.20:measured_thresh=-37.96:offset=-1.14:linear=true' -c:a aac -b:a 192k -ar 48000 -movflags +faststart out/narfid-club-day-master.mp4
```

The second-pass audio measurements above apply to this cut. Remeasure after changing audio. Mastering copies the H.264 picture stream and raises the audio without compressing its original dynamics.

## Delivery verification — November 14, 2026

- ESLint, TypeScript and Remotion bundling passed. Fifteen full-resolution composition frames were reviewed, including confirmation/result states and closing typography. Seven frames extracted from the delivered MP4 were also reviewed.
- Final file: `out/narfid-club-day-master.mp4`, 60.01 seconds (60-second picture plus AAC packet rounding), 1,800 H.264 frames, 1920×1080 at 30 fps, stereo AAC at 48 kHz, 7,544,273 bytes.
- Complete video/audio decode passed. Final audio measured **−20.02 LUFS integrated**, **−4.44 dBTP**, **7.30 LU loudness range**. Audio was measured, not audited by listening.
- Studio loaded the new composition without an error overlay and advanced during playback. Local Chromium also played the delivered MP4; playback verification is recorded in the ignored local QA folder.
- Local capture connection audit contained only `127.0.0.1` and `localhost`. Remotion's error-reporting origin was blocked during Studio review; no remote production endpoint was accessed.
- Export SHA-256: `34f0b3f74a6eaed4a9d451efdedeadde950c6cd39511f83dd010447b802eed08`.

Delivery stays local. This film is outside NV-001–NV-050; no board record, website upload or social publication is created.
