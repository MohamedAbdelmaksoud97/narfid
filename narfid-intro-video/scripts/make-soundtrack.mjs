// Original, deterministic instrumental bed. No samples or third-party recording.
import { writeFileSync } from "node:fs";
const rate = 22050;
const seconds = 60;
const buffer = Buffer.alloc(44 + rate * seconds * 2);
buffer.write("RIFF", 0);
buffer.writeUInt32LE(buffer.length - 8, 4);
buffer.write("WAVEfmt ", 8);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(1, 22);
buffer.writeUInt32LE(rate, 24);
buffer.writeUInt32LE(rate * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(buffer.length - 44, 40);
const chords = [
  [146.83, 220, 293.66, 349.23],
  [130.81, 196, 261.63, 329.63],
  [116.54, 174.61, 233.08, 293.66],
  [130.81, 196, 261.63, 349.23],
];
for (let i = 0; i < rate * seconds; i++) {
  const t = i / rate;
  const chord = chords[Math.floor(t / 4) % 4];
  const beat = t % 0.5;
  let value = chord.reduce(
    (sum, f) => sum + Math.sin(2 * Math.PI * f * t) * 0.022,
    0,
  );
  const note = chord[Math.floor(t * 4) % 4] * 2;
  value +=
    Math.sin(2 * Math.PI * note * t) * Math.exp(-(t % 0.25) * 15) * 0.075;
  value +=
    Math.sin(2 * Math.PI * (48 * beat + 0.8 * (1 - Math.exp(-30 * beat)))) *
    Math.exp(-beat * 20) *
    0.13;
  const fade = Math.min(1, t / 2, (seconds - t) / 3);
  buffer.writeInt16LE(Math.round(Math.tanh(value) * fade * 28000), 44 + i * 2);
}
writeFileSync(new URL("../public/narfid-theme.wav", import.meta.url), buffer);
