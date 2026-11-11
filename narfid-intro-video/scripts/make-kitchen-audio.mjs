// Original, deterministic, sample-free stereo effects for the kitchen journey.
import { mkdirSync, writeFileSync } from "node:fs";
const directory = new URL("../public/kitchen/", import.meta.url);
mkdirSync(directory, { recursive: true });
const rate = 48000,
  tau = 2 * Math.PI;
let seed = 81736;
const noise = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2147483648 - 1;
};
function wav(name, duration, sample) {
  const count = Math.ceil(duration * rate),
    channels = [new Float32Array(count), new Float32Array(count)];
  let peak = 0;
  for (let i = 0; i < count; i++) {
    const t = i / rate,
      fade = Math.min(1, t / 0.004, (duration - t) / 0.035);
    const [left, right] = sample(t, i);
    channels[0][i] = left * fade;
    channels[1][i] = right * fade;
    peak = Math.max(peak, Math.abs(channels[0][i]), Math.abs(channels[1][i]));
  }
  const gain = 0.46 / peak,
    b = Buffer.alloc(44 + count * 4);
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
  for (let i = 0; i < count; i++) {
    b.writeInt16LE(Math.round(channels[0][i] * gain * 32767), 44 + i * 4);
    b.writeInt16LE(Math.round(channels[1][i] * gain * 32767), 46 + i * 4);
  }
  writeFileSync(new URL(name + ".wav", directory), b);
}
wav("focus", 0.45, (t) => {
  const n = noise() * Math.exp(-24 * t) * 0.07;
  const v = Math.sin(tau * 185 * t) * Math.exp(-16 * t) * 0.6 + n;
  return [v, v * 0.92];
});
wav("click", 0.16, (t) => {
  const v =
    noise() * Math.exp(-150 * t) * 0.23 +
    Math.sin(tau * 290 * t) * Math.exp(-65 * t) * 0.45;
  return [v * 0.91, v];
});
let low = 0,
  high = 0;
wav("move", 0.75, (t) => {
  const n = noise();
  low += 0.018 * (n - low);
  high += 0.1 * (n - high);
  const v = (high - low) * Math.sin((Math.PI * t) / 0.75) ** 2;
  return [v * (1 - t / 1.5), v * (0.5 + t / 1.5)];
});
function bell(t, frequency) {
  if (t < 0) return 0;
  return (
    Math.min(1, t / 0.008) *
    Math.exp(-5.8 * t) *
    (Math.sin(tau * frequency * t) + 0.22 * Math.sin(tau * frequency * 2 * t))
  );
}
wav("ready", 1.1, (t) => [
  bell(t, 523.25) * 0.6 + bell(t - 0.12, 783.99) * 0.3,
  bell(t, 523.25) * 0.4 + bell(t - 0.12, 783.99) * 0.6,
]);
wav("complete", 1.4, (t) => [
  bell(t, 392) * 0.4 +
    bell(t - 0.12, 523.25) * 0.3 +
    bell(t - 0.24, 659.25) * 0.3,
  bell(t, 392) * 0.3 +
    bell(t - 0.12, 523.25) * 0.3 +
    bell(t - 0.24, 659.25) * 0.4,
]);
wav("closing", 3.5, (t) => {
  const tail = (time, f) =>
    time < 0
      ? 0
      : Math.min(1, time / 0.035) *
        Math.exp(-2.8 * time) *
        Math.sin(tau * f * time);
  return [
    tail(t, 196) * 0.42 +
      tail(t - 0.18, 293.66) * 0.3 +
      tail(t - 0.38, 392) * 0.28,
    tail(t, 196) * 0.3 +
      tail(t - 0.18, 293.66) * 0.28 +
      tail(t - 0.38, 392) * 0.42,
  ];
});
writeFileSync(
  new URL("audio-provenance.json", directory),
  JSON.stringify(
    {
      creator: "Original procedural synthesis for Narfid",
      generator: "scripts/make-kitchen-audio.mjs",
      sampleRate: rate,
      channels: 2,
      samples: "None; no external recordings, models, or paid services",
      rights: "Original project assets; no third-party sample license required",
      voiceover: false,
    },
    null,
    2,
  ) + "\n",
);
console.log("Generated six original stereo kitchen cues.");
