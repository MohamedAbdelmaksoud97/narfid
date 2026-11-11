# OpenAI video references for narfid

## Product clips

`OrbitStudy` is a 13-second Narfid experiment based on [OpenAI's LifeVal post](https://x.com/OpenAI/status/2117307611338997846). The reference places a central title on a fine grid while colorful objects orbit around it. This experiment uses a dark grid and AI-generated sports objects as a four-object sprite. The final three seconds use the existing instrumental signature. It is an initial visual approximation; the reference audio was muted during inspection.

`OrbitFilm` extends the treatment to 15 seconds. It retains the Narfid visual end card and uses a different, effects-only mix authored from original `booking-study/effects.wav` cues. The owner clarified that each video's sound can differ while the visual ending remains consistent. The reference and final mix were not reviewed by ear in this environment.

| Original | Observed in the release |
| --- | --- |
| [Businesses in ChatGPT on @OpenAI](https://x.com/OpenAI/status/2120216592395174382) · 0:49 | Around 0:07, a single centered confirmation card fills the scene, with a blue check and the pointer beside the next action. Around 0:11 the frame isolates the business description and contact form. The viewer sees one step per framing. |
| [Codex browser-use demo on @OpenAIDevs](https://x.com/OpenAIDevs/status/2047381283358355706) · 0:20 | The interface is already visible at 0:00. A tighter crop makes the prompt legible around 0:02. The view returns to the whole window as the onboarding form moves through a sequence of choices. The review state is visible from about 0:14 through the end. The published MP4 has a video stream only. |
| [Introducing ChatGPT Work on @OpenAI](https://x.com/OpenAI/status/2075274271845404744) · 1:40 | Sparse type cards introduce groups of actions. A tight input crop at about 0:44 is followed by a wider desktop view showing a generated lamp image around 0:48. Around 1:00–1:12 a presentation and the assistant occupy the same window. Around 1:16 the film switches to a phone. Measured audio level rises around 0:46 between the input and result frames. |
| [ChatGPT Images 2.6 on @OpenAI](https://x.com/OpenAI/status/2118124944928432327) · 0:35 | The composer opens the clip. An isolated prompt and result are visible around 0:03, and rows of output cards follow. The screen clears to short closing copy around 0:30 and the product name around 0:33. The measured audio level drops around 0:16–0:18 and tapers during the last second. |

The second viewing of [Businesses in ChatGPT](https://x.com/OpenAI/status/2120216592395174382) focused on the sequence. The opening frames one offer. The business setup section shows a claim confirmation and moves through the business fields. A brief title introduces customer questions, and the next sequence shows a specific shopping question in the chat interface. The interface carries the action between titles. The second viewing of [ChatGPT Images 2.6](https://x.com/OpenAI/status/2118124944928432327) shows the same emphasis on output in two different compositions: three images early in the film and a staggered row of animated results later. These are visual observations. The sound process below describes Studio Dumbar's separate brand film.

For another interface-framing example, the Atlas launch film shifts from the full browser window to a close crop of the page and assistant pane around 0:24. Short text cards at about 0:43 and 0:51 mark new examples. [Introducing ChatGPT Atlas on OpenAI’s YouTube channel](https://www.youtube.com/watch?v=Ej6hnsQgV_c)

## Documented sound and motion process

`BrandMotionStudy` explores identity elements, typography and synchronized sound informed by Studio Dumbar's OpenAI brand film. `ClubMomentStudy` explores a club-use story inspired by the [With ChatGPT campaign](https://www.oneclub.org/awards/theoneshow/-award/64124/with-chatgpt/). Its opening is an AI-generated still of fictional people, animated with a camera move. The remaining reservation sequence reuses the fictional fixture-based capture and original effects described in `NV001.md`; it does not depict a real customer or a live recording.

The 13-second `ClubStoryStudy` explores an additional direction after the owner rejected the previous overview study. In [OpenAI's Cyber at the Frontier post](https://x.com/OpenAI/status/2120202353907486826), the film alternates a speaker with footage of people working together. The Narfid study uses one AI-generated still of fictional club staff and a dark bookings capture with fictional fixture data. Its camera movement is animated over the still. The staff are illustrative and are not presented as Narfid customers. The study reuses locally synthesized effects and the existing Narfid signature.

For the OpenAI brand film, Studio Dumbar describes introducing one identity element at a time with smooth transitions and natural pacing. The studio designed subtle audio feedback inspired by human interactions, synchronized it with animations, and introduced new layers of sound alongside new visual elements. This is the studio’s account of the brand film’s production. [Studio Dumbar case study](https://studiodumbar.com/work/openai-brand-film) · [Studio’s film upload](https://vimeo.com/1122006941)

## Application to narfid

`NarfidBookingStudy` applies the framing and synchronized sound approach to a 10.5-second vertical study. The visual uses the dark bookings screen with fictional reservation `RSV-DEMO-01` from [the original intro](STORYBOARD-ORIGINAL.md). The cursor and focus treatment are editorial overlays that draw attention to the existing confirmed status. The enlarged status graphic reproduces that status for phone-size legibility.

| Time | Picture | Sound |
| --- | --- | --- |
| 0:00–0:01.80 | The question «الحجز مؤكّد؟» and the sports-management descriptor appear over a crop of the bookings view. | Short impact and filtered air texture. |
| 0:01.80–0:05.30 | The edit opens to the bookings table. A cursor approaches the status badge, the padel booking row comes into focus and the frame pushes in. | Weight on the cut, then a dry click on the row highlight at frame 116 and a brief texture as the frame moves. |
| 0:05.30–0:07.50 | A large confirmation badge and the court label hold on screen. | A short resonant impact for the confirmation reveal, with a small second accent as the court label appears. |
| 0:07.50–0:10.50 | Narfid logo and sports-management descriptor. | Existing three-second Narfid instrumental signature, unchanged. |

The study uses original synthesized effects made for Narfid, no external audio samples, and the existing [signature master](../content/marketing/audio/signature.json). There is no voiceover or continuous music bed. `node scripts/make-booking-study-effects.mjs` regenerates the effect track. Render with `npx remotion render NarfidBookingStudy out/narfid-booking-study.mp4 --codec=h264 --crf=18 --concurrency=2` from `narfid-intro-video`.
