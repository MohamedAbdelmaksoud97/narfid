import { mkdirSync, writeFileSync } from "node:fs";

const sampleRate = 48_000;
const output = new URL("../public/freeze-policy/audio/", import.meta.url);
mkdirSync(output, { recursive: true });

let seed = 4317;

function contact([frequency, decay, color, delay, gain]) {
  let smooth = 0;
  let previous = 0;
  return (time) => {
    const t = time - delay / 1000;
    if (t < 0) return 0;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const noise = seed / 2147483648 - 1;
    smooth += 0.16 * (noise - smooth);
    const texture = noise - previous * 0.72;
    previous = noise;
    const ring = Math.sin(2 * Math.PI * frequency * t);
    const overtone = 0.21 * Math.sin(2 * Math.PI * 1.73 * frequency * t);
    return (
      gain *
      Math.min(t / 0.0014, 1) *
      Math.exp(-decay * 0.48 * t) *
      (ring + overtone + color * (0.55 * texture + smooth) * Math.exp(-130 * t))
    );
  };
}

function writeEffect(name, milliseconds, peakDb, ...layers) {
  const length = Math.round((sampleRate * milliseconds) / 1000);
  const voices = layers.map(contact);
  const samples = Float64Array.from({ length }, (_, index) => {
    const t = index / sampleRate;
    const release = Math.min(1, (length - 1 - index) / (sampleRate * 0.012));
    return voices.reduce((sum, voice) => sum + voice(t), 0) * release;
  });
  const peak = Math.max(...samples.map(Math.abs));
  const level = 32767 * 10 ** (peakDb / 20);
  const wav = Buffer.alloc(44 + length * 4);
  wav.write("RIFF", 0);
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
  wav.writeUInt32LE(length * 4, 40);
  for (let i = 0; i < length; i++) {
    // Soft saturation gives small speakers more body while keeping headroom.
    const value = Math.round(Math.tanh(2.45 * (samples[i] / peak)) * level);
    wav.writeInt16LE(value, 44 + 4 * i);
    wav.writeInt16LE(value, 46 + 4 * i);
  }
  writeFileSync(new URL(`${name}.wav`, output), wav);
}

// Each layer is frequency, decay, noise color, onset in milliseconds, and gain.
writeEffect(
  "felt",
  175,
  -5,
  [212, 56, 0.8, 0, 1],
  [138, 48, 0.23, 4, 0.8],
  [405, 74, 0.4, 12, 0.52],
);
writeEffect("wood", 92, -10, [710, 124, 1.6, 0, 1], [370, 118, 0.6, 2, 0.64]);
writeEffect(
  "wood-soft",
  75,
  -12,
  [620, 127, 1.2, 0, 1],
  [970, 173, 0, 4, 0.24],
);
writeEffect(
  "rubber",
  136,
  -7,
  [318, 73, 0.9, 0, 1],
  [486, 79, 1.12, 7, 0.65],
  [690, 114, 0.39, 15, 0.28],
);
writeEffect(
  "date",
  104,
  -8,
  [1395, 162, 1.12, 0, 0.8],
  [610, 100, 0.7, 5, 1],
  [310, 105, 0.25, 12, 0.6],
);
writeEffect(
  "button",
  122,
  -6,
  [710, 172, 2.4, 0, 1],
  [310, 77, 0.74, 11, 0.85],
);
writeEffect("key", 80, -11, [840, 152, 2.1, 0, 1], [420, 107, 0.16, 7, 0.45]);
writeEffect(
  "toggle",
  145,
  -7,
  [625, 142, 1.8, 0, 1],
  [430, 110, 0.8, 29, 0.79],
);
writeEffect(
  "saved",
  206,
  -4.5,
  [557, 86, 0.94, 0, 0.82],
  [341, 50, 0.73, 42, 1],
  [705, 91, 0.26, 49, 0.45],
);
writeEffect(
  "tooth",
  70,
  -10,
  [1875, 218, 1.65, 0, 1],
  [510, 157, 0.67, 0, 0.3],
);
writeEffect(
  "lock",
  210,
  -2.8,
  [560, 100, 1.5, 0, 0.65],
  [166, 35, 0.47, 10, 1],
  [329, 52, 0.6, 25, 0.58],
  [960, 103, 1.08, 49, 0.45],
);
writeEffect(
  "snap",
  176,
  -4.5,
  [458, 81, 1.23, 0, 1],
  [200, 51, 0.52, 4, 0.7],
  [732, 103, 1.02, 36, 0.4],
);
writeEffect(
  "release",
  209,
  -3.1,
  [960, 143, 1.8, 0, 0.8],
  [1700, 161, 1.34, 22, 0.7],
  [335, 55, 0.7, 34, 1],
  [606, 77, 0.37, 68, 0.35],
);
writeEffect(
  "counter",
  116,
  -7.5,
  [1280, 133, 0.86, 0, 1],
  [305, 110, 1.01, 8, 0.39],
);
writeEffect(
  "pencil",
  72,
  -11.5,
  [1060, 139, 2.2, 0, 1],
  [460, 100, 0.47, 8, 0.46],
);
writeEffect(
  "logo",
  228,
  -4.5,
  [225, 41, 0.7, 0, 1],
  [143, 35, 0.4, 4, 0.73],
  [398, 72, 0.44, 35, 0.56],
);
