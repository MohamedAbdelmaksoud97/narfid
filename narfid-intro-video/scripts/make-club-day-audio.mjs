// Original, deterministic composition and synthesis. No samples or speech.
import { mkdirSync, writeFileSync } from "node:fs";
const rate = 48000,
  seconds = 60,
  beat = 60 / 90;
const output = new URL("../public/club-day/audio/", import.meta.url);
mkdirSync(output, { recursive: true });
const sine = (phase) => Math.sin(2 * Math.PI * phase);
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const limit = (x) => Math.max(0, Math.min(1, x));
let seed = 20261113;
function noise() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2147483648 - 1;
}
function buffer(duration) {
  return [
    new Float64Array(Math.round(duration * rate)),
    new Float64Array(Math.round(duration * rate)),
  ];
}
function add(bus, start, duration, voice, gain = 1, pan = 0, attack = 0.008) {
  const offset = Math.round(start * rate),
    count = Math.round(duration * rate);
  for (let i = 0; i < count && offset + i < bus[0].length; i++) {
    const t = i / rate,
      value =
        voice(t) * gain * limit(t / attack) * limit((duration - t) / 0.06);
    bus[0][offset + i] += value * Math.sqrt((1 - pan) / 2);
    bus[1][offset + i] += value * Math.sqrt((1 + pan) / 2);
  }
}
function save(name, bus, peakDB = -6) {
  let peak = 0;
  for (const channel of bus)
    for (const value of channel) peak = Math.max(peak, Math.abs(value));
  const scale = 10 ** (peakDB / 20) / Math.max(peak, 1e-10);
  const wav = Buffer.alloc(44 + bus[0].length * 4);
  wav.write("RIFF");
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(2, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 4, 28);
  wav.writeUInt16LE(4, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(wav.length - 44, 40);
  for (let i = 0; i < bus[0].length; i++)
    for (let c = 0; c < 2; c++)
      wav.writeInt16LE(
        Math.round(Math.max(-1, Math.min(1, bus[c][i] * scale)) * 32767),
        44 + i * 4 + c * 2,
      );
  writeFileSync(new URL(name + ".wav", output), wav);
}
const score = buffer(seconds);
const chords = [
  [50, 57, 60, 64, 69],
  [46, 53, 57, 60, 65],
  [53, 60, 64, 67, 72],
  [48, 55, 59, 62, 67],
];
const piano = (midi) => (t) =>
  (sine(hz(midi) * t) +
    0.24 * sine(hz(midi) * 2 * t) * Math.exp(-3 * t) +
    0.08 * sine(hz(midi) * 3 * t) * Math.exp(-5 * t)) *
  Math.exp(-2.2 * t);
for (let bar = 0; bar * beat * 4 < 54; bar++) {
  const start = bar * beat * 4,
    chord = chords[Math.floor(bar / 2) % 4];
  const energy = start < 6 ? 0.45 : start < 39 ? 0.82 : start < 47 ? 1 : 0.5;
  chord.forEach((midi, i) => {
    add(
      score,
      start + i * 0.024,
      3.3,
      piano(midi),
      0.032 * energy,
      (i - 2) * 0.13,
      0.016,
    );
    add(
      score,
      start,
      3.5,
      (t) =>
        sine(hz(midi) * t) * Math.sin(Math.PI * Math.min(t / 3.5, 1)) ** 1.2,
      0.011 * energy,
      (i - 2) * 0.17,
      0.18,
    );
  });
  add(
    score,
    start,
    1.7,
    (t) => sine(hz(chord[0] - 12) * t) * Math.exp(-2.2 * t),
    0.065 * energy,
    0,
    0.012,
  );
  if (start >= 6 && start < 47) {
    add(
      score,
      start,
      0.24,
      (t) => sine(48 * t + 0.7 * (1 - Math.exp(-30 * t))) * Math.exp(-22 * t),
      0.04,
      0,
      0.006,
    );
    add(
      score,
      start + 2 * beat,
      0.2,
      (t) => sine(52 * t + 0.35 * (1 - Math.exp(-35 * t))) * Math.exp(-26 * t),
      0.025,
      0,
      0.006,
    );
  }
  if (start >= 12 && start < 47)
    for (let n = 1; n < 4; n++)
      add(
        score,
        start + n * beat,
        1.5,
        piano(chord[(n + bar) % 5] + 12),
        0.016,
        n % 2 ? 0.22 : -0.22,
        0.01,
      );
}
[50, 57, 60, 64, 74].forEach((midi, i) =>
  add(
    score,
    54 + i * 0.08,
    5.8 - i * 0.08,
    piano(midi),
    0.045,
    (i - 2) * 0.12,
    0.035,
  ),
);
for (let c = 0; c < 2; c++) {
  const delay = Math.round(rate * (c ? 0.31 : 0.25));
  for (let i = delay; i < score[c].length; i++)
    score[c][i] += score[c][i - delay] * 0.19;
  for (let i = 0; i < score[c].length; i++) {
    const t = i / rate;
    score[c][i] *= limit(t / 0.8) * limit((60 - t) / 2.2);
  }
}
save("score", score, -9);
for (const [name, freq] of [
  ["question-1", 196],
  ["question-2", 246.94],
  ["question-3", 293.66],
  ["click", 520],
  ["focus", 660],
]) {
  const bus = buffer(0.22);
  let low = 0;
  add(
    bus,
    0,
    0.18,
    (t) => {
      low += 0.16 * (noise() - low);
      return (sine(freq * t) + 0.25 * low) * Math.exp(-38 * t);
    },
    1,
    0,
    0.004,
  );
  save(name, bus, name.startsWith("question") ? -17 : -19);
}
const sweep = buffer(0.85);
let low = 0,
  slow = 0;
add(
  sweep,
  0,
  0.8,
  (t) => {
    const n = noise();
    low += 0.13 * (n - low);
    slow += 0.015 * (n - slow);
    return (low - slow) * Math.sin((Math.PI * t) / 0.8) ** 2;
  },
  1,
  -0.1,
  0.06,
);
add(
  sweep,
  0.38,
  0.44,
  (t) => sine(160 * t + 70 * t * t) * Math.exp(-7 * t),
  0.08,
  0.1,
  0.07,
);
save("sweep", sweep, -19);
const settle = buffer(0.45);
add(
  settle,
  0,
  0.42,
  (t) =>
    sine(110 * t) * Math.exp(-12 * t) +
    0.13 * sine(220 * t) * Math.exp(-18 * t),
  1,
  0,
  0.02,
);
save("settle", settle, -19);
const success = buffer(0.85);
add(success, 0, 0.55, piano(74), 1, -0.05);
add(success, 0.13, 0.66, piano(81), 0.7, 0.05);
save("success", success, -18);
const connect = buffer(1.4);
[62, 69, 74].forEach((midi, i) =>
  add(connect, i * 0.2, 1, piano(midi), 0.7, (i - 1) * 0.12),
);
save("connect", connect, -20);
const sonic = buffer(2.8);
[62, 69, 74].forEach((midi, i) =>
  add(sonic, i * 0.21, 2.25, piano(midi), 1, (i - 1) * 0.12, 0.012),
);
save("signature", sonic, -16);
// Abstract room air, with no sampled people or speech.
const ambience = buffer(7);
let room = 0;
add(
  ambience,
  0,
  7,
  (t) => {
    room += 0.025 * (noise() - room);
    return room * (0.6 + 0.4 * sine(0.13 * t) ** 2);
  },
  1,
  0,
  0.3,
);
save("room", ambience, -35);
writeFileSync(
  new URL("provenance.json", output),
  JSON.stringify(
    {
      createdOn: "2026-11-13",
      generator: "scripts/make-club-day-audio.mjs",
      originalComposition: true,
      bpm: 90,
      sampleRate: rate,
      channels: 2,
      externalSamples: false,
      voiceover: false,
      description:
        "Original warm electric-piano arrangement, restrained bass/percussion, interface accents and three-note sonic ending.",
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Generated original 60-second music and eleven editable effects/ambience assets.",
);
