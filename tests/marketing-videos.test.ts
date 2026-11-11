import test from "node:test";
import assert from "node:assert/strict";
import {
  videoBriefs,
  suggestedVideoOrder,
} from "../lib/marketing/video-briefs";
import {
  sonicSignature,
  videoPillars,
  videoScript,
} from "../lib/marketing/video-plan";
import { validateVideoChange } from "../lib/marketing/video-validation";
import { signatureCorrelation } from "../scripts/marketing-video";

test("the approved campaign has fifty new distinct, fully timed production briefs", () => {
  assert.equal(videoBriefs.length, 50);
  assert.equal(new Set(videoBriefs.map((video) => video.id)).size, 50);
  assert.equal(new Set(videoBriefs.map((video) => video.title)).size, 50);
  assert.equal(new Set(videoBriefs.map((video) => video.caption)).size, 50);
  assert.equal(new Set(suggestedVideoOrder).size, 50);
  for (const pillar of videoPillars)
    assert.equal(
      videoBriefs.filter((video) => video.pillar === pillar.id).length,
      pillar.count,
    );
  for (const video of videoBriefs) {
    assert.match(video.id, /^NV-0\d{2}$/);
    assert.ok(
      video.durationSeconds >= 25 && video.durationSeconds <= 45,
      video.id,
    );
    assert.ok(video.scenes.length >= 5, video.id);
    assert.equal(video.scenes.at(-1)?.voiceover, sonicSignature.phrase);
    assert.equal(video.scenes.at(-1)?.seconds, 3);
    for (const scene of video.scenes) {
      assert.ok(
        scene.onScreen && scene.voiceover && scene.visual && scene.sound,
        video.id,
      );
      // A spoken scene needs space for Arabic delivery, not just a text slot.
      assert.ok(
        scene.voiceover.split(/\s+/).length / scene.seconds <= 3.5,
        `${video.id}: narration too dense`,
      );
    }
    assert.ok(
      video.audience && video.goal && video.treatment && video.cta,
      video.id,
    );
    assert.ok(videoScript(video).includes(video.caption));
    assert.ok(!/NarfidIntro|NarfidMembersApp/.test(video.id));
  }
});
test("board mutations reject unknown identities, stale revision formats and unverified ready states", () => {
  const change = {
    video_id: "NV-001",
    revision: 0,
    kind: "publication",
    platform: "instagram",
    published: true,
  };
  assert.equal(validateVideoChange(change).kind, "publication");
  for (const patch of [
    { video_id: "NV-000" },
    { video_id: "NV-051" },
    { platform: "tiktok" },
    { published: "true" },
    { revision: -1 },
    { revision: 1.5 },
    { revision: "0" },
  ])
    assert.throws(() => validateVideoChange({ ...change, ...patch }));
  assert.throws(() =>
    validateVideoChange({
      video_id: "NV-001",
      revision: 0,
      kind: "production",
      status: "ready",
    }),
  );
  assert.equal(
    validateVideoChange({
      video_id: "NV-001",
      revision: 0,
      kind: "production",
      status: "needs_revision",
    }).kind,
    "production",
  );
});
test("signature verification accepts the same master after gain change and rejects silence or another cue", () => {
  const make = (fn: (i: number) => number) => {
    const bytes = Buffer.alloc(96000);
    for (let i = 0; i < 48000; i++)
      bytes.writeInt16LE(Math.round(fn(i)), i * 2);
    return bytes;
  };
  const cue = make(
    (i) => 10000 * Math.sin(i * 0.15) + 4000 * Math.sin(i * 0.071),
  );
  const same = make(
    (i) => 5000 * Math.sin(i * 0.15) + 2000 * Math.sin(i * 0.071),
  );
  const other = make((i) => 10000 * Math.sin(i * 0.31));
  assert.ok(signatureCorrelation(same, cue) > 0.99);
  assert.ok(signatureCorrelation(other, cue) < 0.1);
  assert.equal(signatureCorrelation(Buffer.alloc(96000), cue), 0);
});
