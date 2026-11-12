// Original deterministic arrangement and synthesis. No recordings or licensed samples.
import { mkdirSync, writeFileSync } from "node:fs";
const rate = 48000;
const seconds = 48;
const channels = [
  new Float64Array(rate * seconds),
  new Float64Array(rate * seconds),
];
const beat = 60 / 112;
const chords = [
  [50, 57, 60, 64],
  [48, 55, 59, 62],
  [46, 53, 57, 60],
  [48, 55, 60, 62],
];
const frequency = (midi) => 440 * 2 ** ((midi - 69) / 12);
function note(start, duration, midi, gain, pan = 0, bass = false) {
  const hz = frequency(midi);
  for (
    let i = 0;
    i < duration * rate && i + Math.floor(start * rate) < channels[0].length;
    i++
  ) {
    const t = i / rate;
    const env =
      Math.min(1, t / 0.009) *
      Math.exp(-t * (bass ? 3.5 : 2.7)) *
      Math.min(1, (duration - t) / 0.1);
    const wave =
      Math.sin(2 * Math.PI * hz * t) +
      0.2 * Math.sin(2 * Math.PI * hz * 2 * t) * Math.exp(-t * 6) +
      0.07 * Math.sin(2 * Math.PI * hz * 3 * t);
    const at = i + Math.floor(start * rate);
    channels[0][at] += wave * env * gain * Math.sqrt((1 - pan) / 2);
    channels[1][at] += wave * env * gain * Math.sqrt((1 + pan) / 2);
  }
}
for (let b = 0; b * beat < 43; b++) {
  const start = b * beat;
  const chord = chords[Math.floor(b / 8) % chords.length];
  const sparse = start > 20 && start < 23;
  if (b % 2 === 0)
    note(start, beat * 1.8, chord[0] - 12, sparse ? 0.028 : 0.047, 0, true);
  note(start, 1.8, chord[b % 4] + 12, 0.03, b % 2 ? 0.25 : -0.25);
  if (!sparse && b % 2)
    note(start + beat * 0.5, 1.2, chord[(b + 1) % 4] + 12, 0.015, -0.32);
  // A restrained rounded kick and deterministic soft tick, rather than a loud drum loop.
  if (b % 2 === 0 && start > 5) {
    for (let i = 0; i < rate * 0.18; i++) {
      const t = i / rate;
      const at = Math.floor(start * rate) + i;
      const value =
        Math.sin(2 * Math.PI * (45 * t + 0.65 * (1 - Math.exp(-30 * t)))) *
        Math.exp(-t * 30) *
        0.055;
      channels[0][at] += value;
      channels[1][at] += value;
    }
  }
}
// Resolve the closing on Dm(add9), with room for the invitation to hold.
[50, 57, 60, 64, 74].forEach((midi, i) =>
  note(42.75 + i * 0.08, 4.7, midi, 0.03, (i - 2) * 0.15),
);
// Small stereo delays create space without a wash of sustained high frequencies.
for (let c = 0; c < 2; c++) {
  const delay = Math.floor(rate * (c ? 0.29 : 0.23));
  for (let i = delay; i < channels[c].length; i++)
    channels[c][i] += channels[c][i - delay] * 0.17;
}
const wav = Buffer.alloc(44 + rate * seconds * 4);
wav.write("RIFF", 0);
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
let peak = 0;
for (let i = 0; i < rate * seconds; i++) {
  const t = i / rate;
  const fade = Math.min(1, t / 0.6, (seconds - t) / 2.5);
  for (let c = 0; c < 2; c++) {
    const value = Math.tanh(channels[c][i] * 2.1) * fade;
    peak = Math.max(peak, Math.abs(value));
    wav.writeInt16LE(Math.round(value * 32767), 44 + i * 4 + c * 2);
  }
}
const output = new URL("../public/product-launch/", import.meta.url);
mkdirSync(output, { recursive: true });
writeFileSync(new URL("score.wav", output), wav);
console.log(
  JSON.stringify({
    seconds,
    sampleRate: rate,
    channels: 2,
    peakDBFS: 20 * Math.log10(peak),
  }),
);
