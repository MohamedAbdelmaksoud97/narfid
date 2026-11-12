// Deterministic, original sample-free stereo gate cues. No speech or external services.
import { mkdirSync, writeFileSync } from "node:fs";
const dir = new URL("../public/gates/", import.meta.url);
mkdirSync(dir, { recursive: true });
const rate = 48000,
  tau = 2 * Math.PI;
let seed = 126031;
const noise = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2147483648 - 1;
};
function wav(name, duration, sample) {
  const count = Math.ceil(duration * rate),
    data = new Float32Array(count * 2);
  let peak = 0;
  for (let i = 0; i < count; i++) {
    const t = i / rate,
      [l, r] = sample(t),
      fade = Math.max(0, Math.min(1, t / 0.008, (duration - t) / 0.06));
    data[2 * i] = l * fade;
    data[2 * i + 1] = r * fade;
    peak = Math.max(peak, Math.abs(l * fade), Math.abs(r * fade));
  }
  const b = Buffer.alloc(44 + count * 4);
  b.write("RIFF");
  b.writeUInt32LE(b.length - 8, 4);
  b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(2, 22);
  b.writeUInt32LE(rate, 24);
  b.writeUInt32LE(rate * 4, 28);
  b.writeUInt16LE(4, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36);
  b.writeUInt32LE(count * 4, 40);
  for (let i = 0; i < data.length; i++)
    b.writeInt16LE(Math.round((data[i] / peak) * 0.45 * 32767), 44 + i * 2);
  writeFileSync(new URL(name + ".wav", dir), b);
}
const tone = (t, f) =>
  t < 0 ? 0 : Math.sin(tau * f * t) * Math.exp(-7 * t) * Math.min(1, t / 0.012);
wav("allow", 0.85, (t) => [
  tone(t, 660) * 0.6 + tone(t - 0.11, 880) * 0.4,
  tone(t, 660) * 0.4 + tone(t - 0.11, 880) * 0.6,
]);
wav("deny", 0.8, (t) => [
  tone(t, 270) * 0.4 + tone(t - 0.18, 220) * 0.4,
  tone(t, 270) * 0.38 + tone(t - 0.18, 220) * 0.42,
]);
wav("sync", 1, (t) => [
  tone(t, 392) * 0.5 +
    tone(t - 0.16, 523.25) * 0.3 +
    tone(t - 0.3, 659.25) * 0.2,
  tone(t, 392) * 0.3 +
    tone(t - 0.16, 523.25) * 0.3 +
    tone(t - 0.3, 659.25) * 0.4,
]);
let low = 0;
wav("gate", 0.95, (t) => {
  low += 0.02 * (noise() - low);
  const env = Math.sin((Math.PI * t) / 0.95) ** 2;
  const v = (low * 0.35 + Math.sin(tau * (80 * t + 15 * t * t)) * 0.035) * env;
  return [v * 0.9, v];
});
writeFileSync(
  new URL("audio-provenance.json", dir),
  JSON.stringify(
    {
      creator: "Original procedural synthesis for Narfid",
      generator: "scripts/make-gate-audio.mjs",
      sampleRate: rate,
      channels: 2,
      externalSamples: false,
      voiceover: false,
      rights: "Original project assets; no third-party recordings",
      reusedCues:
        "Original kitchen focus, click, move, ready and instrumental closing",
      audioListened: false,
    },
    null,
    2,
  ) + "\n",
);
console.log("Four original stereo gate effects generated.");
