// Original NV-001 score and tactile cues. No samples or external recordings.
// This is not the brand sonic master. The final three seconds stay separate.
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const rate = 48000;
const duration = 34;
const left = new Float64Array(rate * duration);
const right = new Float64Array(left.length);
const tau = Math.PI * 2;
let seed = 1001;
const noise = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2147483648 - 1;
};
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const add = (start, length, voice, pan = 0) => {
  const offset = Math.round(start * rate);
  for (let i = 0; i < length * rate && offset + i < left.length; i++) {
    const sample = voice(i / rate);
    left[offset + i] += sample * Math.sqrt((1 - pan) / 2);
    right[offset + i] += sample * Math.sqrt((1 + pan) / 2);
  }
};
const felt =
  (note, strength, decay = 2.2) =>
  (t) => {
    const fundamental = hz(note);
    const envelope = Math.min(1, t / 0.012) * Math.exp(-decay * t);
    return (
      strength *
      envelope *
      (Math.sin(tau * fundamental * t) +
        0.23 * Math.sin(tau * fundamental * 2.003 * t) * Math.exp(-2 * t) +
        0.07 * Math.sin(tau * fundamental * 3.99 * t))
    );
  };
// D minor -> Bb -> F -> C: warm support, sparse notes, no incessant ostinato.
const chords = [
  [50, 57, 60, 65],
  [46, 53, 57, 62],
  [53, 60, 64, 69],
  [48, 55, 60, 64],
];
for (let bar = 0; bar < 8; bar++) {
  const start = 4 + bar * 3.75;
  const chord = chords[bar % 4];
  const level = bar < 3 ? 0.024 : bar < 6 ? 0.031 : 0.022;
  chord.forEach((note, i) => {
    add(start + i * 0.047, 3.8, felt(note, level, 1.25), (i - 1.5) * 0.28);
    add(
      start + i * 0.047 + 0.23,
      3.2,
      felt(note + 12, level * 0.17, 1.8),
      (1.5 - i) * 0.3,
    );
  });
  add(start, 3.6, (t) => {
    const envelope = Math.sin(Math.PI * Math.min(1, t / 3.6)) ** 1.6;
    return (
      0.009 *
      envelope *
      (Math.sin(tau * hz(chord[0] - 12) * t) +
        0.18 * Math.sin(tau * hz(chord[0]) * t))
    );
  });
}
// A real musical change at the practical challenge; modest lift, then resolve.
add(27.1, 2.7, felt(74, 0.025, 1.8), -0.3);
add(28.2, 2.4, felt(72, 0.02, 1.8), 0.3);
add(30.4, 3.1, felt(69, 0.025, 1.45), -0.15);
add(31.5, 2.4, felt(65, 0.023, 1.3), 0.15);
// Clock pressure: three dry mechanical ticks, then a deliberate quiet hold.
for (const start of [0.2, 1.2, 2.2])
  add(
    start,
    0.09,
    (t) =>
      0.05 *
      Math.exp(-85 * t) *
      (noise() * 0.6 + 0.4 * Math.sin(tau * 1800 * t)),
    -0.2,
  );
// Subtle paper contacts tied to form reveals and each physical transfer.
for (const [start, pan] of [
  [4.5, 0.25],
  [6.5, 0.05],
  [8.6, -0.25],
  [14.6, 0.2],
  [16.8, -0.2],
  [21, 0.25],
  [22, -0.25],
]) {
  let smooth = 0;
  add(
    start,
    0.25,
    (t) => {
      smooth = smooth * 0.75 + noise() * 0.25;
      const e = Math.sin((Math.PI * t) / 0.25) ** 2;
      return smooth * 0.035 * e;
    },
    pan,
  );
  add(
    start + 0.12,
    0.09,
    (t) =>
      0.021 *
      Math.exp(-70 * t) *
      Math.sin(tau * (380 + 80 * Math.exp(-40 * t)) * t),
    pan,
  );
}
// Three individual review confirmations: softer and more resolved each time.
add(28.3, 0.65, felt(77, 0.042, 6), 0.2);
add(29.2, 0.65, felt(79, 0.038, 6), 0);
add(30.1, 0.9, felt(81, 0.035, 5), -0.2);
// Lightweight transition movement, only at the three editorial chapter changes.
for (const start of [3.82, 13.82, 26.82])
  add(start, 0.3, (t) => {
    const e = Math.sin((Math.PI * t) / 0.3) ** 2;
    return (
      0.018 * e * (noise() * 0.2 + 0.8 * Math.sin(tau * (130 - 60 * t) * t))
    );
  });
// Fade ending before signature. PCM stereo keeps headroom for the narration.
const buffer = Buffer.alloc(44 + left.length * 4);
buffer.write("RIFF", 0);
buffer.writeUInt32LE(buffer.length - 8, 4);
buffer.write("WAVEfmt ", 8);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(2, 22);
buffer.writeUInt32LE(rate, 24);
buffer.writeUInt32LE(rate * 4, 28);
buffer.writeUInt16LE(4, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(left.length * 4, 40);
let peak = 0;
for (let i = 0; i < left.length; i++) {
  const t = i / rate;
  const fade = Math.min(1, t / 0.02, Math.max(0, (33.85 - t) / 0.75));
  const l = left[i] * fade,
    r = right[i] * fade;
  peak = Math.max(peak, Math.abs(l), Math.abs(r));
  buffer.writeInt16LE(
    Math.round(Math.max(-1, Math.min(1, l)) * 32767),
    44 + i * 4,
  );
  buffer.writeInt16LE(
    Math.round(Math.max(-1, Math.min(1, r)) * 32767),
    46 + i * 4,
  );
}
const folder = fileURLToPath(new URL("../public/nv001/", import.meta.url));
mkdirSync(folder, { recursive: true });
writeFileSync(`${folder}/score.wav`, buffer);
console.log(
  `Original score: ${duration}s, stereo ${rate}Hz, peak ${(20 * Math.log10(peak)).toFixed(1)} dBFS`,
);
