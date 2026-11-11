// Original effects for the reservation search study, synthesized without samples.
import { writeFileSync } from "node:fs";

const rate = 48000;
const length = 9.5 * rate;
const channels = [new Float32Array(length), new Float32Array(length)];
const tau = 2 * Math.PI;
let seed = 74817;

function noise() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2147483648 - 1;
}

function add(frame, seconds, pan, makeSample) {
  const offset = (frame * rate) / 30;
  const left = Math.sqrt((1 - pan) / 2);
  const right = Math.sqrt((1 + pan) / 2);
  for (let i = 0; i < seconds * rate; i++) {
    const t = i / rate;
    const gain = Math.min(1, (seconds - t) / 0.018);
    const value = makeSample(t) * gain;
    channels[0][offset + i] += value * left;
    channels[1][offset + i] += value * right;
  }
}

function contact(frame, gain, frequency, pan) {
  let felt = 0;
  add(frame, 0.13, pan, (t) => {
    const white = noise();
    felt += 0.29 * (white - felt);
    const snap = (white - felt) * Math.exp(-182 * t);
    const body = Math.sin(tau * frequency * t) * Math.exp(-56 * t);
    return gain * Math.min(1, t / 0.0016) * (snap * 0.46 + body * 0.55);
  });
}

function movement(frame, duration, pan, level) {
  let low = 0;
  let high = 0;
  add(frame, duration, pan, (t) => {
    const white = noise();
    low += 0.019 * (white - low);
    high += 0.08 * (white - high);
    return level * (high - low) * Math.sin((Math.PI * t) / duration) ** 2;
  });
}

// The product frame settles, then a pointer focus and a short run of keys.
movement(0, 0.46, 0, 0.38);
contact(78, 0.65, 214, 0.23);
const keys = [89, 93, 96, 101, 106, 110, 113, 118, 122, 126, 131];
for (const [i, frame] of keys.entries()) {
  contact(
    frame,
    0.23 + (i % 3) * 0.035,
    345 + ((i * 47) % 125),
    0.14 + (i % 4) * 0.05,
  );
}
contact(139, 0.54, 186, 0.1);

// The camera crosses the record. One soft resonant contact lands at the status.
movement(187, 1.12, -0.16, 0.44);
add(224, 0.64, -0.14, (t) => {
  const attack = Math.min(1, t / 0.005);
  const bottom = Math.sin(tau * 152 * t) * Math.exp(-12 * t);
  const body = Math.sin(tau * 393 * t) * Math.exp(-20 * t);
  const edge = Math.sin(tau * 836 * t) * Math.exp(-26 * t);
  return attack * (bottom * 0.41 + body * 0.23 + edge * 0.09);
});

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
  for (const value of channel) peak = Math.max(peak, Math.abs(value));
}
const gain = (0.61 / peak) * 32767;
for (let i = 0; i < length; i++) {
  wav.writeInt16LE(Math.round(channels[0][i] * gain), 44 + i * 4);
  wav.writeInt16LE(Math.round(channels[1][i] * gain), 46 + i * 4);
}
writeFileSync(
  new URL("../public/nv001/reservation-handoff.wav", import.meta.url),
  wav,
);
