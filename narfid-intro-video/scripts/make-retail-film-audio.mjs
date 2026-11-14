import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const video = fileURLToPath(new URL("../", import.meta.url));
const out = join(video, "public/retail-film/audio");
const sampleRate = 48000;
const tau = 2 * Math.PI;
const ffmpeg = join(
  video,
  "node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe",
);
mkdirSync(out, { recursive: true });

function noise(seed) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return 2 * (seed / 4294967296) - 1;
  };
}

function softEdge(t, duration, rise = 0.007, tail = 0.035) {
  return Math.max(0, Math.min(1, t / rise, (duration - t) / tail));
}

function track(duration) {
  const count = Math.round(duration * sampleRate);
  const left = new Float32Array(count);
  const right = new Float32Array(count);

  function add(start, length, voice, pan = 0) {
    const first = Math.round(start * sampleRate);
    const total = Math.min(count - first, Math.round(length * sampleRate));
    const angle = ((pan + 1) * Math.PI) / 4;
    for (let i = 0; i < total; i++) {
      const value = voice(i / sampleRate);
      left[first + i] += value * Math.cos(angle);
      right[first + i] += value * Math.sin(angle);
    }
  }

  function output(name, gain = () => 1, compressed = false) {
    const pcm = Buffer.alloc(44 + count * 4);
    pcm.write("RIFF");
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
    pcm.writeUInt32LE(count * 4, 40);
    for (let i = 0; i < count; i++) {
      const volume = gain(i / sampleRate) * 1.4;
      const a = left[i] * volume;
      const b = right[i] * volume;
      if (Math.max(Math.abs(a), Math.abs(b)) >= 1)
        throw Error("Clipping in " + name);
      pcm.writeInt16LE(Math.round(a * 32767), 44 + i * 4);
      pcm.writeInt16LE(Math.round(b * 32767), 46 + i * 4);
    }
    if (compressed) {
      execFileSync(
        ffmpeg,
        [
          "-y",
          "-hide_banner",
          "-loglevel",
          "error",
          "-f",
          "wav",
          "-i",
          "pipe:0",
          "-c:a",
          "libmp3lame",
          "-b:a",
          "256k",
          join(out, name + ".mp3"),
        ],
        { input: pcm },
      );
    } else {
      writeFileSync(join(out, name + ".wav"), pcm);
    }
  }

  return { add, output };
}

function impact(seed, gain, pitch, decay) {
  const rand = noise(seed);
  return (t) => {
    const wood = Math.sin(tau * 185 * pitch * t) * Math.exp(-t * decay);
    const bottle = Math.sin(tau * 510 * pitch * t) * Math.exp(-t * 2.4 * decay);
    const touch = rand() * Math.exp(-t * 150);
    return (
      gain *
      softEdge(t, 0.43, 0.002) *
      (wood * 0.54 + bottle * 0.28 + touch * 0.53)
    );
  };
}

function texture(seed, duration, level, smoothing, grit) {
  const rand = noise(seed);
  let low = 0;
  return (t) => {
    const sample = rand();
    low += smoothing * (sample - low);
    const peaks =
      0.65 + 0.24 * Math.sin(tau * 34 * t) + 0.11 * Math.sin(tau * 59 * t);
    return (
      softEdge(t, duration, 0.028, 0.17) *
      level *
      peaks *
      (low + grit * (sample - low))
    );
  };
}

function key(midi, duration, level, attack = 0.035) {
  const f = 440 * 2 ** ((midi - 69) / 12);
  return (t) => {
    const envelope =
      softEdge(t, duration, attack, duration * 0.72) * Math.exp(-1.05 * t);
    const tone =
      Math.sin(tau * f * t) +
      0.23 * Math.sin(tau * f * 2.003 * t) * Math.exp(-4.2 * t) +
      0.075 * Math.sin(tau * f * 3.01 * t) * Math.exp(-6 * t);
    return level * envelope * tone;
  };
}

const room = track(5.36);
room.add(0, 5.36, texture(19, 5.36, 0.1, 0.003, 0.03), -0.28);
room.add(0, 5.36, texture(72, 5.36, 0.09, 0.004, 0.04), 0.27);
room.output("room", (t) => (t < 1.25 ? 1 : 0.55), true);

const shelf = track(0.59);
shelf.add(0, 0.51, texture(53, 0.51, 0.2, 0.19, 0.48), 0.24);
shelf.output("shelf");

const bottle = track(0.58);
bottle.add(0.006, 0.42, impact(268, 0.59, 1, 24), 0.07);
bottle.add(0.077, 0.32, impact(100, 0.16, 1.64, 45), 0.17);
bottle.output("bottle");

const tape = track(0.89);
tape.add(0, 0.61, texture(11, 0.61, 0.42, 0.14, 0.65), -0.23);
tape.add(0.49, 0.34, texture(13, 0.34, 0.51, 0.24, 0.6), 0.19);
tape.output("tape");

const pack = track(0.79);
pack.add(0, 0.42, impact(20, 0.29, 1.26, 39), -0.27);
pack.add(0.18, 0.43, impact(30, 0.25, 1.43, 40), 0.34);
pack.add(0.43, 0.29, texture(44, 0.29, 0.13, 0.1, 0.45), 0.13);
pack.output("pack");

const receipt = track(0.59);
receipt.add(0, 0.35, impact(145, 0.35, 1.61, 44), -0.03);
receipt.add(0.026, 0.51, key(69, 0.51, 0.125, 0.016), 0.12);
receipt.output("receipt");

const pass = track(0.9);
pass.add(0, 0.9, texture(811, 0.9, 0.18, 0.028, 0.049), -0.18);
pass.output("pass", (t) => Math.pow(Math.sin((Math.PI * t) / 0.9), 2));

const checkout = track(0.58);
checkout.add(0, 0.36, impact(124, 0.46, 1.27, 42), 0.13);
checkout.output("checkout");

const balance = track(0.72);
balance.add(0, 0.43, impact(268, 0.56, 0.87, 29), 0.02);
balance.add(0.031, 0.61, key(64, 0.61, 0.16, 0.026), -0.08);
balance.output("balance");

const scoreStart = 172 / 30;
const score = track((1170 - 172) / 30);
function scoreNote(time, midi, duration, gain, pan) {
  score.add(time - scoreStart, duration, key(midi, duration, gain), pan);
}

scoreNote(5.83, 52, 1.78, 0.27, -0.13);
scoreNote(6.4, 64, 1.48, 0.18, 0.16);
scoreNote(7.69, 67, 1.13, 0.22, 0.09);
scoreNote(9.64, 71, 1.52, 0.21, -0.1);
scoreNote(10.43, 67, 1.12, 0.17, 0.18);
scoreNote(12.56, 48, 2.58, 0.27, -0.15);
scoreNote(13.12, 64, 1.53, 0.2, 0.2);
scoreNote(14.19, 67, 1.22, 0.16, 0.08);
scoreNote(15.46, 50, 2.4, 0.28, -0.16);
scoreNote(16.12, 66, 1.6, 0.2, 0.16);
scoreNote(17.2, 69, 1.23, 0.2, 0.04);
scoreNote(18.13, 74, 0.9, 0.16, -0.09);
scoreNote(20.06, 52, 2.42, 0.29, -0.13);
scoreNote(20.55, 67, 1.38, 0.22, 0.15);
scoreNote(22.15, 71, 1.45, 0.22, -0.06);
scoreNote(23.26, 69, 1.32, 0.18, 0.14);
scoreNote(25.58, 52, 2.54, 0.29, -0.16);
scoreNote(26.23, 64, 1.57, 0.21, 0.17);
scoreNote(27.23, 67, 1.52, 0.18, -0.06);
scoreNote(28.68, 71, 1.71, 0.22, 0.13);
scoreNote(29.69, 67, 1.14, 0.14, -0.12);
scoreNote(32.04, 55, 3.89, 0.16, -0.14);
scoreNote(33.79, 62, 3.69, 0.12, 0.17);
scoreNote(35.38, 64, 3.08, 0.14, 0.03);

for (let time = 6.1; time < 30.5; time += 0.77) {
  const t0 = time;
  score.add(
    t0 - scoreStart,
    0.21,
    (t) =>
      Math.sin(tau * (79 * t - 53 * t * t)) *
      softEdge(t, 0.21, 0.012, 0.12) *
      Math.exp(-t * 21) *
      0.14,
  );
}
score.output(
  "score",
  (time) => {
    const now = time + scoreStart;
    const windows = [
      [8.87, 0.32],
      [11.9, 0.58],
      [19.2, 0.52],
      [24.9, 0.65],
    ];
    return Math.min(
      1,
      ...windows.map(([point, radius]) => {
        const distance = Math.abs(point - now);
        return distance > radius
          ? 1
          : 0.2 + 0.8 * Math.pow(distance / radius, 2.6);
      }),
    );
  },
  true,
);

const end = track(4.3);
end.add(0, 0.36, impact(268, 0.37, 1.05, 38), -0.08);
end.add(0.1, 2.16, key(64, 2.16, 0.32), 0.13);
end.add(0.46, 3.72, key(71, 3.72, 0.27, 0.072), -0.08);
end.add(0.51, 3.4, key(52, 3.4, 0.22, 0.12), 0.02);
end.output("end");
