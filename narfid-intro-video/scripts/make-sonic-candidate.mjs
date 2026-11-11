// Assemble the FIRST candidate only. Approval never follows from running this file.
// Usage: node scripts/make-sonic-candidate.mjs voice-mono-48k.wav output.wav
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createHash } from "node:crypto";

const [input, output] = process.argv.slice(2);
if (!input || !output)
  throw new Error("Pass the decoded voice WAV and output candidate WAV.");
const voice = readFileSync(resolve(input));
if (
  voice.toString("ascii", 0, 4) !== "RIFF" ||
  voice.toString("ascii", 8, 12) !== "WAVE"
)
  throw new Error("Expected a WAV file.");
let channels, rate, bits, data;
for (let offset = 12; offset + 8 <= voice.length; ) {
  const id = voice.toString("ascii", offset, offset + 4);
  const length = voice.readUInt32LE(offset + 4);
  if (id === "fmt ") {
    if (voice.readUInt16LE(offset + 8) !== 1)
      throw new Error("Expected integer PCM.");
    channels = voice.readUInt16LE(offset + 10);
    rate = voice.readUInt32LE(offset + 12);
    bits = voice.readUInt16LE(offset + 22);
  }
  if (id === "data") data = voice.subarray(offset + 8, offset + 8 + length);
  offset += 8 + length + (length % 2);
}
if (channels !== 1 || rate !== 48000 || bits !== 16 || !data)
  throw new Error("Convert input to mono PCM 16-bit, 48000 Hz first.");
const length = rate * 3;
const voiceOffset = Math.round(0.18 * rate);
if (voiceOffset + data.length / 2 > length - 0.12 * rate)
  throw new Error("The whole voice must fit without cropping or retiming.");
const left = new Float64Array(length),
  right = new Float64Array(length);
let voicePeak = 0;
for (let i = 0; i < data.length / 2; i++)
  voicePeak = Math.max(voicePeak, Math.abs(data.readInt16LE(i * 2) / 32768));
const voiceGain = Math.min(2.5, 0.56 / voicePeak);
for (let i = 0; i < data.length / 2; i++) {
  const sample = (data.readInt16LE(i * 2) / 32768) * voiceGain;
  left[i + voiceOffset] += sample;
  right[i + voiceOffset] += sample;
}
const tau = 2 * Math.PI;
const hz = (note) => 440 * 2 ** ((note - 69) / 12);
const note = (start, midi, gain, pan, decay) => {
  const startSample = Math.round(start * rate);
  for (let i = startSample; i < length; i++) {
    const t = (i - startSample) / rate;
    const tone =
      Math.sin(tau * hz(midi) * t) +
      0.18 * Math.sin(tau * hz(midi) * 2.003 * t) * Math.exp(-3 * t);
    const sample = gain * Math.min(1, t / 0.009) * Math.exp(-decay * t) * tone;
    left[i] += sample * Math.sqrt((1 - pan) / 2);
    right[i] += sample * Math.sqrt((1 + pan) / 2);
  }
};
// A compact open fifth rises into a warm major resolution. Original synthesis.
note(0.015, 62, 0.051, -0.35, 5.8);
note(0.19, 69, 0.039, 0.3, 5.3);
note(0.43, 74, 0.033, 0, 4.6);
note(1.85, 50, 0.014, -0.2, 2.7);
note(1.87, 57, 0.012, 0.2, 2.9);
note(1.9, 66, 0.011, 0.35, 3.3);
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
let peak = 0,
  squareSum = 0;
for (let i = 0; i < length; i++) {
  const fade = Math.min(
    1,
    i / (rate * 0.008),
    (length - 1 - i) / (rate * 0.15),
  );
  for (let ch = 0; ch < 2; ch++) {
    const sample = (ch === 0 ? left[i] : right[i]) * fade;
    if (Math.abs(sample) >= 1) throw new Error("Clipping detected.");
    peak = Math.max(peak, Math.abs(sample));
    squareSum += sample * sample;
    wav.writeInt16LE(Math.round(sample * 32767), 44 + i * 4 + ch * 2);
  }
}
mkdirSync(dirname(resolve(output)), { recursive: true });
writeFileSync(resolve(output), wav);
console.log(
  JSON.stringify(
    {
      file: resolve(output),
      duration: 3,
      sampleRate: rate,
      channels: 2,
      voiceDuration: data.length / 2 / rate,
      voiceOffset: 0.18,
      playbackRate: 1,
      peakDbFS: 20 * Math.log10(peak),
      rmsDbFS: 20 * Math.log10(Math.sqrt(squareSum / (length * 2))),
      sha256: createHash("sha256").update(wav).digest("hex"),
      approved: false,
    },
    null,
    2,
  ),
);
