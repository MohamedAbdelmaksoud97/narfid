# تكامل بوابات الدخول — الموسيقى والتصميم الصوتي

Current composition: `NarfidGateIntegration`. 45 seconds, 1920 × 1080, 30 fps, stereo, no speech. This implements the owner's approved preliminary sound treatment without changing the film's picture or editorial timing.

## Musical direction

Original electronic underscore at **96 BPM**. A warm stereo pad, soft harmonic plucks and a centered bass pulse establish the opening. Restrained kick, dry rim and filtered shaker arrive with the synchronization sequence. The rejected-access case has a short rhythmic pause; the log sequence is quieter. The compatibility steps lift the phrase, then percussion stops at 40 seconds and a separate three-note F–C–F instrumental signature settles under the Narfid end card.

Harmony moves through D minor/add9, Bb major9, F major9 and C add9, resolving in F. The score ducks approximately **4 dB** around the eleven key focus, synchronization, decision, review and closing cues; the ducks are authored in the generated music source with smooth attacks and releases. The independent sound effects remain editable in the Remotion timeline.

All musical material and Foley are deterministic synthesis in `scripts/make-gate-sound-design.mjs`. There are no imported samples, stock recordings, generated voices, external services or third-party musical references. The room, footsteps and gate motor are designed representations rather than field recordings or evidence of physical hardware operation. Rights/provenance: `public/gates/sound-design-v2/provenance.json`.

## Cue sheet

| Start | Sound | Purpose |
| --- | --- | --- |
| 0.00 | Original 45-second music bed | Arc from curiosity to connection and resolution |
| 0.15 | Soft stereo movement | Question reveal |
| 0.20 | Quiet reception atmosphere | Club context, fades into the system scene |
| 0.80 / 1.57 | Two restrained footsteps | Fictional approach to the gate |
| 5.00 | Low tactile focus | Subscription state |
| 7.20 | Soft touch | Validity period |
| 10.80 | Stereo movement | Transition to the compatible controller |
| 13.30 | Three rising, gently panned notes | Eligibility synchronization |
| 18.80 | Two ascending notes | Allowed access |
| 19.00 | Short motor and latch | Gate-opening animation |
| 22.00 | Softer motor and latch | Gate closes after the first member |
| 22.60 | Two lower, descending notes | Expired access, without an alarm |
| 26.00 | Tactile focus | Event-log reveal |
| 30.00 | Soft touch | Reviewing the result |
| 34.50 / 35.70 | Two distinct confirmation instances | Compatibility and policy steps |
| 37.00 | Resolved confirmation | Integration test step |
| 40.40 | Original three-note signature with finite reflections | Narfid closing, fades out by 44.8 seconds |

Frame quantization follows the composition's 30 fps. Every clip has its own JSX node in `src/gates/Soundtrack.tsx`. The score and twelve effect assets are bundled locally under `public/gates/sound-design-v2`.

## Build and delivery

```powershell
node scripts/make-gate-sound-design.mjs
npm run lint
node scripts/render-gate-sound-design.mjs
```

The renderer bundles the updated composition, renders its actual audio timeline to PCM and exports the new MP4 and a separate MP3 mix. Without `--picture` it renders the full film. For this sound-only revision, `--picture out/narfid-gate-integration.mp4` copied the verified original H.264 picture stream and replaced the audio. The original export is preserved. SHA-256 hashes match for all 1,350 old and new video packets, verifying identical picture frames.

Current deliverables:

- `out/narfid-gate-integration-sound-design.mp4`: 45.000 seconds, H.264 1920 × 1080 / 30 fps, 1,350 video frames, AAC stereo at 256 kb/s, 7,775,799 bytes.
- `out/narfid-gate-sound-design.mp3`: the complete music/effects mix at 320 kb/s.
- `out/gate-sound-design/gate-final-mix.wav`: 48 kHz stereo PCM source mix.

Lint/type checking and the updated production bundle passed. The renderer reported no composition browser errors. Full decode of the final video/audio passed. Measured mix: **−19.75 LUFS integrated**, **−7.22 dBTP true peak**, **2.5 LU loudness range**. Stereo correlation is 0.897, DC is below 0.000006 on both channels and the final 150 ms measure −95.34 dBFS RMS. There is no measured clipping; space remains for the focused effects. The score and final cue fade before the end rather than being cut mid-tail.

Direct listening remains unavailable; **audioListened is false**. The limitation was disclosed before the owner explicitly instructed «نفذ» to execute the written sound plan. This authorizes delivery with technical verification; it does not turn it into a completed listening review. Studio loaded the new music/effect assets and its playback controls were exercised. No external publication is performed.

MP4 SHA-256: `8d92ea9ab6c1c7303bb535282c7e451afa2667cc18e5e8ccda56d050f373a84b`.

Exports, source PCM intermediates and measurement/QA output remain ignored. Editable score/sound generators, the timeline and local production assets are versioned.
