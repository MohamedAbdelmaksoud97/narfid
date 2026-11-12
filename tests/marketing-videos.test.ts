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
import {
  signatureCorrelation,
  validateSignatureManifest,
  pcmFromWav,
  hasAuthorizedAudioReview,
} from "../scripts/marketing-video";

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
    assert.equal(video.scenes.at(-1)?.onScreen, sonicSignature.phrase);
    assert.equal(video.scenes.at(-1)?.message, "");
    assert.equal(video.scenes.at(-1)?.seconds, 3);
    for (const [index, scene] of video.scenes.entries()) {
      assert.ok(
        scene.onScreen &&
          (scene.message || index === video.scenes.length - 1) &&
          scene.visual &&
          scene.sound,
        video.id,
      );
      assert.equal("voiceover" in scene, false);
    }
    assert.ok(
      video.audience && video.goal && video.treatment && video.cta,
      video.id,
    );
    assert.ok(videoScript(video).includes(video.caption));
    assert.ok(!/NarfidIntro|NarfidMembersApp/.test(video.id));
  }
});
test("listening cannot be silently claimed or waived without explicit owner authorization", () => {
  assert.equal(hasAuthorizedAudioReview({}), false);
  assert.equal(hasAuthorizedAudioReview({ audioListened: false }), false);
  assert.equal(hasAuthorizedAudioReview({ audioListened: true }), true);
  assert.equal(
    hasAuthorizedAudioReview({ audioReviewWaivedByOwner: true }),
    false,
  );
  assert.equal(
    hasAuthorizedAudioReview({
      audioReviewWaivedByOwner: true,
      ownerAuthorization: " ",
    }),
    false,
  );
  assert.equal(
    hasAuthorizedAudioReview({
      audioListened: false,
      audioReviewWaivedByOwner: true,
      ownerAuthorization:
        "Owner explicitly instructed completion and publication without another review.",
    }),
    true,
  );
});

test("instrumental signature provenance does not require an invented voice identity or bypass approval", () => {
  const instrumental = {
    id: sonicSignature.id,
    kind: "instrumental",
    approved: true,
    provider: "original-synthesis",
    generator: "make-sonic-instrumental.mjs",
    rights: "Original score without external samples",
  };
  assert.doesNotThrow(() => validateSignatureManifest(instrumental));
  assert.throws(() =>
    validateSignatureManifest({ ...instrumental, approved: false }),
  );
  assert.throws(() =>
    validateSignatureManifest({ ...instrumental, generator: "" }),
  );
  assert.throws(() =>
    validateSignatureManifest({ ...instrumental, rights: "" }),
  );
  assert.throws(() =>
    validateSignatureManifest({ ...instrumental, kind: "unknown" }),
  );
  assert.throws(() =>
    validateSignatureManifest({ ...instrumental, kind: "voice" }),
  );
  assert.doesNotThrow(() =>
    validateSignatureManifest({
      ...instrumental,
      kind: "voice",
      voiceId: "selected-preset",
    }),
  );
});
test("audio verification reads streamed WAV output with metadata before an unknown-size data chunk", () => {
  const bytes = Buffer.alloc(42);
  bytes.write("RIFF", 0);
  bytes.writeUInt32LE(0xffffffff, 4);
  bytes.write("WAVE", 8);
  bytes.write("JUNK", 12);
  bytes.writeUInt32LE(3, 16);
  bytes.write("abc", 20);
  bytes.write("data", 24);
  bytes.writeUInt32LE(0xffffffff, 28);
  Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).copy(bytes, 32);
  assert.deepEqual(
    pcmFromWav(bytes),
    Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
  );
  assert.throws(() => pcmFromWav(Buffer.alloc(44)));
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
