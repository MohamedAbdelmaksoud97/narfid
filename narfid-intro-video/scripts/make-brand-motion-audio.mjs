// Original synthesized sound design; no recordings, samples, music or speech.
import { mkdirSync, writeFileSync } from "node:fs";
const rate = 48000;
const length = 30 * rate;
const channels = [new Float32Array(length), new Float32Array(length)];
const tau = Math.PI * 2;
let seed = 111126;
const noise = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2147483648 - 1;
};
function add(start, duration, pan, sample) {
  const offset = Math.round(start * rate);
  for (let i = 0; i < duration * rate && offset + i < length; i++) {
    const t = i / rate;
    const v = sample(t) * Math.min(1, t / 0.009, (duration - t) / 0.08);
    channels[0][offset + i] += v * Math.sqrt((1 - pan) / 2);
    channels[1][offset + i] += v * Math.sqrt((1 + pan) / 2);
  }
}
function pulse(start, hz, gain, pan = 0, duration = 0.9) {
  add(
    start,
    duration,
    pan,
    (t) =>
      gain *
      (Math.sin(tau * hz * t) * Math.exp(-7 * t) +
        0.3 * Math.sin(tau * hz * 2.004 * t) * Math.exp(-10 * t) +
        0.12 * Math.sin(tau * hz * 4.02 * t) * Math.exp(-16 * t)),
  );
}
function sweep(start, duration, pan, gain) {
  let slow = 0;
  let fast = 0;
  add(start, duration, pan, (t) => {
    const n = noise();
    slow += 0.014 * (n - slow);
    fast += 0.15 * (n - fast);
    return gain * (fast - slow) * Math.sin((Math.PI * t) / duration) ** 2;
  });
}
// Landings follow the authored text entrances, with quiet space to read.
sweep(0, 0.7, 0, 0.18);
pulse(0.18, 130.81, 0.4);
pulse(1.05, 523.25, 0.13, 0.15);
sweep(4.85, 0.45, 0.15, 0.28);
pulse(5.18, 164.81, 0.44, 0.12);
sweep(7.35, 0.45, -0.15, 0.28);
pulse(7.68, 196, 0.44, -0.12);
sweep(9.85, 0.45, 0.12, 0.28);
pulse(10.18, 261.63, 0.44, 0.12);
pulse(12.65, 392, 0.15, -0.28);
sweep(13.9, 0.9, 0, 0.35);
pulse(14.8, 130.81, 0.5);
pulse(14.88, 523.25, 0.16, 0.18, 1.5);
sweep(18.85, 0.5, 0.12, 0.24);
pulse(19.2, 196, 0.43);
pulse(20.25, 392, 0.15, -0.16);
// Restrained bespoke ending, not the sonic-v1 signature.
sweep(24.85, 0.6, 0, 0.22);
pulse(25.25, 130.81, 0.37);
pulse(25.42, 329.63, 0.16, -0.18, 1.6);
pulse(25.65, 523.25, 0.18, 0.18, 1.9);
pulse(26.35, 659.25, 0.08, 0.1, 1.3);
let peak = 0;
for (const channel of channels)
  for (const v of channel) peak = Math.max(peak, Math.abs(v));
const gain = 0.55 / peak;
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
for (let i = 0; i < length; i++) {
  wav.writeInt16LE(Math.round(channels[0][i] * gain * 32767), 44 + i * 4);
  wav.writeInt16LE(Math.round(channels[1][i] * gain * 32767), 46 + i * 4);
}
const directory = new URL("../public/brand-motion/", import.meta.url);
mkdirSync(directory, { recursive: true });
writeFileSync(new URL("effects.wav", directory), wav);
console.log(
  JSON.stringify({
    duration: 30,
    sampleRate: rate,
    channels: 2,
    peakDbfs: 20 * Math.log10(0.55),
  }),
);
