import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const video = fileURLToPath(new URL("../", import.meta.url));
const out = join(video, "public/retail-film/audio");
const sampleRate = 48000;
const tau = 2 * Math.PI;
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

  function output(name, gain = () => 1) {
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
    writeFileSync(join(out, name + ".wav"), pcm);
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

const bottle = track(0.58);
bottle.add(0.006, 0.42, impact(268, 0.59, 1, 24), 0.07);
bottle.add(0.077, 0.32, impact(100, 0.16, 1.64, 45), 0.17);
bottle.output("bottle");

const pack = track(0.79);
pack.add(0, 0.42, impact(20, 0.29, 1.26, 39), -0.27);
pack.add(0.18, 0.43, impact(30, 0.25, 1.43, 40), 0.34);
pack.output("pack");

const receipt = track(0.59);
receipt.add(0, 0.35, impact(145, 0.35, 1.61, 44), -0.03);
receipt.output("receipt");

const pass = track(0.9);
pass.add(0, 0.9, texture(811, 0.9, 0.18, 0.028, 0.049), -0.18);
pass.output("pass", (t) => Math.pow(Math.sin((Math.PI * t) / 0.9), 2));

const checkout = track(0.58);
checkout.add(0, 0.36, impact(124, 0.46, 1.27, 42), 0.13);
checkout.output("checkout");

const balance = track(0.72);
balance.add(0, 0.43, impact(268, 0.56, 0.87, 29), 0.02);
balance.output("balance");

const end = track(0.5);
end.add(0, 0.36, impact(268, 0.37, 1.05, 38), -0.08);
end.output("end");
