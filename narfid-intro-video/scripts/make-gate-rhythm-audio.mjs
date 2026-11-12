import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const sampleRate = 48000;
const duration = 45;
const bpm = 132;
const beat = 60 / bpm;
const folder = new URL("../public/gates/rhythm-v6/", import.meta.url);
const work = new URL("../out/gate-rhythm-v6/", import.meta.url);
const ffmpeg = fileURLToPath(
  new URL(
    "../node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe",
    import.meta.url,
  ),
);
mkdirSync(folder, { recursive: true });
mkdirSync(work, { recursive: true });

const clamp = (value) => Math.max(0, Math.min(1, value));
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const sine = (cycles) => Math.sin(2 * Math.PI * cycles);
const stereo = (seconds) =>
  Array.from(
    { length: 2 },
    () => new Float32Array(Math.round(seconds * sampleRate)),
  );

let seed = 26119;
function noise() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2147483648 - 1;
}

function add(track, start, length, gain, pan, voice) {
  const offset = Math.round(start * sampleRate);
  const frames = Math.round(length * sampleRate);
  const left = gain * Math.sqrt((1 - pan) / 2);
  const right = gain * Math.sqrt((1 + pan) / 2);
  for (let i = 0; i < frames && offset + i < track[0].length; i++) {
    const t = i / sampleRate;
    const sample = voice(t) * clamp(t / 0.003) * clamp((length - t) / 0.025);
    track[0][offset + i] += left * sample;
    track[1][offset + i] += right * sample;
  }
}

function writeWave(path, track, peakDb) {
  const [left, right] = track;
  let peak = 0;
  for (let i = 0; i < left.length; i++) {
    peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  }
  const gain = 10 ** (peakDb / 20) / peak;
  const pcm = Buffer.alloc(44 + left.length * 4);
  pcm.write("RIFF", 0);
  pcm.writeUInt32LE(pcm.length - 8, 4);
  pcm.write("WAVEfmt ", 8);
  pcm.writeUInt32LE(16, 16);
  pcm.writeUInt16LE(1, 20);
  pcm.writeUInt16LE(2, 22);
  pcm.writeUInt32LE(sampleRate, 24);
  pcm.writeUInt32LE(sampleRate * 4, 28);
  pcm.writeUInt16LE(4, 32);
  pcm.writeUInt16LE(16, 34);
  pcm.write("data", 36);
  pcm.writeUInt32LE(left.length * 4, 40);
  for (let i = 0; i < left.length; i++) {
    pcm.writeInt16LE(Math.round(left[i] * gain * 32767), 44 + i * 4);
    pcm.writeInt16LE(Math.round(right[i] * gain * 32767), 46 + i * 4);
  }
  writeFileSync(path, pcm);
}

const kick = (t) =>
  sine(55 * t + 2.4 * (1 - Math.exp(-46 * t))) * Math.exp(-16 * t);
const rim = (t) =>
  (sine(385 * t) * 0.65 + sine(817 * t) * 0.35) * Math.exp(-70 * t);
function brushedNoise(decay) {
  let low = 0;
  let mid = 0;
  return (t) => {
    const white = noise();
    low += (white - low) * 0.19;
    mid += (white - mid) * 0.05;
    return (low - mid) * Math.exp(-decay * t);
  };
}
function pluck(note, decay = 10) {
  const frequency = hz(note);
  return (t) =>
    sine(frequency * t + 0.085 * sine(2 * frequency * t) * Math.exp(-23 * t)) *
    Math.exp(-decay * t);
}

const music = stereo(duration);
const chords = [
  { bass: 38, notes: [65, 69, 76] }, // Dm(add9)
  { bass: 36, notes: [64, 67, 74] }, // C(add9)
  { bass: 43, notes: [65, 69, 71] }, // G9
  { bass: 41, notes: [64, 67, 72] }, // Fmaj9
];
for (let bar = 0; bar * 4 * beat < 40; bar++) {
  const start = bar * 4 * beat;
  const { bass, notes } = chords[Math.floor(bar / 2) % chords.length];
  const bare = bar === 0 || bar === 12;
  const at = (offset) => start + offset * beat;

  for (const offset of bare ? [0] : [0, 1.5, 2.75]) {
    add(music, at(offset), 0.22, offset === 0 ? 0.34 : 0.23, 0, kick);
    add(music, at(offset) + 0.045, 0.25, 0.18, 0, pluck(bass, 7));
  }
  for (const offset of [1, 3]) {
    add(music, at(offset), 0.095, 0.09, 0.07, rim);
  }
  if (!bare) {
    for (const offset of [0.5, 1.78, 2.5, 3.55]) {
      add(music, at(offset), 0.08, 0.18, -0.18, brushedNoise(55));
    }
  }
  for (const [offset, index] of [
    [0.25, 0],
    [1, 1],
    [2.25, 2],
    [3.5, 1],
  ]) {
    if (at(offset) >= 39.85) continue;
    const note = notes[index];
    const pan = [-0.22, 0.16, 0.27][index];
    add(music, at(offset), 0.36, index === 2 ? 0.105 : 0.14, pan, pluck(note));
  }
}

for (const channel of music) {
  for (let i = Math.floor(39.65 * sampleRate); i < channel.length; i++) {
    channel[i] *= clamp((40 - i / sampleRate) / 0.35);
  }
}
// Resolve the existing musical motif as the logo appears.
for (const [offset, note, pan] of [
  [0, 50, 0],
  [0.22, 65, -0.16],
  [0.43, 69, 0.16],
  [0.65, 76, 0.12],
]) {
  add(music, 40 + offset, 1.55, 0.15, pan, pluck(note, 2.8));
}
const score = fileURLToPath(new URL("score.wav", work));
writeWave(score, music, -7.5);
execFileSync(ffmpeg, [
  "-v",
  "error",
  "-y",
  "-i",
  score,
  "-c:a",
  "libmp3lame",
  "-b:a",
  "256k",
  fileURLToPath(new URL("score.mp3", folder)),
]);

const sync = stereo(0.58);
const air = brushedNoise(1);
add(
  sync,
  0,
  0.46,
  0.45,
  -0.18,
  (t) => air(t) * Math.sin((Math.PI * t) / 0.46) ** 2,
);
add(sync, 0.28, 0.27, 0.48, 0.18, pluck(77, 15));
writeWave(new URL("sync.wav", folder), sync, -12);

const allow = stereo(0.42);
add(allow, 0, 0.25, 0.68, -0.08, pluck(74, 12));
add(allow, 0.095, 0.3, 0.68, 0.12, pluck(81, 10));
writeWave(new URL("allow.wav", folder), allow, -11);

const deny = stereo(0.28);
add(
  deny,
  0,
  0.26,
  0.8,
  0,
  (t) => sine(195 * t + 2.1 * (1 - Math.exp(-23 * t))) * Math.exp(-18 * t),
);
add(deny, 0, 0.09, 0.24, 0, rim);
writeWave(new URL("deny.wav", folder), deny, -12);

const log = stereo(0.26);
add(log, 0, 0.095, 0.58, -0.13, rim);
add(log, 0.065, 0.17, 0.56, 0.1, pluck(67, 22));
writeWave(new URL("log.wav", folder), log, -15);

writeFileSync(
  new URL("provenance.json", folder),
  JSON.stringify(
    {
      generator: "scripts/make-gate-rhythm-audio.mjs",
      bpm,
      durationSeconds: duration,
      source: "Original local synthesis; no third-party samples or speech",
    },
    null,
    2,
  ) + "\n",
);
