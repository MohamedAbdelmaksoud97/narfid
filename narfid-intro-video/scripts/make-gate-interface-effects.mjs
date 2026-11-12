import { mkdirSync, writeFileSync } from "node:fs";

const sampleRate = 48000;
const output = new URL("../public/gates/interface-effects/", import.meta.url);
mkdirSync(output, { recursive: true });

const sin = (turns) => Math.sin(2 * Math.PI * turns);
const ramp = (value) => Math.min(1, Math.max(0, value));
let noiseSeed = 43819;

function texturedNoise(highRate, lowRate) {
  let fast = 0;
  let slow = 0;
  return () => {
    noiseSeed = (Math.imul(noiseSeed, 1664525) + 1013904223) >>> 0;
    const white = noiseSeed / 2147483648 - 1;
    fast += highRate * (white - fast);
    slow += lowRate * (white - slow);
    return fast - slow;
  };
}

function click(frequency, decay) {
  const texture = texturedNoise(0.24, 0.055);
  return (t) =>
    (sin(frequency * t) + 0.2 * sin(frequency * 1.83 * t) + 0.8 * texture()) *
    Math.exp(-decay * t);
}

const tone = (frequency, decay) => (t) =>
  (sin(frequency * t) + 0.09 * sin(2 * frequency * t)) * Math.exp(-decay * t);

function writeEffect(name, length, peakDb, layers) {
  const samples = Math.round(length * sampleRate);
  const channels = [new Float32Array(samples), new Float32Array(samples)];
  for (const {
    start = 0,
    duration,
    voice,
    level = 1,
    pan = 0,
    attack = 0.006,
  } of layers) {
    const offset = Math.round(start * sampleRate);
    const count = Math.round(duration * sampleRate);
    for (let i = 0; i < count && offset + i < samples; i++) {
      const t = i / sampleRate;
      const sample =
        voice(t) * level * ramp(t / attack) * ramp((duration - t) / 0.018);
      channels[0][offset + i] += sample * (1 - pan);
      channels[1][offset + i] += sample * (1 + pan);
    }
  }
  let peak = 0;
  for (const channel of channels) {
    for (const sample of channel) peak = Math.max(peak, Math.abs(sample));
  }
  const scale = (32767 * 10 ** (peakDb / 20)) / peak;
  const wav = Buffer.alloc(44 + samples * 4);
  wav.write("RIFF");
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(2, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * 4, 28);
  wav.writeUInt16LE(4, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(samples * 4, 40);
  for (let i = 0; i < samples; i++) {
    wav.writeInt16LE(Math.round(channels[0][i] * scale), 44 + i * 4);
    wav.writeInt16LE(Math.round(channels[1][i] * scale), 46 + i * 4);
  }
  writeFileSync(new URL(name + ".wav", output), wav);
}

// Short, tactile accents for the title and the membership details.
writeEffect("title", 0.17, -20, [
  { duration: 0.15, voice: click(174, 32), attack: 0.012 },
]);
writeEffect("membership", 0.21, -17, [
  { duration: 0.12, voice: click(460, 45), pan: -0.09 },
  { start: 0.065, duration: 0.14, voice: tone(590, 28), level: 0.3 },
]);

// A short data sweep resolves as the visual connection finishes.
const air = texturedNoise(0.2, 0.03);
writeEffect("sync", 0.62, -15, [
  {
    duration: 0.45,
    level: 0.48,
    pan: -0.12,
    voice: (t) =>
      (air() + 0.2 * sin(310 * t + 510 * t * t)) *
      Math.sin((Math.PI * t) / 0.45) ** 2,
  },
  { start: 0.41, duration: 0.19, voice: tone(825, 19), level: 0.55, pan: 0.1 },
]);

// The latch marks the start of gate motion. The refusal uses a muted low pulse.
const mechanism = texturedNoise(0.12, 0.025);
writeEffect("allow", 0.5, -12, [
  { duration: 0.14, voice: click(226, 32), level: 0.7 },
  { start: 0.045, duration: 0.2, voice: tone(523.25, 19), level: 0.46 },
  { start: 0.14, duration: 0.26, voice: tone(783.99, 15), level: 0.48 },
  {
    start: 0.16,
    duration: 0.3,
    voice: (t) => mechanism() * Math.sin((Math.PI * t) / 0.3) ** 2,
    level: 0.37,
    pan: -0.1,
  },
]);
writeEffect("deny", 0.26, -14, [
  { duration: 0.11, voice: click(185, 46), level: 0.65 },
  {
    start: 0.035,
    duration: 0.21,
    voice: (t) => sin(225 * t - 180 * t * t) * Math.exp(-23 * t),
    level: 0.62,
    attack: 0.012,
  },
]);

writeEffect("log", 0.24, -17, [
  { duration: 0.1, voice: click(690, 61), pan: -0.11 },
  { start: 0.09, duration: 0.12, voice: click(810, 58), level: 0.6, pan: 0.1 },
]);
for (const [step, frequency, peak] of [
  ["device", 560, -19],
  ["policy", 645, -19],
  ["test", 760, -18],
]) {
  writeEffect(step, 0.14, peak, [
    { duration: 0.13, voice: click(frequency, 51) },
  ]);
}

writeFileSync(
  new URL("provenance.json", output),
  JSON.stringify(
    {
      generator: "scripts/make-gate-interface-effects.mjs",
      source: "Original local synthesis for the gate film",
      sampleRate,
      externalSamples: false,
    },
    null,
    2,
  ) + "\n",
);
