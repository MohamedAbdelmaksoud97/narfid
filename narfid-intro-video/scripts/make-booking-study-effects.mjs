// Original synthesized foley for the booking study. No recordings or samples.
import { mkdirSync, writeFileSync } from "node:fs";

const rate = 48000;
const length = 7.5 * rate;
const channels = [new Float32Array(length), new Float32Array(length)];
const tau = 2 * Math.PI;
let seed = 8439;

function noise() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2147483648 - 1;
}

function add(start, duration, pan, sample) {
  const offset = Math.round(start * rate);
  const left = Math.sqrt((1 - pan) / 2);
  const right = Math.sqrt((1 + pan) / 2);
  for (let i = 0; i < Math.round(duration * rate); i++) {
    const t = i / rate;
    const tail = Math.min(1, (duration - t) / 0.045);
    const value = tail * sample(t);
    channels[0][offset + i] += value * left;
    channels[1][offset + i] += value * right;
  }
}

function impact(start, duration, pan, gain, modes, grain = 0) {
  let last = 0;
  add(start, duration, pan, (t) => {
    const white = noise();
    last += 0.23 * (white - last);
    const body = modes.reduce(
      (sum, [hz, amplitude, damping]) =>
        sum + amplitude * Math.sin(tau * hz * t) * Math.exp(-damping * t),
      0,
    );
    return (
      gain * Math.min(1, t / 0.004) * (body + grain * last * Math.exp(-60 * t))
    );
  });
}

function movement(start, duration, pan, gain) {
  let low = 0;
  let mid = 0;
  add(start, duration, pan, (t) => {
    const white = noise();
    low += 0.025 * (white - low);
    mid += 0.12 * (white - mid);
    return gain * (mid - low) * Math.sin((Math.PI * t) / duration) ** 2;
  });
}

// Typography lands, the table takes the frame, then the cursor presses the badge.
impact(
  0,
  0.38,
  0,
  0.72,
  [
    [96, 0.61, 8],
    [218, 0.23, 18],
    [510, 0.09, 33],
  ],
  0.12,
);
movement(0.04, 0.48, 0.19, 0.22);
impact(
  1.8,
  0.42,
  0.14,
  0.58,
  [
    [138, 0.56, 9],
    [324, 0.29, 20],
    [620, 0.12, 34],
  ],
  0.36,
);
movement(3.61, 0.27, -0.27, 0.25);
impact(
  116 / 30,
  0.18,
  -0.27,
  0.54,
  [
    [248, 0.43, 32],
    [773, 0.41, 48],
    [1611, 0.2, 70],
  ],
  0.46,
);

// A brief layer follows the push into the badge, then the confirmation lands.
movement(4.57, 0.76, -0.11, 0.29);
impact(
  5.3,
  0.63,
  0,
  0.74,
  [
    [124, 0.54, 7],
    [271, 0.23, 13],
    [664, 0.14, 26],
  ],
  0.12,
);
impact(5.37, 0.95, 0.18, 0.27, [
  [710, 0.54, 7],
  [1123, 0.27, 12],
  [1906, 0.13, 23],
]);
impact(
  5.75,
  0.25,
  -0.1,
  0.17,
  [
    [360, 0.32, 16],
    [920, 0.42, 33],
  ],
  0.16,
);

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

let peak = 0;
for (const channel of channels) {
  for (const sample of channel) peak = Math.max(peak, Math.abs(sample));
}
const gain = 0.69 / peak;
for (let i = 0; i < length; i++) {
  wav.writeInt16LE(Math.round(channels[0][i] * gain * 32767), 44 + i * 4);
  wav.writeInt16LE(Math.round(channels[1][i] * gain * 32767), 46 + i * 4);
}

const directory = new URL("../public/booking-study/", import.meta.url);
mkdirSync(directory, { recursive: true });
writeFileSync(new URL("effects.wav", directory), wav);
