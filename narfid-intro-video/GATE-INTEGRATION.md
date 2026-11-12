# نرفد — اشتراكه انتهى… وش يصير عند البوابة؟

45 seconds · 1920 × 1080 · 30 fps · Arabic RTL · locally bundled Tajawal · ambient synthesized music · no voiceover.

Purpose: show a club manager the connection between subscription eligibility, a compatible gate's synchronized controller permissions, and the recorded access event.

Main composition: `NarfidGateIntegration`. Parent timeline: `src/gates/Film.tsx`. Every substantial scene is authored separately and registered as a connected composition under `Gate-Integration-Scenes`. The standalone registrations use the same dimensions, frame rate and scene durations as the parent. Earlier films remain intact. This is the standalone scenario requested in chat; it has no marketing campaign ID and does not publish to social accounts.

## Storyboard

| Time | Picture | Message / sound |
| --- | --- | --- |
| 0–5 | Fictional member approaches a closed gate; restrained camera move on generated scene. Original Arabic logo and sports-management descriptor. | «اشتراكه انتهى… وش يصير عند البوابة؟» Soft movement cue. |
| 5–11 | Real local membership UI, focused on the active facility-access subscription, dates and usage. | «قرار الدخول يبدأ من حالة الاشتراك.» Focus cue. |
| 11–18 | Real registered controller panel connects to a motion-design gate representation. | «اربط صلاحية الدخول بسياسة ناديك.» Synchronization cue. |
| 18–26 | Two explicitly fictional member cases: eligible, then expired. Gate representation opens, then remains closed. | Eligibility follows the synchronized policy. Distinct gentle allow/deny cues and a short original motor-like effect. |
| 26–34 | Real local event log, showing the same two fictional members and the persisted controller/system results. | «ولفريقك… سجل يوضح ما حدث.» Focus and detail cues. |
| 34–40 | Gate and three staged steps. | Check compatibility, define policy, test the integration. |
| 40–45 | Established Arabic Narfid end card, sports-management descriptor, official domain and scope note. | «شاركنا موديل جهازك لتقييم التوافق.» Original instrumental closing. |

## Evidence and media provenance

- Capability evidence: `../docs/platform-backend-audit.md`, the reference access-device service, gateway routes, controller bridge documentation and actual access-control UI.
- Reference web revision: `d3efa7e870e143539e35a4c86cdd1f8b0b7e0d87`; backend revision: `80ec3c75d13bdcae26c2cee9d27b4a6423b8f546`.
- Actual interface captures: `public/gates/membership.png` and `public/gates/control.png`. These are still UI captures; the editorial lens moves are authored in Remotion, not a continuous screen recording. The second image provides both the device-panel and event-log views.
- Capture environment: disposable source copies under `.private/video-runs/gate-integration`. In-memory PGlite, versioned local migrations, real SQL repositories, subscription evaluation, access-credential registration, gateway ingestion, Express routes and Next BFF. Authentication uses a test-only random-token verifier. Socket/fetch egress is restricted to loopback; the frontend has a local-only CSP and disables service workers. No hosted database, customer records, remote credentials, linked metadata, physical bridge or external delivery adapters are used.
- Fictional club: نادي المسار الرياضي, فرع العليا. Fictional members: سلمان الحربي (active facility-access subscription; controller PIN 4101) and خالد القحطاني (expired facility-access period; PIN 4102). These names and quantities are demonstration data, not customer outcomes. Member-number prefixes are omitted only in the disposable display copy.
- The real sync-plan service independently returned `enabled: true` for the active member and `enabled: false` for the expired member. Simulated controller messages, sent through the real local gateway, produced persisted `SYSTEM_ACCEPTED` and `DEVICE_DENIED` events. A real physical controller was **not** connected. There is no biometric enrollment or remote door-open command in the film.
- The local resource seed was completed with real activity/service relationships before final capture; the optional contract lookup then succeeded. Local capture CSS only changes density and identity, without changing the workflow. Original reference repositories and their configuration remain untouched.
- `public/gates/entrance.png` is a built-in ImageGen illustration, created for this film. It shows a fictional Arab-looking adult in modest sportswear at a fictional club entrance; it is not a customer photograph. No stock nationality or customer relationship is claimed. The SVG gate is an editorial representation, not a product capture.
- Original Narfid Arabic logo and existing project brand colors are reused. The full UI-system skill is absent in this checkout; its available `supabase.DESIGN.md`, existing brand tokens and prior approved films supply the visual reference.
- Asset-level provenance and the image-generation prompt are in `public/gates/provenance.json`.

## Scope and sound

The integration is offered after compatibility assessment, with separately agreed scope and cost. Existing evidence concerns the ZKTeco ACP-260 implementation; this film does not promise all-vendor support, immediate synchronization or inclusion in standard subscriptions. It distinguishes the controller's decision from the system's attendance result.

The current soundtrack is a single original synthesized ambient track with gradual harmonic changes and no separate effects or voiceover. It is generated by `scripts/make-gate-ambient-v5.mjs`, placed on the Remotion timeline in `src/gates/Soundtrack.tsx`, and documented in `public/gates/ambient-v5/provenance.json`. Previous cuts remain available; see [GATE-SOUND-DESIGN.md](GATE-SOUND-DESIGN.md) for their history.

Direct listening is unavailable in this agent session and was disclosed to the owner. **audioListened is false**; numerical checks do not replace listening, and no waiver is inferred.

## Reproduce

```powershell
npm run lint
npm run build
node scripts/make-gate-studio-audio.mjs
node scripts/render-gate-sound-design.mjs --name narfid-gate-integration-new-sound
```

QA images, the rendered MP4, compiled bundles, test sessions and connection logs stay in ignored output/private folders. Editable source, approved fictional imagery, original sounds and this documentation belong in Git.

## Original effects-only delivery

`out/narfid-gate-integration.mp4` contains 1,350 H.264 8-bit 4:2:0 frames at 1920 × 1080 / 30 fps, plus AAC stereo at 192 kb/s. Container duration including AAC padding: 45.013 seconds. Size: 7,406,128 bytes. Full FFmpeg video/audio decode passed; render browser errors were empty. Lint/type checking and the production bundle passed. Ten delivery-size frames and four frames extracted from the final MP4 were reviewed for Arabic shaping, text, framing and states.

The final mix measures −23.26 LUFS integrated and −10.59 dBTP true peak. Sparse effects leave reading time; there is no measured clipping. Listening review remains outstanding. Studio playback controls and key moments were exercised; the in-app browser's background scheduling limited continuous real-time playback review. Studio reported no composition error.

SHA-256: `5C76BAF4BA2860E9DD07F189ABF1AC37DE6F145113674F33788013C6A8A3A30C`.
