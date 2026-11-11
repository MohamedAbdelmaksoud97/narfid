// Original three-second NARFID motif. No voice, samples or external assets.
// The file remains a candidate until the owner approves the actual audio.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createHash } from "node:crypto";

const output = resolve(
  process.argv[2] ?? "out/narfid-sonic-instrumental-candidate.wav",
);
const rate = 48000,
  seconds = 3,
  length = rate * seconds;
const left = new Float64Array(length),
  right = new Float64Array(length);
const tau = Math.PI * 2;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const mallet = (start, midi, gain, pan, decay) => {
  const offset = Math.round(start * rate);
  for (let i = offset; i < length; i++) {
    const t = (i - offset) / rate;
    const attack = Math.min(1, t / 0.006);
    const tone =
      Math.sin(tau * hz(midi) * t) +
      0.24 * Math.sin(tau * hz(midi) * 2.003 * t) * Math.exp(-5 * t) +
      0.055 * Math.sin(tau * hz(midi) * 4.01 * t) * Math.exp(-9 * t);
    const value = gain * attack * Math.exp(-decay * t) * tone;
    left[i] += value * Math.sqrt((1 - pan) / 2);
    right[i] += value * Math.sqrt((1 + pan) / 2);
  }
};
// Open fifth and octave: a distinct rising identity, then a soft grounded resolve.
mallet(0.025, 62, 0.24, -0.32, 4.7);
mallet(0.255, 69, 0.21, 0.28, 4.1);
mallet(0.565, 74, 0.25, 0, 3.7);
mallet(0.96, 50, 0.11, -0.15, 2.1);
mallet(0.98, 57, 0.085, 0.2, 2.3);
mallet(1.02, 66, 0.073, 0.35, 2.5);
// Quiet stereo echoes belong to the motif, not a separate music bed.
mallet(0.825, 74, 0.035, -0.55, 4.3);
mallet(1.085, 74, 0.019, 0.55, 4.3);
const wav = Buffer.alloc(44 + length * 4);
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
wav.writeUInt32LE(length * 4, 40);
let sourcePeak = 0;
for (let i = 0; i < length; i++)
  sourcePeak = Math.max(sourcePeak, Math.abs(left[i]), Math.abs(right[i]));
const gain = 0.63 / sourcePeak;
let peak = 0,
  squares = 0;
for (let i = 0; i < length; i++) {
  const fade = Math.min(1, i / (rate * 0.004), (length - 1 - i) / (rate * 0.3));
  for (let ch = 0; ch < 2; ch++) {
    const value = (ch === 0 ? left[i] : right[i]) * gain * fade;
    if (Math.abs(value) >= 1) throw new Error("Clipping detected.");
    peak = Math.max(peak, Math.abs(value));
    squares += value * value;
    wav.writeInt16LE(Math.round(value * 32767), 44 + i * 4 + ch * 2);
  }
}
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, wav);
console.log(
  JSON.stringify(
    {
      file: output,
      kind: "instrumental",
      duration: seconds,
      sampleRate: rate,
      channels: 2,
      peakDbFS: 20 * Math.log10(peak),
      rmsDbFS: 20 * Math.log10(Math.sqrt(squares / (length * 2))),
      sha256: createHash("sha256").update(wav).digest("hex"),
      approved: false,
    },
    null,
    2,
  ),
);
