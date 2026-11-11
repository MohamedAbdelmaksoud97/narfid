// Original stereo foley and tonal cues for the members app film.
import { mkdirSync, writeFileSync } from "node:fs";

const output = new URL("../public/members/sound/", import.meta.url);
mkdirSync(output, { recursive: true });

const sampleRate = 48000;
const tau = 2 * Math.PI;
const frequency = (note) => 440 * 2 ** ((note - 69) / 12);
const smoothAttack = (time, length) =>
  Math.sin((Math.PI / 2) * Math.min(1, time / length)) ** 2;

let randomState = 831214;
let previousNoise = 0;
function texture() {
  randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
  const sample = randomState / 2147483648 - 1;
  const band = sample - previousNoise * 0.72;
  previousNoise = sample;
  return band;
}

function mallet(time, note, release) {
  if (time < 0) return 0;
  const phase = tau * frequency(note) * time;
  const partials =
    Math.sin(phase) +
    0.23 * Math.sin(phase * 2.007) * Math.exp(-time * 9) +
    0.11 * Math.sin(phase * 3.98) * Math.exp(-time * 20);
  return partials * smoothAttack(time, 0.011) * Math.exp(-time / release);
}

function tap(time) {
  return (
    Math.sin(tau * (138 * time + 0.85 * (1 - Math.exp(-time * 110)))) *
      smoothAttack(time, 0.002) *
      Math.exp(-time * 46) +
    0.15 * texture() * smoothAttack(time, 0.001) * Math.exp(-time * 145)
  );
}

function glide(time, duration) {
  const phase = time / duration;
  const envelope = Math.sin(Math.PI * phase) ** 2;
  const tone = Math.sin(tau * (89 * time + 96 * time ** 2));
  return (tone * 0.42 + texture() * 0.11) * envelope;
}

function writeCue(name, duration, mix, targetPeak) {
  const samples = Math.round(sampleRate * duration);
  const left = new Float32Array(samples);
  const right = new Float32Array(samples);
  let peak = 0;
  const reflection = Math.round(0.031 * sampleRate);
  for (let i = 0; i < samples; i++) {
    const time = i / sampleRate;
    const [main, pan] = mix(time);
    const tail = Math.min(1, (duration - time) / 0.045);
    left[i] =
      (main * Math.sqrt((1 - pan) / 2) + (right[i - reflection] ?? 0) * 0.13) *
      tail;
    right[i] =
      (main * Math.sqrt((1 + pan) / 2) + (left[i - reflection] ?? 0) * 0.11) *
      tail;
    peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  }

  const pcm = Buffer.alloc(44 + samples * 4);
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
  pcm.writeUInt32LE(samples * 4, 40);
  const gain = (32767 * targetPeak) / peak;
  for (let i = 0; i < samples; i++) {
    pcm.writeInt16LE(Math.round(left[i] * gain), 44 + i * 4);
    pcm.writeInt16LE(Math.round(right[i] * gain), 46 + i * 4);
  }
  writeFileSync(new URL(name + ".wav", output), pcm);
}

writeCue("reveal", 0.56, (time) => [glide(time, 0.56), 0.4 - 1.4 * time], 0.2);
writeCue("tap", 0.24, (time) => [tap(time), -0.36], 0.25);
writeCue(
  "payment",
  1.1,
  (time) => [
    mallet(time, 69, 0.14) + 0.8 * mallet(time - 0.43, 74, 0.15),
    time < 0.43 ? 0.4 : -0.4,
  ],
  0.22,
);
writeCue(
  "invoice",
  1.08,
  (time) => [
    0.46 * mallet(time, 62, 0.25) +
      0.85 * mallet(time - 0.08, 69, 0.22) +
      0.56 * mallet(time - 0.18, 74, 0.28),
    0,
  ],
  0.24,
);
writeCue(
  "freeze",
  0.88,
  (time) => [
    0.48 * tap(time) +
      0.76 * mallet(time - 0.06, 76, 0.25) +
      0.32 * mallet(time - 0.14, 81, 0.28),
    -0.26 + time * 0.32,
  ],
  0.24,
);
